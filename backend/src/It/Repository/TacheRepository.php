<?php

namespace App\It\Repository;

use App\It\Entity\Tache;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tache>
 */
class TacheRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tache::class);
    }

    /**
     * @return Tache[]
     */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('t')
            ->addSelect('i')
            ->leftJoin('t.intervenant', 'i')
            ->orderBy('t.termine', 'ASC')
            ->addOrderBy('t.dateTache', 'ASC')
            ->getQuery()
            ->getResult();
    }
}
