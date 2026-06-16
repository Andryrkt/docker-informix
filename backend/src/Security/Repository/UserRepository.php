<?php

namespace App\Security\Repository;

use App\Security\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<User>
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    /**
     * Cherche un utilisateur par son sAMAccountName (username LDAP).
     */
    public function findByUsername(string $username): ?User
    {
        return $this->findOneBy(['username' => $username]);
    }

    /**
     * Crée ou met à jour un utilisateur depuis les attributs LDAP.
     *
     * @param array<string, mixed> $ldapAttributes
     */
    public function findOrCreateFromLdap(string $username, array $ldapAttributes): User
    {
        $user = $this->findByUsername($username);

        if (!$user) {
            $user = new User();
            $user->setUsername($username);
        }

        $user->setEmail($ldapAttributes['mail'] ?? null);
        $user->setDisplayName($ldapAttributes['cn'] ?? $ldapAttributes['displayname'] ?? null);
        $user->setDepartment($ldapAttributes['department'] ?? null);
        $user->setLdapDn($ldapAttributes['dn'] ?? null);
        $user->setLastLoginAt(new \DateTime());

        $em = $this->getEntityManager();
        $em->persist($user);
        $em->flush();

        return $user;
    }
}
