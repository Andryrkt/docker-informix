<?php

namespace App\Security\DataFixtures;

use App\Security\AppAction;
use App\Security\Entity\AppMenu;
use App\Security\Entity\AppModule;
use App\Security\Entity\Company;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UserPermissionFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Récupérer un utilisateur existant ou en créer un pour le test
        $user = $manager->getRepository(User::class)->findOneBy(['username' => 'admin']);
        if (!$user) {
            $user = new User();
            $user->setUsername('admin');
            $user->setDisplayName('Administrateur Test');
            $user->setEmail('admin@fraise.hff.mg');
            $user->setRoles(['ROLE_USER']);
            $manager->persist($user);
        }

        $company = $this->getReference(CompanyFixtures::COMPANY_HFF, Company::class);

        // --- Permissions pour le module MAGASIN ---
        /** @var AppModule $magasin */
        $magasin = $this->getReference('module_magasin', AppModule::class);
        $permMag = new UserPermission();
        $permMag->setUser($user);
        $permMag->setCompany($company);
        $permMag->setResourceType('module');
        $permMag->setResourceId($magasin->getId());
        $permMag->setActions([AppAction::VIEW]);
        $permMag->setAllAgences(true); // Par défaut on voit tout pour le module
        $permMag->setAllServices(true);
        $manager->persist($permMag);

        // --- Permissions pour le menu DEVIS (Vue + Edit + Validate) ---
        /** @var AppMenu $devis */
        $devis = $this->getReference('menu_devis', AppMenu::class);
        $permDevis = new UserPermission();
        $permDevis->setUser($user);
        $permDevis->setCompany($company);
        $permDevis->setResourceType('menu');
        $permDevis->setResourceId($devis->getId());
        $permDevis->setActions([
            AppAction::VIEW, 
            AppAction::CREATE, 
            AppAction::EDIT, 
            AppAction::VALIDATE,
            AppAction::EXPORT
        ]);
        $permDevis->setAllAgences(false);
        $permDevis->setAgenceIds([1, 40]); // Agences de test
        $permDevis->setAllServices(true);
        $manager->persist($permDevis);

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            CompanyFixtures::class,
            NavigationFixtures::class,
        ];
    }
}
