<?php

namespace App\Dit\Controller;

use App\Dit\Entity\Irium\Dit;
use App\Dit\Repository\CategorieAteAppRepository;
use App\Dit\Repository\DitRepository;
use App\Dit\Repository\MaterielRepository;
use App\Dit\Repository\StatutDemandeRepository;
use App\Dit\Repository\WorNiveauUrgenceRepository;
use App\Dit\Repository\WorTypeDocumentRepository;
use App\Dit\Service\DitNumeroService;
use App\Security\Entity\User;
use App\Security\Repository\AgencyRepository;
use App\Security\Repository\PersonnelRepository;
use App\Security\Repository\ServiceRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelInterface;
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
 */
class DitController extends AbstractController
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    private const TYPES_REPARATION = ['STANDARD', 'URGENTE', 'PREVENTIVE', 'CORRECTIVE'];
    private const REPARATION_PAR = ['ATE_TANA', 'ATE_POL_TANA', 'ATE_STAR', 'ATE_MAS', 'ATE_TMV', 'ATE_FTU'];
    private const DEFAULT_LIMIT = 20;

    public function __construct(
        private readonly DitRepository $ditRepo,
        private readonly MaterielRepository $materielRepo,
        private readonly WorTypeDocumentRepository $typeDocumentRepo,
        private readonly WorNiveauUrgenceRepository $niveauUrgenceRepo,
        private readonly CategorieAteAppRepository $categorieRepo,
        private readonly StatutDemandeRepository $statutRepo,
        private readonly AgencyRepository $agencyRepo,
        private readonly ServiceRepository $serviceRepo,
        private readonly PersonnelRepository $personnelRepo,
        private readonly DitNumeroService $numeroService,
        private readonly KernelInterface $kernel
    ) {}

    #[Route('/api/demande-intervention/liste', methods: ['GET'])]
    public function liste(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, (int) $request->query->get('limit', self::DEFAULT_LIMIT));

        [$dits, $total] = $this->ditRepo->findPaginated($page, $limit);

        return $this->json([
            'data' => array_map(fn(Dit $d) => $this->serialize($d), $dits),
            'current_page' => $page,
            'totalPages' => (int) ceil($total / $limit),
            'resultat' => $total,
        ]);
    }

    #[Route('/api/demande-intervention/details/{numero}', methods: ['GET'])]
    public function details(string $numero): JsonResponse
    {
        $dit = $this->ditRepo->findByNumero($numero);
        if (!$dit) {
            return $this->json(['error' => 'DIT introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serialize($dit));
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

        $numero = $this->numeroService->genererNumero();

        $fileError = null;
        $storedFiles = ['pieceJoint' => null, 'pieceJoint1' => null, 'pieceJoint2' => null];
        foreach (array_keys($storedFiles) as $slot) {
            /** @var UploadedFile[] $files */
            $files = $request->files->all($slot) ?: [];
            $file = $files[0] ?? null;
            if (!$file) {
                continue;
            }
            [$fileError, $storedName] = $this->validateAndStoreFile($file, $numero);
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

        return $this->json($this->serialize($dit), Response::HTTP_CREATED);
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

        $path = $this->uploadDir($numero) . '/' . $storedName;
        if (!is_file($path)) {
            return $this->json(['error' => 'Fichier introuvable sur le serveur.'], Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse($path);
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $storedName);

        return $response;
    }

    // ── Aides privées ─────────────────────────────────────────────────────────

    private function uploadDir(string $numero): string
    {
        $dir = $this->kernel->getProjectDir() . '/var/uploads/dit/' . $numero;
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir;
    }

    private function validateAndStoreFile(UploadedFile $file, string $numero): array
    {
        if (!$file->isValid()) {
            return ["Le fichier \"{$file->getClientOriginalName()}\" n'a pas pu être envoyé.", null];
        }
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return ["Le fichier \"{$file->getClientOriginalName()}\" dépasse la taille maximale de 5 Mo.", null];
        }
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES, true)) {
            return ["Le fichier \"{$file->getClientOriginalName()}\" n'est pas d'un type autorisé (PDF, image, Office).", null];
        }

        $storedName = uniqid('', true) . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $file->getClientOriginalName());
        $file->move($this->uploadDir($numero), $storedName);

        return [null, $storedName];
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

    /**
     * Résout un libellé "code NOM" pour l'agence et le service à partir du
     * champ dénormalisé "codeAgence-codeService" (ex: "80-INF").
     *
     * Les colonnes agence_emetteur_id/service_emetteur_id/agence_debiteur_id/
     * service_debiteur_id de la table legacy référencent un schéma d'id
     * différent de celui d'App\Security\Entity\Agency/Service dans ce backend
     * (ex: agence_emetteur_id=8 alors qu'app_agency va de 25 à 36) — elles ne
     * sont donc PAS utilisables pour résoudre l'agence/service en toute
     * fiabilité sur les ~23k DIT déjà existantes. Le champ dénormalisé
     * "codeAgence-codeService", lui, est cohérent aussi bien sur les données
     * legacy que sur celles créées par ce module (voir createDit()).
     *
     * @return array{0: ?string, 1: ?string}
     */
    private function resolveAgenceServiceLabels(?string $codePair): array
    {
        if (!$codePair || !str_contains($codePair, '-')) {
            return [null, null];
        }

        [$agenceCode, $serviceCode] = explode('-', $codePair, 2);
        $agence = $this->agencyRepo->findOneBy(['code' => trim($agenceCode)]);
        $service = $this->serviceRepo->findOneBy(['code' => trim($serviceCode)]);

        return [
            $agence ? $agence->getCode() . ' ' . $agence->getName() : $codePair,
            $service ? $service->getCode() . ' ' . $service->getName() : null,
        ];
    }

    /**
     * demande_intervention.type_document stocke tantôt le code (3 lettres,
     * ex: "MAC" — convention créée par ce module) tantôt l'id numérique brut
     * de wor_type_document (ex: "1" — convention des DIT plus anciennes,
     * jamais migrées). On tente les deux avant de retomber sur la valeur
     * brute si rien ne correspond.
     */
    private function resolveTypeDocumentLabel(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }

        $entity = $this->typeDocumentRepo->findOneBy(['codeDocument' => $raw]);
        if (!$entity && ctype_digit($raw)) {
            $entity = $this->typeDocumentRepo->find((int) $raw);
        }

        return $entity ? self::toUtf8($entity->getDescription()) : $raw;
    }

    /**
     * Même situation que type_document : demande_intervention.categorie_demande
     * stocke tantôt le libellé (ex: "REPARATION") tantôt l'id numérique brut
     * de categorie_ate_app (ex: "1") sur les DIT les plus anciennes.
     */
    private function resolveCategorieDemandeLabel(?string $raw): ?string
    {
        if (!$raw) {
            return null;
        }

        $entity = $this->categorieRepo->findOneBy(['libelle' => $raw]);
        if (!$entity && ctype_digit($raw)) {
            $entity = $this->categorieRepo->find((int) $raw);
        }

        return $entity ? self::toUtf8($entity->getLibelle()) : $raw;
    }

    private function serialize(Dit $dit): array
    {
        return self::sanitizeUtf8($this->buildDitPayload($dit));
    }

    private function buildDitPayload(Dit $dit): array
    {
        $materiel = $this->materielRepo->find($dit->getIdMateriel());
        [$agenceEmetteurLabel, $serviceEmetteurLabel] = $this->resolveAgenceServiceLabels($dit->getAgenceServiceEmetteur());
        [$agenceDebiteurLabel, $serviceDebiteurLabel] = $this->resolveAgenceServiceLabels($dit->getAgenceServiceDebiteur());
        $statut = $dit->getIdStatutDemande() ? $this->statutRepo->find($dit->getIdStatutDemande()) : null;
        $typeDocumentLabel = $this->resolveTypeDocumentLabel($dit->getTypeDocument());
        $categorieDemandeLabel = $this->resolveCategorieDemandeLabel($dit->getCategorieDemande());
        $niveauUrgence = $dit->getIdNiveauUrgence() ? $this->niveauUrgenceRepo->find($dit->getIdNiveauUrgence()) : null;

        $nbrPj = count(array_filter([$dit->getPieceJoint(), $dit->getPieceJoint1(), $dit->getPieceJoint2()]));

        $fichier = fn(?string $storedName, string $slot) => $storedName ? [
            'nom' => $storedName,
            'url' => "/api/demande-intervention/{$dit->getNumeroDemandeDit()}/fichiers/{$slot}",
        ] : null;

        return [
            'id' => $dit->getId(),
            'numeroDemandeIntervention' => $dit->getNumeroDemandeDit(),
            'idStatutDemande' => $dit->getIdStatutDemande(),
            'objet' => $dit->getObjetDemande(),
            'details' => $dit->getDetailDemande(),
            'statutDemande' => $statut?->getDescription(),
            'demandeDevis' => $dit->getDemandeDevis(),
            'livraisonPartielle' => $dit->getLivraisonPartiel(),
            'avisRecouvrement' => $dit->getAvisRecouvrement(),
            'typeDocument' => $typeDocumentLabel,
            'categorieDemande' => $categorieDemandeLabel,
            'interneExterne' => $dit->getInterneExterne(),
            'reparationRealise' => $dit->getReparationRealise(),
            'worNiveauUrgence' => $niveauUrgence?->getDescription(),
            'idMateriel' => (string) $dit->getIdMateriel(),
            'numSerie' => $materiel?->getNumSerie(),
            'numParc' => $materiel?->getNumParc(),
            'dateDemande' => $dit->getDateDemande()->format('Y-m-d'),
            'agenceEmetteur' => $agenceEmetteurLabel,
            'serviceEmmetteur' => $serviceEmetteurLabel,
            'datePrevue' => $dit->getDatePrevueTravaux()?->format('Y-m-d'),
            'typeReparation' => $dit->getTypeReparation(),
            'reparationPar' => $dit->getReparationRealise(),
            'agenceDebiteur' => $agenceDebiteurLabel,
            'serviceDebiteur' => $serviceDebiteurLabel,
            'sectionAffectee' => $dit->getSectionAffectee(),
            'numeroDevisRattache' => $dit->getNumeroDevisRattache(),
            'statutDevis' => $dit->getStatutDevis(),
            'numeroOr' => $dit->getNumeroOr(),
            'statutOr' => $dit->getStatutOr(),
            'montantOr' => null,
            'dateSoumissionOr' => null,
            'etatFacturation' => $dit->getEtatFacturation(),
            'ri' => $dit->getRi(),
            'utilisateurDemandeur' => $dit->getUtilisateurDemandeur(),
            'nbrPj' => $nbrPj,
            'estAnnulable' => false,
            'estOrASoumi' => false,
            'quantiteDemanderOr' => 0,
            'quantiteReserverOr' => 0,
            'quantiteLivreeOr' => 0,
            'quantiteReliquatOr' => 0,
            'qteLivOr' => 0,
            'etatLivraison' => 'Non livré',
            'numClient' => $dit->getNumeroClient(),
            'telephoneClient' => $dit->getNumeroTelephone(),
            'nomClient' => $dit->getNomClient(),
            'emailClient' => $dit->getMailClient(),
            'clientSousContrat' => $dit->getClientSousContrat(),
            'pieceJoint' => $fichier($dit->getPieceJoint(), 'pieceJoint'),
            'pieceJoint1' => $fichier($dit->getPieceJoint1(), 'pieceJoint1'),
            'pieceJoint2' => $fichier($dit->getPieceJoint2(), 'pieceJoint2'),
        ];
    }

    /**
     * Beaucoup de champs texte libres des ~23k DIT existantes (objet, détails,
     * nom client, utilisateur...) ont été écrits en ISO-8859-1 par le legacy —
     * à convertir avant tout json_encode, qui rejette les octets invalides en
     * UTF-8. Appliqué récursivement sur tout le payload plutôt que champ par
     * champ, pour ne pas avoir à traquer chaque colonne texte individuellement.
     */
    private static function toUtf8(?string $value): ?string
    {
        if ($value === null || mb_check_encoding($value, 'UTF-8')) {
            return $value;
        }

        return mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
    }

    private static function sanitizeUtf8(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = self::toUtf8($value);
            } elseif (is_array($value)) {
                $data[$key] = self::sanitizeUtf8($value);
            }
        }

        return $data;
    }
}
