<?php

namespace App\Dit\Controller;

use App\Dit\Repository\CategorieAteAppRepository;
use App\Dit\Repository\ClientRepository;
use App\Dit\Repository\DitRepository;
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
 * et "réparation réalisé par" n'ont pas de table Informix équivalente
 * (contrairement à type de document / catégorie / niveau d'urgence) — elles
 * sont gérées en dur côté frontend (reparation/api.ts), pas exposées ici.
 */
#[Route('/api/dit')]
class DitLookupController extends AbstractController
{
    public function __construct(
        private readonly DitRepository $ditRepository,
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
            'code' => self::toUtf8($t->getDescription()),
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
            'constructeur' => $m['mmat_marqmat'],
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
    #[Route('/statuts-or', methods: ['GET'])]
    public function statutsOr(): JsonResponse
    {
        $statuts = $this->ditRepository->findStatutOr();
        return $this->json(array_map(
            fn($statut) => [
                'code' => self::toUtf8($statut),
                'label' => self::toUtf8($statut),
            ],
            $statuts
        ));
    }
    #[Route('/sections-affectees', methods: ['GET'])]
    public function sectionsAffectees(): JsonResponse
    {

        $sections = $this->cleanSections(
            $this->ditRepository->findSectionAffectee()
        );

        return $this->json(array_map(
            fn($section) => [
                'id' => self::toUtf8($section),
                'nom_section' => self::toUtf8($section),
            ],
            $sections
        ));
    }

    #[Route('/sections-support-1', methods: ['GET'])]
    public function sectionsSupport1(): JsonResponse
    {
        $sections = $this->cleanSections(
            $this->ditRepository->findSectionSupport1()
        );

        return $this->json(array_map(
            fn($section) => [
                'id' => self::toUtf8($section),
                'nom_section' => self::toUtf8($section),
            ],
            $sections
        ));
    }

    #[Route('/sections-support-2', methods: ['GET'])]
    public function sectionsSupport2(): JsonResponse
    {
        $sections = $this->cleanSections(
            $this->ditRepository->findSectionSupport2()
        );

        return $this->json(array_map(
            fn($section) => [
                'id' => self::toUtf8($section),
                'nom_section' => self::toUtf8($section),
            ],
            $sections
        ));
    }

    #[Route('/sections-support-3', methods: ['GET'])]
    public function sectionsSupport3(): JsonResponse
    {
        $sections = $this->cleanSections(
            $this->ditRepository->findSectionSupport3()
        );

        return $this->json(array_map(
            fn($section) => [
                'id' => self::toUtf8($section),
                'nom_section' => self::toUtf8($section),
            ],
            $sections
        ));
    }

    #[Route('/statuts-facture', methods: ['GET'])]
    public function statutsFacture(): JsonResponse
    {
        $statuts = $this->ditRepository->findStatutFacture();
        return $this->json(array_map(
            fn($statut) => [
                'code' => self::toUtf8($statut),
                'label' => self::toUtf8($statut),
            ],
            $statuts
        ));
    }


    /**
     * Nettoyage des noms de sections.
     *
     * Supprime les intitulés de fonction, les valeurs vides
     * et les doublons.
     *
     * @param string[] $sections
     *
     * @return string[]
     */
    private function cleanSections(array $sections): array
    {
        $groupes = [
            'Chef section',
            'Chef de section',
            'Responsable section',
            "Chef d'équipe",
        ];

        $sections = array_map(
            fn(string $section) => trim(str_replace($groupes, '',  self::toUtf8($section))),
            $sections
        );

        // Supprime les valeurs vides + doublons
        return array_values(array_unique(
            array_filter(
                $sections,
                fn(string $section) => $section !== ''
            )
        ));
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
