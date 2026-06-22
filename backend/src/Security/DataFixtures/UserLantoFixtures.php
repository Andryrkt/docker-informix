<?php

namespace App\Security\DataFixtures;

use App\Security\AppAction;
use App\Security\Entity\Agency;
use App\Security\Entity\AppMenu;
use App\Security\Entity\AppModule;
use App\Security\Entity\Company;
use App\Security\Entity\Service;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use App\Security\Entity\UserScope;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UserLantoFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // 1. Récupérer l'utilisateur lanto (déjà créé par LDAP) ou le créer s'il n'existe pas encore en base
        $user = $manager->getRepository(User::class)->findOneBy(['username' => 'lanto']);
        if (!$user) {
            $user = new User();
            $user->setUsername('lanto');
            $user->setDisplayName('Lanto ANDRIANADISON');
            $user->setRoles(['ROLE_USER']);
            $manager->persist($user);
        }

        $company = $this->getReference(CompanyFixtures::COMPANY_HFF, Company::class);

        // 2. Donner accès à tous les Modules (Vignettes)
        $modules = $manager->getRepository(AppModule::class)->findAll();
        foreach ($modules as $module) {
            $perm = new UserPermission();
            $perm->setUser($user);
            $perm->setCompany($company);
            $perm->setResourceType('module');
            $perm->setResourceId($module->getId());
            $perm->setActions([AppAction::VIEW]);
            $perm->setAllAgences(true);
            $perm->setAllServices(true);
            $manager->persist($perm);
        }

        // 3. Donner accès à tous les Menus avec tous les droits (CRUD+)
        $menus = $manager->getRepository(AppMenu::class)->findAll();
        foreach ($menus as $menu) {
            $perm = new UserPermission();
            $perm->setUser($user);
            $perm->setCompany($company);
            $perm->setResourceType('menu');
            $perm->setResourceId($menu->getId());
            $perm->setActions(AppAction::ALL); // Tous les droits !
            $perm->setAllAgences(true);
            $perm->setAllServices(true);
            $manager->persist($perm);
        }

        // 4. Définir le Scope (Agences et Services)
        $scope = $manager->getRepository(UserScope::class)->findOneBy(['user' => $user]);
        if (!$scope) {
            $scope = new UserScope();
            $scope->setUser($user);
        }

        // On lui donne accès à toutes les agences créées en fixture
        $agencies = $manager->getRepository(Agency::class)->findAll();
        foreach ($agencies as $agency) {
            $scope->addAgency($agency);
        }

        // Et à tous les services
        $services = $manager->getRepository(Service::class)->findAll();
        foreach ($services as $service) {
            $scope->addService($service);
        }

        $manager->persist($scope);
        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            CompanyFixtures::class,
            ServiceFixtures::class,
            AgencyFixtures::class,
            NavigationFixtures::class,
        ];
    }
}
