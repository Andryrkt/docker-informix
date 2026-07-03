<?php

namespace App\Tik\Repository;

use App\Tik\Entity\TikSousCategorie;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TikSousCategorie>
 */
class TikSousCategorieRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TikSousCategorie::class);
    }
}
