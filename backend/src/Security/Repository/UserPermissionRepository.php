<?php

namespace App\Security\Repository;

use App\Security\Entity\UserPermission;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<UserPermission>
 */
class UserPermissionRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, UserPermission::class);
    }

    /**
     * Trouve toutes les permissions d'un utilisateur pour une société donnée.
     */
    public function findByUserAndCompany($user, $company): array
    {
        return $this->findBy([
            'user' => $user,
            'company' => $company
        ]);
    }
}
