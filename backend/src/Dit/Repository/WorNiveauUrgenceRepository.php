<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Irium\WorNiveauUrgence;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<WorNiveauUrgence>
 */
class WorNiveauUrgenceRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, WorNiveauUrgence::class);
    }

    /** @return WorNiveauUrgence[] */
    public function findAllOrdered(): array
    {
        return $this->findBy([], ['description' => 'ASC']);
    }
}
