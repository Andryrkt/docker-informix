<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Irium\StatutDemande;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<StatutDemande>
 */
class StatutDemandeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, StatutDemande::class);
    }

    /** @return StatutDemande[] */
    public function findForDit(): array
    {
        return $this->findBy(['codeApplication' => 'DIT'], ['id' => 'ASC']);
    }
}
