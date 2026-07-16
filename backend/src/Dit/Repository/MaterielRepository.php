<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Ips\Materiel;
use App\Shared\Repository\AbstractInformixRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractInformixRepository<Materiel>
 */
class MaterielRepository extends AbstractInformixRepository
{
    public function __construct(
        ManagerRegistry $registry,
        string $dbIps = 'ips_test',
        string $dbIrium = 'irium_test'
    ) {
        parent::__construct($registry, Materiel::class, $dbIps, $dbIrium);
    }

    /**
     * Sans terme de recherche, renvoie une page par défaut (les plus récents
     * par id) plutôt qu'une liste vide — le formulaire DIT charge cette liste
     * une fois au montage, sans saisie préalable de l'utilisateur.
     */
    public function search(string $term, int $limit = 20): array
    {
        $term = trim($term);
        $qb = $this->createQueryBuilder('m')->setMaxResults($limit);

        if ($term === '') {
            return $qb->orderBy('m.numMat', 'DESC')->getQuery()->getResult();
        }

        return $qb
            ->where('m.numParc LIKE :term OR m.numSerie LIKE :term OR m.designation LIKE :term')
            ->setParameter('term', '%' . $term . '%')
            ->getQuery()
            ->getResult();
    }

    /**
     * Résout les id matériel (base "ips") correspondant à un n° parc et/ou n°
     * série, pour filtrer ensuite `demande_intervention.id_materiel` (base
     * "irium") — les deux entités vivent sur des connexions Doctrine
     * différentes, pas de jointure DQL possible entre les deux.
     *
     * @return int[]
     */
    public function findIdsByNumParcOrNumSerie(?string $numParc, ?string $numSerie): array
    {
        $qb = $this->createQueryBuilder('m')->select('m.numMat');

        if ($numParc !== null && $numSerie !== null) {
            $qb->where('m.numParc LIKE :numParc OR m.numSerie LIKE :numSerie')
                ->setParameter('numParc', '%' . $numParc . '%')
                ->setParameter('numSerie', '%' . $numSerie . '%');
        } elseif ($numParc !== null) {
            $qb->where('m.numParc LIKE :numParc')->setParameter('numParc', '%' . $numParc . '%');
        } elseif ($numSerie !== null) {
            $qb->where('m.numSerie LIKE :numSerie')->setParameter('numSerie', '%' . $numSerie . '%');
        } else {
            return [];
        }

        return array_column($qb->getQuery()->getScalarResult(), 'numMat');
    }
}
