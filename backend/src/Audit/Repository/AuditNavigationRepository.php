<?php

namespace App\Audit\Repository;

use App\Audit\Entity\AuditNavigation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AuditNavigation>
 */
class AuditNavigationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AuditNavigation::class);
    }

    /**
     * @return AuditNavigation[]
     */
    public function findByUser(int $userId, int $limit = 100): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.userId = :userId')
            ->setParameter('userId', $userId)
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return AuditNavigation[]
     */
    public function findErrors(int $limit = 100): array
    {
        return $this->createQueryBuilder('n')
            ->where('n.errorCode IS NOT NULL')
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }

    /**
     * @return AuditNavigation[]
     */
    public function findRecent(int $limit = 200, ?int $companyId = null): array
    {
        $qb = $this->createQueryBuilder('n')
            ->orderBy('n.createdAt', 'DESC')
            ->setMaxResults($limit);

        if ($companyId !== null) {
            $qb->andWhere('n.companyId = :companyId')->setParameter('companyId', $companyId);
        }

        return $qb->getQuery()->getResult();
    }
}
