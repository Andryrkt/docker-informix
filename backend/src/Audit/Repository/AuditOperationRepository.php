<?php

namespace App\Audit\Repository;

use App\Audit\Entity\AuditOperation;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AuditOperation>
 */
class AuditOperationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AuditOperation::class);
    }

    /**
     * @return AuditOperation[]
     */
    public function findByDocument(string $documentType, string $documentId): array
    {
        return $this->createQueryBuilder('o')
            ->where('o.documentType = :docType')
            ->andWhere('o.documentId = :docId')
            ->setParameter('docType', $documentType)
            ->setParameter('docId', $documentId)
            ->orderBy('o.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * @return AuditOperation[]
     */
    public function findFailures(int $limit = 100, ?int $companyId = null): array
    {
        $qb = $this->createQueryBuilder('o')
            ->where('o.isSuccess = false')
            ->orderBy('o.createdAt', 'DESC')
            ->setMaxResults($limit);

        if ($companyId !== null) {
            $qb->andWhere('o.companyId = :companyId')->setParameter('companyId', $companyId);
        }

        return $qb->getQuery()->getResult();
    }

    /**
     * @return AuditOperation[]
     */
    public function findRecent(int $limit = 200, ?int $companyId = null, ?string $operationType = null, ?string $documentType = null): array
    {
        $qb = $this->createQueryBuilder('o')
            ->orderBy('o.createdAt', 'DESC')
            ->setMaxResults($limit);

        if ($companyId !== null) {
            $qb->andWhere('o.companyId = :companyId')->setParameter('companyId', $companyId);
        }
        if ($operationType !== null) {
            $qb->andWhere('o.operationType = :opType')->setParameter('opType', $operationType);
        }
        if ($documentType !== null) {
            $qb->andWhere('o.documentType = :docType')->setParameter('docType', $documentType);
        }

        return $qb->getQuery()->getResult();
    }
}
