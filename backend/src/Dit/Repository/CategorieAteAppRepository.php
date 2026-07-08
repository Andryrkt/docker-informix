<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Irium\CategorieAteApp;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CategorieAteApp>
 */
class CategorieAteAppRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CategorieAteApp::class);
    }

    /** @return CategorieAteApp[] */
    public function findAllOrdered(): array
    {
        return $this->findBy([], ['libelle' => 'ASC']);
    }
}
