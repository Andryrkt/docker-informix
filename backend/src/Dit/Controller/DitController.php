<?php

namespace App\Dit\Controller;

use App\Dit\Entity\Irium\Dit;
use App\Dit\Repository\CategorieAteAppRepository;
use App\Dit\Repository\DitRepository;
use App\Dit\Repository\MaterielRepository;
use App\Dit\Repository\WorNiveauUrgenceRepository;
use App\Dit\Repository\WorTypeDocumentRepository;
use App\Audit\Entity\AuditOperation;
use App\Dit\Service\DitFilterResolver;
use App\Dit\Service\DitPayloadFactory;
use App\Security\Entity\User;
use App\Security\Repository\AgencyRepository;
use App\Security\Repository\PersonnelRepository;
use App\Security\Repository\ServiceRepository;
use App\Shared\Service\FileUploadService;
use App\Shared\Service\NumeroGeneratorService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
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
 * La résolution des filtres de recherche (DitFilterResolver) et la construction
 * du JSON de réponse (DitPayloadFactory) sont déléguées à des services dédiés
 * au module ; l'upload des pièces jointes (FileUploadService) est partagé
 * avec les autres modules (TIK...) — ce contrôleur ne garde que
 * l'orchestration HTTP et la validation propre à la création.
 */
class DitController extends AbstractController
{
    private const TYPES_REPARATION = ['STANDARD', 'URGENTE', 'PREVENTIVE', 'CORRECTIVE'];
    private const REPARATION_PAR = ['ATE_TANA', 'ATE_POL_TANA', 'ATE_STAR', 'ATE_MAS', 'ATE_TMV', 'ATE_FTU'];
    private const DEFAULT_LIMIT = 20;

