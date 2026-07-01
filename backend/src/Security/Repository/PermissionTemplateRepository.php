<?php

namespace App\Security\Repository;

use App\Security\Entity\PermissionTemplate;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PermissionTemplate>
 */
class PermissionTemplateRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PermissionTemplate::class);
    }

    public function findByNameExcluding(string $name, ?int $excludeId): ?PermissionTemplate
    {
        $qb = $this->createQueryBuilder('t')
            ->where('t.name = :name')
            ->setParameter('name', $name);

        if ($excludeId !== null) {
            $qb->andWhere('t.id != :id')->setParameter('id', $excludeId);
        }

        return $qb->getQuery()->getOneOrNullResult();
    }
}
