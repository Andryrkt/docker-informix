<?php

namespace App\Tik\DataFixtures;

use App\Security\AppAction;
use App\Security\Entity\AppModule;
use App\Security\Entity\Company;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

/**
 * Accorde aux utilisateurs de test (lanto, admin) les droits validateur et
 * intervenant sur le module Tik, pour toutes les societes existantes — permet
 * de tester le formulaire de validation (valider/refuser/mettre en attente)
 * en local sans passer par la vraie gestion des habilitations.
 * Idempotent : recharger met a jour les permissions existantes au lieu de les dupliquer.
 *
 * Commande : doctrine:fixtures:load --em=sqlserver --group=tik-permissions --append --no-interaction
 */
class TikPermissionFixtures extends Fixture implements FixtureGroupInterface
{
    private const USERNAMES = ['lanto', 'admin'];

    public static function getGroups(): array
    {
        return ['tik-permissions'];
    }

    public function load(ObjectManager $manager): void
    {
        $module = $manager->getRepository(AppModule::class)->findOneBy(['slug' => 'tik']);
        if (!$module) {
            echo "TikPermissionFixtures: module 'tik' introuvable.\n";
            return;
        }

        $companies = $manager->getRepository(Company::class)->findAll();
        if (empty($companies)) {
            echo "TikPermissionFixtures: aucune societe en base.\n";
            return;
        }

        $granted = 0;

        foreach (self::USERNAMES as $username) {
            $user = $manager->getRepository(User::class)->findOneBy(['username' => $username]);
            if (!$user) {
                continue;
            }

            foreach ($companies as $company) {
                $permission = $manager->getRepository(UserPermission::class)->findOneBy([
                    'user' => $user,
                    'company' => $company,
                    'resourceType' => 'module',
                    'resourceId' => $module->getId(),
                ]);

                if (!$permission) {
                    $permission = new UserPermission();
                    $permission->setUser($user);
                    $permission->setCompany($company);
                    $permission->setResourceType('module');
                    $permission->setResourceId($module->getId());
                    $permission->setScopeAll(true);
                }

                $permission->setActions(array_unique([
                    ...$permission->getActions(),
                    AppAction::VIEW,
                    AppAction::VALIDATE,
                    AppAction::INTERVENE,
                ]));

                $manager->persist($permission);
                $granted++;
            }
        }

        $manager->flush();
        echo sprintf("TikPermissionFixtures: %d permission(s) validateur/intervenant accordees.\n", $granted);
    }
}
