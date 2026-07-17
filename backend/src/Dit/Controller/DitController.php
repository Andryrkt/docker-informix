<?php

namespace App\Dit\Controller;

use App\Dit\Entity\Irium\Dit;
use App\Dit\Repository\DitRepository;
use App\Audit\Entity\AuditOperation;
use App\Dit\Service\DitFactory;
use App\Dit\Service\DitFilterResolver;
use App\Dit\Service\DitPayloadFactory;
use App\Dit\Service\DitRequestValidator;
use App\Security\Entity\User;
use App\Security\Repository\PersonnelRepository;
use App\Shared\Service\FileUploadService;
use App\Shared\Service\NumeroGeneratorService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * DIT (Demande d'Intervention Technique) — portage "CRUD de base" du module
 * Atelier legacy (scomat). Périmètre volontairement restreint : créer,
 * lister, consulter. Clôture, sous-workflows de soumission (OR/Devis/
 * Facture/RI/BC), Dossier DIT et DOCUWARE sont hors périmètre (voir le plan).
 *
 * Chemins alignés sur ce que le frontend appelle déjà (ditApi.tsx) :
 * GET /api/demande-intervention/liste, GET /api/demande-intervention/details/{numero},
 * POST /api/createDIT (sert à la fois la création ET la duplication — le
 * frontend pré-remplit juste le formulaire et re-poste comme une création).
 *
 * La résolution des filtres de recherche (DitFilterResolver), la validation
 * de la création (DitRequestValidator) et la construction de l'entité
 * (DitFactory) / du JSON de réponse (DitPayloadFactory) sont déléguées à des
 * services dédiés au module ; l'upload des pièces jointes (FileUploadService)
 * est partagé avec les autres modules (TIK...) — ce contrôleur ne garde que
 * l'orchestration HTTP.
 */
class DitController extends AbstractController
{
    private const DEFAULT_LIMIT = 20;

    public function __construct(
        private readonly DitRepository $ditRepo,
        private readonly PersonnelRepository $personnelRepo,
        private readonly NumeroGeneratorService $numeroGenerator,
        private readonly DitFilterResolver $filterResolver,
        private readonly DitRequestValidator $requestValidator,
        private readonly DitFactory $ditFactory,
        private readonly DitPayloadFactory $payloadFactory,
        private readonly FileUploadService $fileUploadService,
    ) {}

    #[Route('/api/demande-intervention/liste', methods: ['GET'])]
    public function liste(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, (int) $request->query->get('limit', self::DEFAULT_LIMIT));
        $filters = $this->filterResolver->resolve($request);

        [$dits, $total] = $this->ditRepo->findPaginated($page, $limit, $filters);

        return $this->json([
            'data' => array_map(fn(Dit $d) => $this->payloadFactory->serialize($d), $dits),
            'current_page' => $page,
            'totalPages' => (int) ceil($total / $limit),
            'resultat' => $total,
        ]);
    }

    /**
     * Valeurs pré-remplies affichées (lecture seule) sur le formulaire de
     * création : agence/service émetteur du demandeur, dérivés de sa fiche
     * Personnel → Centre (même logique que TikController::defaults()).
     */
    #[Route('/api/demande-intervention/defaults', methods: ['GET'])]
    public function defaults(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        [$agenceEmetteur, $serviceEmetteur, $codeSociete] = $this->resolveDefaultAgenceService($user);

        return $this->json([
            'agenceEmetteur' => $agenceEmetteur ? ['id' => $agenceEmetteur->getId(), 'code' => $agenceEmetteur->getCode(), 'name' => $agenceEmetteur->getName()] : null,
            'serviceEmetteur' => $serviceEmetteur ? ['id' => $serviceEmetteur->getId(), 'code' => $serviceEmetteur->getCode(), 'name' => $serviceEmetteur->getName()] : null,
            'codeSociete' => $codeSociete,
        ]);
    }

    #[Route('/api/demande-intervention/details/{numero}', methods: ['GET'])]
    public function details(string $numero): JsonResponse
    {
        $dit = $this->ditRepo->findByNumero($numero);
        if (!$dit) {
            return $this->json(['error' => 'DIT introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->payloadFactory->serialize($dit));
    }

    #[Route('/api/createDIT', methods: ['POST'])]
    public function createDit(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        try {
            $input = $this->requestValidator->validate($request);
        } catch (HttpExceptionInterface $e) {
            return $this->json(['error' => $e->getMessage()], $e->getStatusCode());
        }

        [$agenceEmetteur, $serviceEmetteur, $codeSociete] = $this->resolveDefaultAgenceService($user);
        if (!$agenceEmetteur || !$serviceEmetteur) {
            return $this->json(['error' => 'Agence/service émetteur introuvables pour cet utilisateur — vérifier sa fiche Personnel.'], Response::HTTP_CONFLICT);
        }

        $numero = $this->numeroGenerator->generer(AuditOperation::DOC_DIT, increment: false);

        [$fileError, $storedFiles] = $this->storeAttachments($request, $numero);
        if ($fileError) {
            return $this->json(['error' => $fileError], Response::HTTP_BAD_REQUEST);
        }

        $dit = $this->ditFactory->fromInput($input, $numero, $codeSociete, $agenceEmetteur, $serviceEmetteur, $storedFiles, $user);

        $em = $this->ditRepo->getEntityManager();
        $em->persist($dit);
        $em->flush();

        return $this->json($this->payloadFactory->serialize($dit), Response::HTTP_CREATED);
    }

    /**
     * @return array{0: ?string, 1: array{pieceJoint: ?string, pieceJoint1: ?string, pieceJoint2: ?string}}
     */
    private function storeAttachments(Request $request, string $numero): array
    {
        $storedFiles = ['pieceJoint' => null, 'pieceJoint1' => null, 'pieceJoint2' => null];

        foreach (array_keys($storedFiles) as $slot) {
            /** @var UploadedFile[] $files */
            $files = $request->files->all($slot) ?: [];
            $file = $files[0] ?? null;
            if (!$file) {
                continue;
            }
            [$fileError, $storedName] = $this->fileUploadService->validateAndStore($file, 'dit', $numero);
            if ($fileError) {
                return [$fileError, $storedFiles];
            }
            $storedFiles[$slot] = $storedName;
        }

        return [null, $storedFiles];
    }

    #[Route('/api/demande-intervention/{numero}/fichiers/{slot}', methods: ['GET'])]
    public function downloadFile(string $numero, string $slot): Response
    {
        $dit = $this->ditRepo->findByNumero($numero);
        if (!$dit) {
            return $this->json(['error' => 'DIT introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $storedName = match ($slot) {
            'pieceJoint' => $dit->getPieceJoint(),
            'pieceJoint1' => $dit->getPieceJoint1(),
            'pieceJoint2' => $dit->getPieceJoint2(),
            default => null,
        };
        if (!$storedName) {
            return $this->json(['error' => 'Fichier introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $path = $this->fileUploadService->uploadDir('dit', $numero) . '/' . $storedName;
        if (!is_file($path)) {
            return $this->json(['error' => 'Fichier introuvable sur le serveur.'], Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse($path);
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $storedName);

        return $response;
    }

    /**
     * Agence/service émetteur par défaut + code société Sage, dérivés de
     * Personnel → Centre (rattaché par matricule) — même logique que Tik.
     *
     * @return array{0: ?\App\Security\Entity\Agency, 1: ?\App\Security\Entity\Service, 2: ?string}
     */
    private function resolveDefaultAgenceService(User $user): array
    {
        if (!$user->getMatricule()) {
            return [null, null, null];
        }

        $personnel = $this->personnelRepo->findOneBy(['matricule' => $user->getMatricule()]);
        $centre = $personnel?->getCentre();

        return [$centre?->getAgency(), $centre?->getService(), $centre?->getCompanyCode()];
    }
}
