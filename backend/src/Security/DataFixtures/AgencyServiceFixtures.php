<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\Agency;
use App\Security\Entity\Service;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AgencyServiceFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $associations = [
            'agence_antanarivo' => ['NEG', 'COM', 'ATE', 'CSP', 'GAR', 'ASS', 'FLE', 'MAS', 'MAP'],
            'agence_cessna_ivato' => ['NEG', 'ATE', 'LCD'],
            'agence_fort_dauphin' => ['NEG', 'ATE', 'MAP'],
            'agence_ambatovy' => ['NEG', 'ATE', 'MAN', 'FLE'],
            'agence_tamatave' => ['NEG', 'ATE', 'LCD', 'FLE', 'LEV'],
            'agence_rental' => ['LCD', 'LTV', 'LFD', 'LBV', 'LR6', 'LST', 'LSC'],
            'agence_pneu_outil_lub' => ['NEG', 'ATE', 'MAP'],
            'agence_administration' => ['DIR', 'FIN', 'PER', 'INF', 'IMM', 'TRA', 'APP', 'UMP'],
            'agence_comm_energie' => ['COM', 'LGR'],
            'agence_energie_durable' => ['VAT', 'BLK', 'ENG', 'SLR'],
            'agence_energie_jirama' => ['MAH', 'NOS', 'TUL', 'AMB', 'LCJ', 'TSI'],
            'agence_travel_airways' => ['C1'],
        ];

        foreach ($associations as $agenceRef => $serviceCodes) {
            /** @var Agency $agence */
            $agence = $this->getReference($agenceRef, Agency::class);

            foreach ($serviceCodes as $serviceCode) {
                /** @var Service $service */
                $service = $this->getReference('service_' . strtolower($serviceCode), Service::class);
                $agence->addService($service);
            }

            $manager->persist($agence);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            AgencyFixtures::class,
            ServiceFixtures::class,
        ];
    }
}
