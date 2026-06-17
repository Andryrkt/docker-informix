<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\Agency;
use App\Security\Entity\Service;
use App\Security\Entity\User;
use App\Security\Entity\UserScope;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class UserScopeFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $user = $manager->getRepository(User::class)->findOneBy(['username' => 'admin']);
        if (!$user) {
            return;
        }

        $scope = new UserScope();
        $scope->setUser($user);

        // On lui donne accès à l'agence Antananarivo et Tamatave
        $scope->addAgency($this->getReference('agence_antanarivo', Agency::class));
        $scope->addAgency($this->getReference('agence_tamatave', Agency::class));

        // On lui donne accès aux services NEG et ATE
        $scope->addService($this->getReference('service_neg', Service::class));
        $scope->addService($this->getReference('service_ate', Service::class));

        $manager->persist($scope);
        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            AgencyFixtures::class,
            ServiceFixtures::class,
            AgencyServiceFixtures::class,
        ];
    }
}
