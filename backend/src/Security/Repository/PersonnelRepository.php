<?php

namespace App\Security\Repository;

use App\Security\Entity\Personnel;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Personnel>
 */
class PersonnelRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Personnel::class);
    }

    public function findBycentreCode(string $centreCode): array
    {
        return $this->createQueryBuilder('p')
            ->join('p.centre', 'c')
            ->where('c.code = :code')
            ->setParameter('code', $centreCode)
            ->orderBy('p.nom', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
