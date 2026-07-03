<?php

namespace App\Tik\Repository;

use App\Tik\Entity\TikHistorique;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TikHistorique>
 */
class TikHistoriqueRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TikHistorique::class);
    }

    /**
     * @return TikHistorique[]
     */
    public function findForTik(int $tikId): array
    {
        return $this->createQueryBuilder('h')
            ->addSelect('u')
            ->leftJoin('h.user', 'u')
            ->where('h.tik = :tikId')
            ->setParameter('tikId', $tikId)
            ->orderBy('h.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
