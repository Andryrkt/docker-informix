<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Irium\Dit;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Dit>
 */
class DitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Dit::class);
    }

    public function findByNumero(string $numero): ?Dit
    {
        return $this->findOneBy(['numeroDemandeDit' => $numero]);
    }

    /**
     * @param array<string, mixed> $filters critères normalisés, voir
     *   DitController::buildFilterCriteria() pour les clés acceptées
     * @return array{0: Dit[], 1: int} [résultats de la page, total de lignes]
     */
    public function findPaginated(int $page, int $limit, array $filters = []): array
    {
        $qb = $this->createQueryBuilder('d')->orderBy('d.id', 'DESC');

        $this->applyFilters($qb, $filters);

        $qb->setFirstResult(($page - 1) * $limit)->setMaxResults($limit);

        $paginator = new \Doctrine\ORM\Tools\Pagination\Paginator($qb, false);

        return [iterator_to_array($paginator), $paginator->count()];
    }

    /**
     * @param array<string, mixed> $filters
     */
    private function applyFilters(QueryBuilder $qb, array $filters): void
    {
        $like = function (QueryBuilder $qb, string $field, string $param, mixed $value) {
            $qb->andWhere("d.{$field} LIKE :{$param}")->setParameter($param, '%' . $value . '%');
        };

        if (($v = $filters['numeroDit'] ?? null) !== null) {
            $like($qb, 'numeroDemandeDit', 'numeroDit', $v);
        }
        if (($v = $filters['numeroDevis'] ?? null) !== null) {
            $like($qb, 'numeroDevisRattache', 'numeroDevis', $v);
        }
        if (($v = $filters['numeroOr'] ?? null) !== null) {
            $like($qb, 'numeroOr', 'numeroOr', $v);
        }
        if (($v = $filters['sectionAffectee'] ?? null) !== null) {
            $like($qb, 'sectionAffectee', 'sectionAffectee', $v);
        }
        if (($v = $filters['statutOr'] ?? null) !== null) {
            $like($qb, 'statutOr', 'statutOr', $v);
        }
        if (($v = $filters['statutFacture'] ?? null) !== null) {
            $like($qb, 'etatFacturation', 'statutFacture', $v);
        }
        if (($v = $filters['utilisateur'] ?? null) !== null) {
            $like($qb, 'utilisateurDemandeur', 'utilisateur', $v);
        }
        if (($v = $filters['agenceServiceEmetteur'] ?? null) !== null) {
            $like($qb, 'agenceServiceEmetteur', 'agenceServiceEmetteur', $v);
        }
        if (($v = $filters['agenceServiceDebiteur'] ?? null) !== null) {
            $like($qb, 'agenceServiceDebiteur', 'agenceServiceDebiteur', $v);
        }

        if (($v = $filters['realisePar'] ?? null) !== null) {
            $qb->andWhere('d.reparationRealise = :realisePar')->setParameter('realisePar', $v);
        }
        if (($v = $filters['typeDocument'] ?? null) !== null) {
            $qb->andWhere('d.typeDocument = :typeDocument')->setParameter('typeDocument', $v);
        }
        if (($v = $filters['categorieDemande'] ?? null) !== null) {
            $qb->andWhere('d.categorieDemande = :categorieDemande')->setParameter('categorieDemande', $v);
        }
        if (($v = $filters['interneExterne'] ?? null) !== null) {
            $qb->andWhere('d.interneExterne = :interneExterne')->setParameter('interneExterne', $v);
        }
        if (($v = $filters['idMateriel'] ?? null) !== null) {
            $qb->andWhere('d.idMateriel = :idMateriel')->setParameter('idMateriel', $v);
        }
        if (($v = $filters['idStatutDemande'] ?? null) !== null) {
            $qb->andWhere('d.idStatutDemande = :idStatutDemande')->setParameter('idStatutDemande', $v);
        }
        if (($v = $filters['idNiveauUrgence'] ?? null) !== null) {
            $qb->andWhere('d.idNiveauUrgence = :idNiveauUrgence')->setParameter('idNiveauUrgence', $v);
        }

        if (array_key_exists('materielIds', $filters)) {
            if ($filters['materielIds'] === []) {
                // Recherche par n° parc/série sans aucune correspondance matériel : aucun DIT ne peut matcher.
                $qb->andWhere('1 = 0');
            } else {
                $qb->andWhere('d.idMateriel IN (:materielIds)')->setParameter('materielIds', $filters['materielIds']);
            }
        }

        if (($v = $filters['ditSansOr'] ?? null) === true) {
            $qb->andWhere("d.numeroOr IS NULL OR d.numeroOr = ''");
        }

        if (($v = $filters['dateDebut'] ?? null) !== null) {
            $qb->andWhere('d.dateDemande >= :dateDebut')->setParameter('dateDebut', $v);
        }
        if (($v = $filters['dateFin'] ?? null) !== null) {
            $qb->andWhere('d.dateDemande <= :dateFin')->setParameter('dateFin', $v);
        }
    }
}
