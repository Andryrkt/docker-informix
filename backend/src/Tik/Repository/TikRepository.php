<?php

namespace App\Tik\Repository;

use App\Tik\Entity\Tik;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tik>
 */
class TikRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tik::class);
    }

    /**
     * @return Tik[]
     */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('t')
            ->addSelect('c', 'sc', 'ac', 'd', 'i')
            ->leftJoin('t.categorie', 'c')
            ->leftJoin('t.sousCategorie', 'sc')
            ->leftJoin('t.autresCategorie', 'ac')
            ->leftJoin('t.demandeur', 'd')
            ->leftJoin('t.intervenant', 'i')
            ->orderBy('t.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Compte les tickets déjà créés pour le préfixe donné (ex: 'TIK2607') —
     * sert à générer le numéro de séquence du mois.
     */
    public function countByNumeroPrefix(string $prefix): int
    {
        return (int) $this->createQueryBuilder('t')
            ->select('COUNT(t.id)')
            ->where('t.numeroTicket LIKE :prefix')
            ->setParameter('prefix', $prefix . '%')
            ->getQuery()
            ->getSingleScalarResult();
    }
}
