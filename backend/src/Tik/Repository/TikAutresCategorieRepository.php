<?php

namespace App\Tik\Repository;

use App\Tik\Entity\TikAutresCategorie;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<TikAutresCategorie>
 */
class TikAutresCategorieRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, TikAutresCategorie::class);
    }
}
