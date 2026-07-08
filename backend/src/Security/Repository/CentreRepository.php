<?php

namespace App\Security\Repository;

use App\Security\Entity\Centre;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Centre>
 */
class CentreRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Centre::class);
    }

    /** Retourne tous les centres d'une agence donnée. */
    public function findByAgencyCode(string $agencyCode): array
    {
        return $this->createQueryBuilder('c')
            ->join('c.agency', 'a')
            ->where('a.code = :code')
            ->setParameter('code', $agencyCode)
            ->orderBy('c.code', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /** Retourne tous les centres d'une société Sage (companyCode). */
    public function findByCompanyCode(string $companyCode): array
    {
        return $this->createQueryBuilder('c')
            ->where('c.companyCode = :cc')
            ->setParameter('cc', $companyCode)
            ->orderBy('c.code', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
