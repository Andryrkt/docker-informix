<?php

namespace App\Tik\Repository;

use App\Tik\Entity\TikCommentaire;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TikCommentaire>
 */
class TikCommentaireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TikCommentaire::class);
    }

    /**
     * @return TikCommentaire[]
     */
    public function findForTik(int $tikId): array
    {
        return $this->createQueryBuilder('c')
            ->addSelect('u')
            ->leftJoin('c.user', 'u')
            ->where('c.tik = :tikId')
            ->setParameter('tikId', $tikId)
            ->orderBy('c.createdAt', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
