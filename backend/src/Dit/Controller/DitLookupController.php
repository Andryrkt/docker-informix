<?php

namespace App\Dit\Controller;

use App\Dit\Repository\CategorieAteAppRepository;
use App\Dit\Repository\ClientRepository;
use App\Dit\Repository\MaterielRepository;
use App\Dit\Repository\WorNiveauUrgenceRepository;
use App\Dit\Repository\WorTypeDocumentRepository;
use App\Security\Repository\AgencyRepository;
use App\Security\Repository\ServiceRepository;
use App\Security\Service\SecurityContextService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Listes de référence pour le formulaire DIT. Les valeurs "type de réparation"
 * et "réparation réalisé par" reprennent les codes déjà choisis côté frontend
 * (ditSchemaField.tsx) — il n'existe pas de table Informix équivalente,
 * contrairement à type de document / catégorie / niveau d'urgence.
 */
#[Route('/api/dit')]
class DitLookupController extends AbstractController
{
    private const TYPES_REPARATION = ['STANDARD', 'URGENTE', 'PREVENTIVE', 'CORRECTIVE'];
    private const REPARATION_PAR = ['ATE_TANA', 'ATE_POL_TANA', 'ATE_STAR', 'ATE_MAS', 'ATE_TMV', 'ATE_FTU'];

    public function __construct(
        private readonly WorTypeDocumentRepository $typeDocumentRepo,
        private readonly WorNiveauUrgenceRepository $niveauUrgenceRepo,
        private readonly CategorieAteAppRepository $categorieRepo,
        private readonly MaterielRepository $materielRepo,
        private readonly ClientRepository $clientRepo,
        private readonly AgencyRepository $agencyRepo,
        private readonly ServiceRepository $serviceRepo,
        private readonly SecurityContextService $securityContext
    ) {}

    #[Route('/types-document', methods: ['GET'])]
    public function typesDocument(): JsonResponse
    {
        return $this->json(array_map(fn($t) => [
            'code' => $t->getCodeDocument(),
            'label' => self::toUtf8($t->getDescription()),
        ], $this->typeDocumentRepo->findAllOrdered()));
    }

    #[Route('/niveaux-urgence', methods: ['GET'])]
    public function niveauxUrgence(): JsonResponse
    {
        return $this->json(array_map(fn($u) => [
            'code' => $u->getDescription(),
            'label' => self::toUtf8($u->getDescription()),
        ], $this->niveauUrgenceRepo->findAllOrdered()));
    }

    #[Route('/categories-demande', methods: ['GET'])]
    public function categoriesDemande(): JsonResponse
    {
        return $this->json(array_map(fn($c) => [
            'code' => self::toUtf8($c->getLibelle()),
            'label' => self::toUtf8($c->getLibelle()),
        ], $this->categorieRepo->findAllOrdered()));
    }

    #[Route('/types-reparation', methods: ['GET'])]
    public function typesReparation(): JsonResponse
    {
        return $this->json(array_map(fn($code) => ['code' => $code, 'label' => $code], self::TYPES_REPARATION));
    }

    #[Route('/reparation-par', methods: ['GET'])]
    public function reparationPar(): JsonResponse
    {
        return $this->json(array_map(fn($code) => ['code' => $code, 'label' => $code], self::REPARATION_PAR));
    }

    /**
     * Inclut les services de chaque agence (pas de pagination/filtre séparé
     * nécessaire côté frontend pour "service débiteur" : le formulaire DIT
     * charge cette liste une fois et filtre par agence côté client — même
     * principe que TikCreationForm, plus rapide qu'un aller-retour réseau à
     * chaque changement d'agence).
     */
    #[Route('/agences', methods: ['GET'])]
    public function agences(): JsonResponse
    {
        $company = $this->securityContext->getActiveCompany();
        $agences = $company ? $this->agencyRepo->findBy(['company' => $company]) : $this->agencyRepo->findAll();

        return $this->json(array_map(fn($a) => [
            'id' => $a->getId(),
            'code' => $a->getCode(),
            'label' => $a->getName(),
            'services' => array_map(fn($s) => [
                'id' => $s->getId(),
                'code' => $s->getCode(),
                'label' => $s->getName(),
            ], $a->getServices()->toArray()),
        ], $agences));
    }

    #[Route('/services', methods: ['GET'])]
    public function services(Request $request): JsonResponse
    {
        $agenceId = $request->query->get('agenceId');

        // Sans agenceId : liste globale dédupliquée (un service peut être
        // rattaché à plusieurs agences) — utilisée par le champ "service
        // débiteur" du formulaire DIT, qui ne filtre pas par agence.
        if (!$agenceId) {
            $services = $this->serviceRepo->findAll();
        } else {
            $agence = $this->agencyRepo->find((int) $agenceId);
            if (!$agence) {
                return $this->json(['error' => 'Agence introuvable.'], 404);
            }
            $services = $agence->getServices()->toArray();
        }

        $seen = [];
        $result = [];
        foreach ($services as $s) {
            if (isset($seen[$s->getId()])) {
                continue;
            }
            $seen[$s->getId()] = true;
            $result[] = ['id' => $s->getId(), 'code' => $s->getCode(), 'label' => $s->getName()];
        }

        return $this->json($result);
    }

    #[Route('/materiels', methods: ['GET'])]
    public function materiels(Request $request): JsonResponse
    {
        $search = (string) $request->query->get('search', '');
        $results = $this->materielRepo->search($search);

        return $this->json(array_map(fn($m) => self::sanitizeUtf8([
            'idMateriel'  => $m['mmat_nummat'],
            'constructeur'=> $m['mmat_marqmat'],
            'designation' => $m['mmat_desi'],
            'modele'      => $m['mmat_typmat'],
            'numParc'     => $m['mmat_recalph'],  // mmat_recalph = N° parc affiché
            'casier'      => $m['mmat_numparc'],  // mmat_numparc = casier
            'numSerie'    => $m['mmat_numserie'],
            'heures'      => isset($m['heure']) && $m['heure'] !== '' ? (float) $m['heure'] : null,
            'km'          => isset($m['km'])    && $m['km']    !== '' ? (float) $m['km']    : null,
        ]), $results));
    }

    #[Route('/clients', methods: ['GET'])]
    public function clients(Request $request): JsonResponse
    {
        $search = (string) $request->query->get('search', '');

        return $this->json(array_map(fn($c) => self::sanitizeUtf8([
            'numClient' => (string) $c->getNumCli(),
            'nomClient' => $c->getNomCli(),
            'telephoneClient' => $c->getTel(),
            'emailClient' => null,
        ]), $this->clientRepo->search($search)));
    }

    /**
     * Certaines lignes de lookup Informix legacy (categorie_ate_app,
     * wor_type_document) ont été écrites en ISO-8859-1 — à convertir avant
     * tout json_encode, qui rejette les octets invalides en UTF-8.
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