    public function __construct(
        private readonly DitRepository $ditRepo,
        private readonly MaterielRepository $materielRepo,
        private readonly WorTypeDocumentRepository $typeDocumentRepo,
        private readonly WorNiveauUrgenceRepository $niveauUrgenceRepo,
        private readonly CategorieAteAppRepository $categorieRepo,
        private readonly AgencyRepository $agencyRepo,
        private readonly ServiceRepository $serviceRepo,
        private readonly PersonnelRepository $personnelRepo,
        private readonly NumeroGeneratorService $numeroGenerator,
        private readonly DitFilterResolver $filterResolver,
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
        $data = $request->request->all();

        $objet = trim((string) ($data['objet'] ?? ''));
        $details = trim((string) ($data['details'] ?? ''));
        $typeDocument = trim((string) ($data['typeDocument'] ?? ''));
        $categorieDemande = trim((string) ($data['categorieDemande'] ?? ''));
        $livraisonPartielle = trim((string) ($data['livraisonPartielle'] ?? ''));
        $avisRecouvrement = trim((string) ($data['avisRecouvrement'] ?? ''));
        $worNiveauUrgence = trim((string) ($data['worNiveauUrgence'] ?? ''));
        $datePrevueInput = trim((string) ($data['datePrevue'] ?? ''));
        $typeReparation = trim((string) ($data['typeReparation'] ?? ''));
        $reparationPar = trim((string) ($data['reparationPar'] ?? ''));
        $idMaterielInput = trim((string) ($data['idMateriel'] ?? ''));
        $interneExterne = strtoupper(trim((string) ($data['interneExterne'] ?? '')));

        if ($objet === '' || $details === '' || $typeDocument === '' || $categorieDemande === ''
            || $livraisonPartielle === '' || $avisRecouvrement === '' || $worNiveauUrgence === ''
            || $datePrevueInput === '' || $typeReparation === '' || $reparationPar === '' || $idMaterielInput === ''
        ) {
            return $this->json(['error' => 'Objet, détails, type de document, catégorie, livraison partielle, avis de recouvrement, niveau d\'urgence, date prévue, type de réparation, réparation réalisé par et matériel sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        if (!in_array($interneExterne, ['INTERNE', 'EXTERNE'], true)) {
            return $this->json(['error' => 'Le type de demande (interne/externe) est invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (!in_array($typeReparation, self::TYPES_REPARATION, true)) {
            return $this->json(['error' => 'Type de réparation invalide.'], Response::HTTP_BAD_REQUEST);
        }

        if (!in_array($reparationPar, self::REPARATION_PAR, true)) {
            return $this->json(['error' => 'Réparation réalisé par : valeur invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $typeDocumentEntity = $this->typeDocumentRepo->findOneBy(['codeDocument' => $typeDocument]);
        if (!$typeDocumentEntity) {
            return $this->json(['error' => 'Type de document introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $niveauUrgenceEntity = $this->niveauUrgenceRepo->findOneBy(['description' => $worNiveauUrgence]);
        if (!$niveauUrgenceEntity) {
            return $this->json(['error' => 'Niveau d\'urgence introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if (!$this->categorieRepo->findOneBy(['libelle' => $categorieDemande])) {
            return $this->json(['error' => 'Catégorie de demande introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $idMateriel = (int) $idMaterielInput;
        $materiel = $this->materielRepo->find($idMateriel);
        if (!$materiel) {
            return $this->json(['error' => 'Matériel introuvable — il a peut-être été mis au rebut.'], Response::HTTP_NOT_FOUND);
        }

        $datePrevue = \DateTime::createFromFormat('Y-m-d', $datePrevueInput) ?: null;
        if (!$datePrevue) {
            return $this->json(['error' => 'Date prévue invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $agenceDebiteur = null;
        $serviceDebiteur = null;
        $demandeDevis = strtoupper(trim((string) ($data['demandeDevis'] ?? ''))) ?: 'NON';

        if ($interneExterne === 'INTERNE') {
            $agenceDebiteurId = isset($data['agenceDebiteur']) ? (int) $data['agenceDebiteur'] : null;
            $serviceDebiteurId = isset($data['serviceDebiteur']) ? (int) $data['serviceDebiteur'] : null;
            if (!$agenceDebiteurId || !$serviceDebiteurId) {
                return $this->json(['error' => 'Agence débiteur et service débiteur sont obligatoires pour une demande interne.'], Response::HTTP_BAD_REQUEST);
            }
            $agenceDebiteur = $this->agencyRepo->find($agenceDebiteurId);
            $serviceDebiteur = $this->serviceRepo->find($serviceDebiteurId);
            if (!$agenceDebiteur || !$serviceDebiteur) {
                return $this->json(['error' => 'Agence ou service débiteur introuvable.'], Response::HTTP_NOT_FOUND);
            }
        } else {
            $numClient = trim((string) ($data['numClient'] ?? ''));
            $nomClient = trim((string) ($data['nomClient'] ?? ''));
            $telephoneClient = trim((string) ($data['telephoneClient'] ?? ''));
            $emailClient = trim((string) ($data['emailClient'] ?? ''));
            $clientSousContrat = trim((string) ($data['clientSousContrat'] ?? ''));

            if ($numClient === '' || $nomClient === '' || $telephoneClient === '' || $emailClient === '' || $clientSousContrat === '') {
                return $this->json(['error' => 'Les informations client (numéro, nom, téléphone, e-mail, contrat) sont obligatoires pour une demande externe.'], Response::HTTP_BAD_REQUEST);
            }
            if (!filter_var($emailClient, FILTER_VALIDATE_EMAIL)) {
                return $this->json(['error' => 'E-mail client invalide.'], Response::HTTP_BAD_REQUEST);
            }
            if (trim((string) ($data['demandeDevis'] ?? '')) === '') {
                return $this->json(['error' => 'La demande de devis est obligatoire pour une demande externe.'], Response::HTTP_BAD_REQUEST);
            }
        }

        [$agenceEmetteur, $serviceEmetteur, $codeSociete] = $this->resolveDefaultAgenceService($user);
        if (!$agenceEmetteur || !$serviceEmetteur) {
            return $this->json(['error' => 'Agence/service émetteur introuvables pour cet utilisateur — vérifier sa fiche Personnel.'], Response::HTTP_CONFLICT);
        }

        $numero = $this->numeroGenerator->generer(AuditOperation::DOC_DIT, increment: false);

        $fileError = null;
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
                break;
            }
            $storedFiles[$slot] = $storedName;
        }
        if ($fileError) {
            return $this->json(['error' => $fileError], Response::HTTP_BAD_REQUEST);
        }

        $dit = new Dit();
        $dit->setNumeroDemandeDit($numero);
        $dit->setCodeSociete($codeSociete);
        $dit->setTypeDocument($typeDocumentEntity->getCodeDocument());
        $dit->setTypeReparation($typeReparation);
        $dit->setReparationRealise($reparationPar);
        $dit->setCategorieDemande($categorieDemande);
        $dit->setInterneExterne($interneExterne);
        $dit->setAgenceServiceEmetteur($agenceEmetteur->getCode() . '-' . $serviceEmetteur->getCode());
        $dit->setAgenceEmetteurId($agenceEmetteur->getId());
        $dit->setServiceEmetteurId($serviceEmetteur->getId());
        $dit->setDatePrevueTravaux($datePrevue);
        $dit->setDemandeDevis($demandeDevis ?: 'NON');
        $dit->setIdNiveauUrgence($niveauUrgenceEntity->getId());
        $dit->setAvisRecouvrement($avisRecouvrement);
        $dit->setObjetDemande($objet);
        $dit->setDetailDemande($details);
        $dit->setLivraisonPartiel($livraisonPartielle);
        $dit->setIdMateriel($idMateriel);
        $dit->setMailDemandeur($user->getEmail() ?? '');
        $dit->setDateDemande(new \DateTime());
        $dit->setHeureDemande((new \DateTime())->format('H:i'));
        $dit->setPieceJoint($storedFiles['pieceJoint']);
        $dit->setPieceJoint1($storedFiles['pieceJoint1']);
        $dit->setPieceJoint2($storedFiles['pieceJoint2']);
        $dit->setUtilisateurDemandeur($user->getDisplayName() ?? $user->getUsername());
        $dit->setIdStatutDemande(Dit::STATUT_A_AFFECTER_ID);

        if ($agenceDebiteur && $serviceDebiteur) {
            $dit->setAgenceServiceDebiteur($agenceDebiteur->getCode() . '-' . $serviceDebiteur->getCode());
            $dit->setAgenceDebiteurId($agenceDebiteur->getId());
            $dit->setServiceDebiteurId($serviceDebiteur->getId());
        } else {
            $dit->setNumeroClient(trim((string) ($data['numClient'] ?? '')));
            $dit->setLibelleClient(trim((string) ($data['nomClient'] ?? '')));
            $dit->setNomClient(trim((string) ($data['nomClient'] ?? '')));
            $dit->setNumeroTelephone(trim((string) ($data['telephoneClient'] ?? '')));
            $dit->setMailClient(trim((string) ($data['emailClient'] ?? '')));
            $dit->setClientSousContrat(trim((string) ($data['clientSousContrat'] ?? '')));
        }

        $em = $this->ditRepo->getEntityManager();
        $em->persist($dit);
        $em->flush();

        return $this->json($this->payloadFactory->serialize($dit), Response::HTTP_CREATED);
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
