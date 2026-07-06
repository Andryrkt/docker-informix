<?php

namespace App\Tik\Controller;

use App\Security\AppAction;
use App\Security\Entity\Agency;
use App\Security\Entity\AppModule;
use App\Security\Entity\Personnel;
use App\Security\Entity\Service;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use App\Security\Service\SecurityContextService;
use App\Tik\Entity\Tik;
use App\Tik\Entity\TikAutresCategorie;
use App\Tik\Entity\TikCategorie;
use App\Tik\Entity\TikHistorique;
use App\Tik\Entity\TikSousCategorie;
use App\Tik\Repository\TikHistoriqueRepository;
use App\Tik\Repository\TikRepository;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
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
 * Tickets de support informatique (module TIK, portage du legacy).
 *
 * Lecture via l'ORM (mappé sqlserver), écriture via DBAL direct — le driver
 * SQL Server custom ne convertit pas correctement un DateTime lié en
 * paramètre via l'ORM (cf. AuditService/NotificationService).
 *
 * Workflow (lot 2) — voir App\Tik\Entity\Tik pour le diagramme des statuts.
 */
#[Route('/api/tik/tickets')]
class TikController extends AbstractController
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
    private const NIVEAUX_URGENCE = ['P1', 'P2', 'P3', 'P4', 'P5'];
    private const ALLOWED_MIME_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-powerpoint', // ppt
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    ];

    public function __construct(
        private readonly EntityManagerInterface  $em,
        private readonly Connection              $conn,
        private readonly TikRepository           $tikRepo,
        private readonly TikHistoriqueRepository $historiqueRepo,
        private readonly SecurityContextService  $securityContext,
        private readonly KernelInterface         $kernel,
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json(array_map(fn(Tik $t) => $this->serialize($t, $user), $this->tikRepo->findAllOrdered()));
    }

    /**
     * Personnel éligible à être assigné comme intervenant — utilisateurs
     * ayant la permission "intervene" sur le module TIK (société active),
     * rattachés à leur fiche Personnel via matricule.
     */
    #[Route('/intervenants', methods: ['GET'])]
    public function intervenantsDisponibles(): JsonResponse
    {
        $matricules = array_filter(array_map(
            fn(User $u) => $u->getMatricule(),
            $this->usersWithTikAction(AppAction::INTERVENE),
        ));

        if (!$matricules) {
            return $this->json([]);
        }

        $personnels = $this->em->getRepository(Personnel::class)->findBy(['matricule' => array_values($matricules)]);

        return $this->json(array_map(fn(Personnel $p) => [
            'id' => $p->getId(),
            'nom' => $p->getNom(),
            'prenoms' => $p->getPrenoms(),
        ], $personnels));
    }

    /**
     * Valeurs pré-remplies affichées (lecture seule) sur le formulaire de
     * création : agence/service émetteur du demandeur, code société, et la
     * date de fin souhaitée par défaut (+2 jours ouvrés).
     */
    #[Route('/defaults', methods: ['GET'])]
    public function defaults(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        [$agenceEmetteur, $serviceEmetteur] = $this->resolveDefaultAgenceService($user);
        $company = $this->securityContext->getActiveCompany();

        return $this->json([
            'agenceEmetteur'  => $agenceEmetteur ? ['id' => $agenceEmetteur->getId(), 'code' => $agenceEmetteur->getCode(), 'name' => $agenceEmetteur->getName()] : null,
            'serviceEmetteur' => $serviceEmetteur ? ['id' => $serviceEmetteur->getId(), 'code' => $serviceEmetteur->getCode(), 'name' => $serviceEmetteur->getName()] : null,
            'codeSociete'     => $company?->getCode(),
            'dateFinSouhaiteeDefaut' => $this->addBusinessDays(new \DateTime(), 2)->format('Y-m-d'),
        ]);
    }

    #[Route('/{id}', methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serialize($tik, $user));
    }

    /**
     * Historique des changements de statut du ticket.
     */
    #[Route('/{id}/historique', methods: ['GET'])]
    public function historique(int $id): JsonResponse
    {
        if (!$this->tikRepo->find($id)) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json(array_map(fn(TikHistorique $h) => [
            'id'          => $h->getId(),
            'statut'      => $h->getStatut(),
            'commentaire' => $h->getCommentaire(),
            'user'        => $h->getUser() ? [
                'id' => $h->getUser()->getId(),
                'displayName' => $h->getUser()->getDisplayName() ?? $h->getUser()->getUsername(),
            ] : null,
            'createdAt'   => $h->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $this->historiqueRepo->findForTik($id)));
    }

    /**
     * multipart/form-data (et non JSON) : le formulaire peut inclure des
     * pièces jointes (fichiers[]).
     */
    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = $request->request->all();

        $objetDemande      = trim((string) ($data['objetDemande'] ?? ''));
        $detailDemande     = trim((string) ($data['detailDemande'] ?? ''));
        $categorieId       = isset($data['categorieId'])       ? (int) $data['categorieId']       : null;
        $agenceDebiteurId  = isset($data['agenceDebiteurId'])  ? (int) $data['agenceDebiteurId']  : null;
        $serviceDebiteurId = isset($data['serviceDebiteurId']) ? (int) $data['serviceDebiteurId'] : null;

        if ($objetDemande === '' || $detailDemande === '' || !$categorieId || !$agenceDebiteurId || !$serviceDebiteurId) {
            return $this->json(['error' => 'Objet, détail, catégorie, agence et service débiteur sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $categorie = $this->em->getRepository(TikCategorie::class)->find($categorieId);
        if (!$categorie) {
            return $this->json(['error' => 'Catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $agenceDebiteur = $this->em->getRepository(Agency::class)->find($agenceDebiteurId);
        if (!$agenceDebiteur) {
            return $this->json(['error' => 'Agence débiteur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $serviceDebiteur = $this->em->getRepository(Service::class)->find($serviceDebiteurId);
        if (!$serviceDebiteur) {
            return $this->json(['error' => 'Service débiteur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $parcInformatique = trim((string) ($data['parcInformatique'] ?? ''));

        // Sous-catégorie/autres-catégorie/niveau d'urgence ne sont pas saisis à
        // la création (comme le legacy) — renseignés plus tard lors du triage.
        [$agenceEmetteur, $serviceEmetteur] = $this->resolveDefaultAgenceService($user);

        $numeroTicket = $this->generateNumeroTicket();

        /** @var UploadedFile[] $uploadedFiles */
        $uploadedFiles = $request->files->all('fichiers') ?: [];
        [$fileError, $storedFiles] = $this->validateAndStoreFiles($uploadedFiles, $numeroTicket);
        if ($fileError) {
            return $this->json(['error' => $fileError], Response::HTTP_BAD_REQUEST);
        }

        $dateFinSouhaiteeInput = trim((string) ($data['dateFinSouhaitee'] ?? ''));
        $dateFinSouhaitee = $dateFinSouhaiteeInput !== ''
            ? \DateTime::createFromFormat('Y-m-d H:i:s', $dateFinSouhaiteeInput . ' 00:00:00')
            : null;
        $dateFinSouhaitee ??= $this->addBusinessDays(new \DateTime(), 2);

        $now = (new \DateTime())->format('Y-m-d\TH:i:s');

        $this->conn->insert('tik_ticket', array_filter([
            'numero_ticket'        => $numeroTicket,
            'objet_demande'        => $objetDemande,
            'detail_demande'       => $detailDemande,
            'categorie_id'         => $categorie->getId(),
            'demandeur_id'         => $user->getId(),
            'agence_emetteur_id'   => $agenceEmetteur?->getId(),
            'service_emetteur_id'  => $serviceEmetteur?->getId(),
            'agence_debiteur_id'   => $agenceDebiteur->getId(),
            'service_debiteur_id'  => $serviceDebiteur->getId(),
            'parc_informatique'    => $parcInformatique !== '' ? $parcInformatique : null,
            'date_fin_souhaitee'   => $dateFinSouhaitee->format('Y-m-d\TH:i:s'),
            'statut'               => Tik::STATUT_OUVERT,
            'file_names'           => $storedFiles ? json_encode($storedFiles, JSON_UNESCAPED_UNICODE) : null,
            'created_at'           => $now,
        ], static fn($v) => $v !== null));

        $id = (int) $this->conn->lastInsertId();
        $this->recordHistory($id, Tik::STATUT_OUVERT, null, $user);

        return $this->json($this->serialize($this->tikRepo->find($id), $user), Response::HTTP_CREATED);
    }

    /**
     * Télécharge une pièce jointe d'un ticket (authentifié — ces fichiers ne
     * sont jamais servis directement par le serveur web).
     */
    #[Route('/{id}/fichiers/{storedName}', methods: ['GET'])]
    public function downloadFile(int $id, string $storedName): Response
    {
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $file = null;
        foreach ($tik->getFileNamesAsArray() as $f) {
            if ($f['storedName'] === $storedName) {
                $file = $f;
                break;
            }
        }
        if (!$file) {
            return $this->json(['error' => 'Fichier introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $path = $this->uploadDir($tik->getNumeroTicket()) . '/' . $storedName;
        if (!is_file($path)) {
            return $this->json(['error' => 'Fichier introuvable sur le serveur.'], Response::HTTP_NOT_FOUND);
        }

        $response = new BinaryFileResponse($path);
        $response->setContentDisposition(ResponseHeaderBag::DISPOSITION_ATTACHMENT, $file['name']);

        return $response;
    }

    /**
     * Le validateur valide la demande : assigne un intervenant, affine
     * éventuellement la classification (triage — sous-catégorie, autres
     * catégorie, niveau d'urgence, non saisis à la création, cf. create()),
     * le ticket passe en cours de traitement.
     */
    #[Route('/{id}/valider', methods: ['POST'])]
    public function valider(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isValidateur($user)) {
            return $this->json(['error' => 'Réservé aux validateurs.'], Response::HTTP_FORBIDDEN);
        }
        if ($tik->getStatut() !== Tik::STATUT_OUVERT) {
            return $this->json(['error' => 'Seul un ticket ouvert peut être validé.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $intervenantId = isset($data['intervenantId']) ? (int) $data['intervenantId'] : null;
        if (!$intervenantId) {
            return $this->json(['error' => "L'intervenant est obligatoire."], Response::HTTP_BAD_REQUEST);
        }
        $intervenant = $this->em->getRepository(Personnel::class)->find($intervenantId);
        if (!$intervenant) {
            return $this->json(['error' => 'Intervenant introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $update = [
            'intervenant_id' => $intervenant->getId(),
            'validateur_id'  => $user->getId(),
            'statut'         => Tik::STATUT_EN_COURS,
        ];

        if (array_key_exists('niveauUrgence', $data) && $data['niveauUrgence']) {
            $niveauUrgence = (string) $data['niveauUrgence'];
            if (!in_array($niveauUrgence, self::NIVEAUX_URGENCE, true)) {
                return $this->json(['error' => "Niveau d'urgence invalide."], Response::HTTP_BAD_REQUEST);
            }
            $update['niveau_urgence'] = $niveauUrgence;
        }

        $sousCategorie = null;
        if (array_key_exists('sousCategorieId', $data) && $data['sousCategorieId']) {
            $sousCategorie = $this->em->getRepository(TikSousCategorie::class)->find((int) $data['sousCategorieId']);
            if (!$sousCategorie || $sousCategorie->getCategorie()?->getId() !== $tik->getCategorie()?->getId()) {
                return $this->json(['error' => 'Sous-catégorie invalide pour ce ticket.'], Response::HTTP_BAD_REQUEST);
            }
            $update['sous_categorie_id'] = $sousCategorie->getId();
        }

        if (array_key_exists('autresCategorieId', $data) && $data['autresCategorieId']) {
            $autresCategorie = $this->em->getRepository(TikAutresCategorie::class)->find((int) $data['autresCategorieId']);
            $sousCategorieRef = $sousCategorie ?? $tik->getSousCategorie();
            if (!$autresCategorie || $autresCategorie->getSousCategorie()?->getId() !== $sousCategorieRef?->getId()) {
                return $this->json(['error' => 'Autre catégorie invalide pour cette sous-catégorie.'], Response::HTTP_BAD_REQUEST);
            }
            $update['autres_categorie_id'] = $autresCategorie->getId();
        }

        $commentaire = trim((string) ($data['commentaire'] ?? '')) ?: null;

        $this->conn->update('tik_ticket', $update, ['id' => $id]);
        $this->recordHistory($id, Tik::STATUT_EN_COURS, $commentaire, $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    /**
     * Le validateur refuse la demande (motif obligatoire).
     */
    #[Route('/{id}/refuser', methods: ['POST'])]
    public function refuser(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isValidateur($user)) {
            return $this->json(['error' => 'Réservé aux validateurs.'], Response::HTTP_FORBIDDEN);
        }
        if ($tik->getStatut() !== Tik::STATUT_OUVERT) {
            return $this->json(['error' => 'Seul un ticket ouvert peut être refusé.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $commentaire = trim((string) ($data['commentaire'] ?? ''));
        if ($commentaire === '') {
            return $this->json(['error' => 'Un motif de refus est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        $this->conn->update('tik_ticket', [
            'validateur_id' => $user->getId(),
            'statut'        => Tik::STATUT_REFUSE,
        ], ['id' => $id]);
        $this->recordHistory($id, Tik::STATUT_REFUSE, $commentaire, $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    /**
     * Le validateur met le ticket en attente (motif obligatoire).
     */
    #[Route('/{id}/mettre-en-attente', methods: ['POST'])]
    public function mettreEnAttente(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isValidateur($user)) {
            return $this->json(['error' => 'Réservé aux validateurs.'], Response::HTTP_FORBIDDEN);
        }
        if (in_array($tik->getStatut(), [Tik::STATUT_CLOTURE, Tik::STATUT_REFUSE], true)) {
            return $this->json(['error' => 'Ce ticket est déjà clôturé ou refusé.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $commentaire = trim((string) ($data['commentaire'] ?? ''));
        if ($commentaire === '') {
            return $this->json(['error' => 'Un commentaire est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        $this->conn->update('tik_ticket', [
            'validateur_id' => $user->getId(),
            'statut'        => Tik::STATUT_EN_ATTENTE,
        ], ['id' => $id]);
        $this->recordHistory($id, Tik::STATUT_EN_ATTENTE, $commentaire, $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    /**
     * L'intervenant assigné planifie une plage horaire d'intervention.
     */
    #[Route('/{id}/planifier', methods: ['POST'])]
    public function planifier(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isAssignedIntervenant($tik, $user)) {
            return $this->json(['error' => "Réservé à l'intervenant assigné."], Response::HTTP_FORBIDDEN);
        }
        if (!in_array($tik->getStatut(), [Tik::STATUT_EN_COURS, Tik::STATUT_REOUVERT], true)) {
            return $this->json(['error' => 'Ce ticket ne peut pas être planifié dans son état actuel.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $debut = trim((string) ($data['dateDebutPlanning'] ?? ''));
        $fin   = trim((string) ($data['dateFinPlanning']   ?? ''));
        if ($debut === '' || $fin === '') {
            return $this->json(['error' => 'Date de début et date de fin sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $dateDebut = $this->parseDateTimeLocal($debut);
        $dateFin   = $this->parseDateTimeLocal($fin);
        if (!$dateDebut || !$dateFin) {
            return $this->json(['error' => 'Date invalide.'], Response::HTTP_BAD_REQUEST);
        }

        $this->conn->update('tik_ticket', [
            'date_debut_planning' => $dateDebut->format('Y-m-d\TH:i:s'),
            'date_fin_planning'   => $dateFin->format('Y-m-d\TH:i:s'),
            'statut'              => Tik::STATUT_PLANIFIE,
        ], ['id' => $id]);
        $this->recordHistory($id, Tik::STATUT_PLANIFIE, null, $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    /**
     * L'intervenant assigné transfère le ticket à un autre intervenant
     * (le statut ne change pas).
     */
    #[Route('/{id}/transferer', methods: ['POST'])]
    public function transferer(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isAssignedIntervenant($tik, $user)) {
            return $this->json(['error' => "Réservé à l'intervenant assigné."], Response::HTTP_FORBIDDEN);
        }
        if (!in_array($tik->getStatut(), [Tik::STATUT_EN_COURS, Tik::STATUT_PLANIFIE, Tik::STATUT_REOUVERT], true)) {
            return $this->json(['error' => 'Ce ticket ne peut pas être transféré dans son état actuel.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $nouvelIntervenantId = isset($data['intervenantId']) ? (int) $data['intervenantId'] : null;
        if (!$nouvelIntervenantId) {
            return $this->json(['error' => 'Le nouvel intervenant est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }
        $nouvelIntervenant = $this->em->getRepository(Personnel::class)->find($nouvelIntervenantId);
        if (!$nouvelIntervenant) {
            return $this->json(['error' => 'Intervenant introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->conn->update('tik_ticket', [
            'intervenant_id' => $nouvelIntervenant->getId(),
        ], ['id' => $id]);
        $this->recordHistory($id, $tik->getStatut(), "Transféré à {$nouvelIntervenant->getNom()} {$nouvelIntervenant->getPrenoms()}", $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    /**
     * L'intervenant assigné marque le ticket comme résolu.
     */
    #[Route('/{id}/resoudre', methods: ['POST'])]
    public function resoudre(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isAssignedIntervenant($tik, $user)) {
            return $this->json(['error' => "Réservé à l'intervenant assigné."], Response::HTTP_FORBIDDEN);
        }
        if (!in_array($tik->getStatut(), [Tik::STATUT_EN_COURS, Tik::STATUT_PLANIFIE, Tik::STATUT_REOUVERT], true)) {
            return $this->json(['error' => 'Ce ticket ne peut pas être résolu dans son état actuel.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $commentaire = trim((string) ($data['commentaire'] ?? '')) ?: null;

        $this->conn->update('tik_ticket', ['statut' => Tik::STATUT_RESOLU], ['id' => $id]);
        $this->recordHistory($id, Tik::STATUT_RESOLU, $commentaire, $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    /**
     * Le demandeur ou un validateur confirme la résolution et clôture le ticket.
     */
    #[Route('/{id}/cloturer', methods: ['POST'])]
    public function cloturer(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isDemandeur($tik, $user) && !$this->isValidateur($user)) {
            return $this->json(['error' => 'Réservé au demandeur ou à un validateur.'], Response::HTTP_FORBIDDEN);
        }
        if ($tik->getStatut() !== Tik::STATUT_RESOLU) {
            return $this->json(['error' => 'Seul un ticket résolu peut être clôturé.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $commentaire = trim((string) ($data['commentaire'] ?? '')) ?: null;

        $this->conn->update('tik_ticket', ['statut' => Tik::STATUT_CLOTURE], ['id' => $id]);
        $this->recordHistory($id, Tik::STATUT_CLOTURE, $commentaire, $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    /**
     * Le demandeur conteste la résolution et réouvre le ticket.
     */
    #[Route('/{id}/reouvrir', methods: ['POST'])]
    public function reouvrir(int $id, Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $tik = $this->tikRepo->find($id);
        if (!$tik) {
            return $this->json(['error' => 'Ticket introuvable.'], Response::HTTP_NOT_FOUND);
        }
        if (!$this->isDemandeur($tik, $user)) {
            return $this->json(['error' => 'Réservé au demandeur du ticket.'], Response::HTTP_FORBIDDEN);
        }
        if ($tik->getStatut() !== Tik::STATUT_RESOLU) {
            return $this->json(['error' => 'Seul un ticket résolu peut être réouvert.'], Response::HTTP_CONFLICT);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $commentaire = trim((string) ($data['commentaire'] ?? '')) ?: null;

        $this->conn->update('tik_ticket', ['statut' => Tik::STATUT_REOUVERT], ['id' => $id]);
        $this->recordHistory($id, Tik::STATUT_REOUVERT, $commentaire, $user);

        return $this->json($this->serializeFresh($id, $user));
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Basé sur la permission "validate" du module TIK (société active) —
     * volontairement pas un rôle global : un utilisateur peut valider les
     * tickets TIK sans être validateur ailleurs dans l'application.
     */
    private function isValidateur(User $user): bool
    {
        return $this->isGranted(AppAction::VALIDATE, 'tik');
    }

    private function isDemandeur(Tik $tik, User $user): bool
    {
        return $tik->getDemandeur()?->getId() === $user->getId();
    }

    /**
     * Utilisateurs ayant l'action donnée sur le module TIK, pour la société
     * active — repose sur le système de permissions fines (UserPermission),
     * pas sur les rôles globaux.
     *
     * @return User[]
     */
    private function usersWithTikAction(string $action): array
    {
        $company = $this->securityContext->getActiveCompany();
        $tikModule = $company ? $this->em->getRepository(AppModule::class)->findOneBy(['slug' => 'tik']) : null;
        if (!$tikModule) {
            return [];
        }

        $permissions = $this->em->getRepository(UserPermission::class)->findBy([
            'company'      => $company,
            'resourceType' => 'module',
            'resourceId'   => $tikModule->getId(),
        ]);

        return array_values(array_filter(array_map(
            fn(UserPermission $p) => $p->hasAction($action) ? $p->getUser() : null,
            $permissions,
        )));
    }

    /**
     * L'intervenant assigné au ticket est un Personnel — on le relie à
     * l'utilisateur connecté via son matricule (même logique que partout
     * ailleurs dans le projet pour résoudre Personnel ↔ User).
     */
    private function isAssignedIntervenant(Tik $tik, User $user): bool
    {
        if (!$tik->getIntervenant() || !$user->getMatricule()) {
            return false;
        }

        return $tik->getIntervenant()->getMatricule() === $user->getMatricule();
    }

    private function recordHistory(int|Tik $tik, string $statut, ?string $commentaire, User $user): void
    {
        $tikId = $tik instanceof Tik ? $tik->getId() : $tik;

        $this->conn->insert('tik_historique', array_filter([
            'tik_id'      => $tikId,
            'statut'      => $statut,
            'commentaire' => $commentaire,
            'user_id'     => $user->getId(),
            'created_at'  => (new \DateTime())->format('Y-m-d\TH:i:s'),
        ], static fn($v) => $v !== null));
    }

    /**
     * Recharge le ticket après une écriture DBAL : l'entité chargée plus haut
     * reste dans l'identity map de l'ORM, find() renverrait sinon l'objet en
     * cache plutôt que la ligne à jour.
     */
    private function serializeFresh(int $id, User $user): array
    {
        $this->em->clear();

        return $this->serialize($this->tikRepo->find($id), $user);
    }

    /**
     * Dossier de stockage des pièces jointes d'un ticket — volontairement HORS
     * de public/ (DocumentRoot Apache, servi sans contrôle d'accès) : les
     * fichiers ne sont accessibles qu'via downloadFile() (authentifié).
     */
    private function uploadDir(string $numeroTicket): string
    {
        $dir = $this->kernel->getProjectDir() . '/var/uploads/tik/' . $numeroTicket;
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        return $dir;
    }

    /**
     * Valide (taille, type MIME) et stocke les pièces jointes sur disque.
     *
     * @param UploadedFile[] $files
     * @return array{0: string|null, 1: array<array{name:string,storedName:string,sizeKb:int}>}
     */
    private function validateAndStoreFiles(array $files, string $numeroTicket): array
    {
        $stored = [];

        foreach ($files as $file) {
            if (!$file instanceof UploadedFile || !$file->isValid()) {
                return ["Le fichier \"{$file?->getClientOriginalName()}\" n'a pas pu être envoyé.", []];
            }

            if ($file->getSize() > self::MAX_FILE_SIZE) {
                return ["Le fichier \"{$file->getClientOriginalName()}\" dépasse la taille maximale de 5 Mo.", []];
            }

            if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES, true)) {
                return ["Le fichier \"{$file->getClientOriginalName()}\" n'est pas d'un type autorisé (PDF, image, Office).", []];
            }

            $originalName = $file->getClientOriginalName();
            $sizeKb       = (int) round($file->getSize() / 1024); // avant move() : le fichier temporaire disparaît après

            $storedName = uniqid('', true) . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', $originalName);
            $file->move($this->uploadDir($numeroTicket), $storedName);

            $stored[] = [
                'name'       => $originalName,
                'storedName' => $storedName,
                'sizeKb'     => $sizeKb,
            ];
        }

        return [null, $stored];
    }

    /**
     * Agence/service par défaut du demandeur, dérivés de Personnel → Centre
     * (rattaché par matricule) — même logique que AdminUserController.
     */
    private function resolveDefaultAgenceService(User $user): array
    {
        if (!$user->getMatricule()) {
            return [null, null];
        }

        $personnel = $this->em->getRepository(Personnel::class)->findOneBy(['matricule' => $user->getMatricule()]);
        $centre = $personnel?->getCentre();

        return [$centre?->getAgency(), $centre?->getService()];
    }

    /**
     * Format TIK + AAMM + séquence 4 chiffres (ex: TIK26070001), remise à 1
     * chaque mois. Basé sur un COUNT, suffisant pour un usage interne à faible
     * concurrence (pas de séquence atomique dédiée).
     */
    private function generateNumeroTicket(): string
    {
        $prefix = 'TIK' . (new \DateTime())->format('ym');
        $sequence = $this->tikRepo->countByNumeroPrefix($prefix) + 1;

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    private function addBusinessDays(\DateTime $date, int $days): \DateTime
    {
        $added = 0;
        while ($added < $days) {
            $date->modify('+1 day');
            if ((int) $date->format('N') < 6) {
                $added++;
            }
        }

        return $date;
    }

    private function parseDateTimeLocal(string $value): ?\DateTime
    {
        // Accepte 'YYYY-MM-DDTHH:MM' (input datetime-local HTML) ou avec secondes.
        $date = \DateTime::createFromFormat('Y-m-d\TH:i:s', $value)
            ?: \DateTime::createFromFormat('Y-m-d\TH:i', $value);

        return $date ?: null;
    }

    private function serialize(Tik $t, User $currentUser): array
    {
        $statut = $t->getStatut();
        $isValidateur = $this->isValidateur($currentUser);
        $isDemandeur  = $this->isDemandeur($t, $currentUser);
        $isIntervenant = $this->isAssignedIntervenant($t, $currentUser);

        return [
            'id'                => $t->getId(),
            'numeroTicket'      => $t->getNumeroTicket(),
            'objetDemande'      => $t->getObjetDemande(),
            'detailDemande'     => $t->getDetailDemande(),
            'niveauUrgence'     => $t->getNiveauUrgence(),
            'parcInformatique'  => $t->getParcInformatique(),
            'dateFinSouhaitee'  => $t->getDateFinSouhaitee()->format('Y-m-d'),
            'statut'            => $statut,
            'createdAt'         => $t->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'dateDebutPlanning' => $t->getDateDebutPlanning()?->format(\DateTimeInterface::ATOM),
            'dateFinPlanning'   => $t->getDateFinPlanning()?->format(\DateTimeInterface::ATOM),
            'agenceEmetteur'    => $t->getAgenceEmetteur() ? ['id' => $t->getAgenceEmetteur()->getId(), 'code' => $t->getAgenceEmetteur()->getCode(), 'name' => $t->getAgenceEmetteur()->getName()] : null,
            'serviceEmetteur'   => $t->getServiceEmetteur() ? ['id' => $t->getServiceEmetteur()->getId(), 'code' => $t->getServiceEmetteur()->getCode(), 'name' => $t->getServiceEmetteur()->getName()] : null,
            'agenceDebiteur'    => $t->getAgenceDebiteur() ? ['id' => $t->getAgenceDebiteur()->getId(), 'code' => $t->getAgenceDebiteur()->getCode(), 'name' => $t->getAgenceDebiteur()->getName()] : null,
            'serviceDebiteur'   => $t->getServiceDebiteur() ? ['id' => $t->getServiceDebiteur()->getId(), 'code' => $t->getServiceDebiteur()->getCode(), 'name' => $t->getServiceDebiteur()->getName()] : null,
            'categorie'         => $t->getCategorie() ? [
                'id' => $t->getCategorie()->getId(),
                'description' => $t->getCategorie()->getDescription(),
            ] : null,
            'sousCategorie'     => $t->getSousCategorie() ? [
                'id' => $t->getSousCategorie()->getId(),
                'description' => $t->getSousCategorie()->getDescription(),
            ] : null,
            'autresCategorie'   => $t->getAutresCategorie() ? [
                'id' => $t->getAutresCategorie()->getId(),
                'description' => $t->getAutresCategorie()->getDescription(),
            ] : null,
            'demandeur'         => $t->getDemandeur() ? [
                'id' => $t->getDemandeur()->getId(),
                'username' => $t->getDemandeur()->getUsername(),
                'displayName' => $t->getDemandeur()->getDisplayName(),
            ] : null,
            'validateur'        => $t->getValidateur() ? [
                'id' => $t->getValidateur()->getId(),
                'displayName' => $t->getValidateur()->getDisplayName() ?? $t->getValidateur()->getUsername(),
            ] : null,
            'intervenant'       => $t->getIntervenant() ? [
                'id' => $t->getIntervenant()->getId(),
                'nom' => $t->getIntervenant()->getNom(),
                'prenoms' => $t->getIntervenant()->getPrenoms(),
            ] : null,
            'fichiers'          => array_map(fn(array $f) => [
                'name' => $f['name'],
                'sizeKb' => $f['sizeKb'],
                'url' => "/api/tik/tickets/{$t->getId()}/fichiers/{$f['storedName']}",
            ], $t->getFileNamesAsArray()),
            // Permissions calculées côté serveur — le frontend n'a qu'à
            // afficher/masquer les boutons en fonction de ces indicateurs.
            'actions' => [
                'peutValider'         => $isValidateur && $statut === Tik::STATUT_OUVERT,
                'peutRefuser'         => $isValidateur && $statut === Tik::STATUT_OUVERT,
                'peutMettreEnAttente' => $isValidateur && !in_array($statut, [Tik::STATUT_CLOTURE, Tik::STATUT_REFUSE], true),
                'peutPlanifier'       => $isIntervenant && in_array($statut, [Tik::STATUT_EN_COURS, Tik::STATUT_REOUVERT], true),
                'peutTransferer'      => $isIntervenant && in_array($statut, [Tik::STATUT_EN_COURS, Tik::STATUT_PLANIFIE, Tik::STATUT_REOUVERT], true),
                'peutResoudre'        => $isIntervenant && in_array($statut, [Tik::STATUT_EN_COURS, Tik::STATUT_PLANIFIE, Tik::STATUT_REOUVERT], true),
                'peutCloturer'        => ($isDemandeur || $isValidateur) && $statut === Tik::STATUT_RESOLU,
                'peutReouvrir'        => $isDemandeur && $statut === Tik::STATUT_RESOLU,
            ],
        ];
    }
}
