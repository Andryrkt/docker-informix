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
     * Utilisateurs ayant ROLE_ADMIN et dont l'agence/service PAR DÉFAUT
     * (fiche Personnel → Centre) correspond aux codes donnés.
     *
     * Le rattachement User ↔ Personnel se fait par matricule (renseigné
     * manuellement sur User), pas par une FK — volontaire, cf. demande métier.
     *
     * Volontairement basé sur l'affectation réelle (Personnel/Centre) plutôt que
     * sur le périmètre autorisé (UserScope), qui peut être bien plus large pour
     * un admin ayant accès à plusieurs agences/services.
     *
     * @return User[]
     */
    public function findAdminsByAgencyAndService(string $agencyCode, string $serviceCode): array
    {
        $candidates = $this->createQueryBuilder('u')
            ->innerJoin('App\Security\Entity\Personnel', 'p', 'WITH', 'p.matricule = u.matricule')
            ->innerJoin('p.centre', 'c')
            ->innerJoin('c.agency', 'a')
            ->innerJoin('c.service', 'sv')
            ->where('a.code = :agencyCode')
            ->andWhere('sv.code = :serviceCode')
            ->setParameter('agencyCode', $agencyCode)
            ->setParameter('serviceCode', $serviceCode)
            ->getQuery()
            ->getResult();

        return array_values(array_filter(
            $candidates,
            static fn(User $u) => in_array('ROLE_ADMIN', $u->getRoles(), true),
        ));
    }

    /**
     * Crée ou met à jour un utilisateur depuis les attributs LDAP.
     *
     * @param array<string, mixed> $ldapAttributes
     */
    public function findOrCreateFromLdap(string $username, array $ldapAttributes): User
    {
        $ta = microtime(true);
        $user = $this->findByUsername($username);
        error_log(sprintf('[AUTH] SQL findByUsername: %dms', (int)((microtime(true) - $ta) * 1000)));

        $email       = $ldapAttributes['mail'] ?? null;
        $displayName = $ldapAttributes['cn'] ?? $ldapAttributes['displayname'] ?? null;
        $department  = $ldapAttributes['department'] ?? null;
        $ldapDn      = $ldapAttributes['dn'] ?? null;

        if (!$user) {
            $user = new User();
            $user->setUsername($username);
            $user->setEmail($email);
            $user->setDisplayName($displayName);
            $user->setDepartment($department);
            $user->setLdapDn($ldapDn);

            $em = $this->getEntityManager();
            $em->persist($user);
            $tb = microtime(true);
            $em->flush();
            error_log(sprintf('[AUTH] SQL flush (insert): %dms', (int)((microtime(true) - $tb) * 1000)));

            return $user;
        }

        // LDAP ne fournit pas toujours 'mail' : ne jamais écraser un email déjà
        // renseigné (LDAP ou saisi manuellement en admin) par une valeur vide.
        $nextEmail = $email ?? $user->getEmail();

        // Pour un utilisateur existant, ne flusher que si les attributs LDAP ont changé.
        $changed = $user->getEmail() !== $nextEmail
            || $user->getDisplayName() !== $displayName
            || $user->getDepartment() !== $department
            || $user->getLdapDn() !== $ldapDn;

        if ($changed) {
            $user->setEmail($nextEmail);
            $user->setDisplayName($displayName);
            $user->setDepartment($department);
            $user->setLdapDn($ldapDn);

            $tb = microtime(true);
            $this->getEntityManager()->flush();
            error_log(sprintf('[AUTH] SQL flush (update): %dms', (int)((microtime(true) - $tb) * 1000)));
        } else {
            error_log('[AUTH] SQL flush skipped (no changes)');
        }

        return $user;
    }
}
