<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Irium\Dit;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
     * @return array{0: Dit[], 1: int} [résultats de la page, total de lignes]
     */
    public function findPaginated(int $page, int $limit): array
    {
        $qb = $this->createQueryBuilder('d')
            ->orderBy('d.id', 'DESC')
            ->setFirstResult(($page - 1) * $limit)
            ->setMaxResults($limit);

        $paginator = new \Doctrine\ORM\Tools\Pagination\Paginator($qb, false);

        return [iterator_to_array($paginator), $paginator->count()];
    }
}
