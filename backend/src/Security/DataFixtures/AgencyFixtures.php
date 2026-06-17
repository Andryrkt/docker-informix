<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\Agency;
use App\Security\Entity\Company;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class AgencyFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $agences = [
            ['code' => '01', 'name' => 'ANTANANARIVO', 'reference' => 'agence_antanarivo'],
            ['code' => '02', 'name' => 'CESSNA IVATO', 'reference' => 'agence_cessna_ivato'],
            ['code' => '20', 'name' => 'FORT-DAUPHIN', 'reference' => 'agence_fort_dauphin'],
            ['code' => '30', 'name' => 'AMBATOVY', 'reference' => 'agence_ambatovy'],
            ['code' => '40', 'name' => 'TAMATAVE', 'reference' => 'agence_tamatave'],
            ['code' => '50', 'name' => 'RENTAL', 'reference' => 'agence_rental'],
            ['code' => '60', 'name' => 'PNEU - OUTIL - LUB', 'reference' => 'agence_pneu_outil_lub'],
            ['code' => '80', 'name' => 'ADMINISTRATION', 'reference' => 'agence_administration'],
            ['code' => '90', 'name' => 'COMM ENERGIE', 'reference' => 'agence_comm_energie'],
            ['code' => '91', 'name' => 'ENERGIE DURABLE', 'reference' => 'agence_energie_durable'],
            ['code' => '92', 'name' => 'ENERGIE JIRAMA', 'reference' => 'agence_energie_jirama'],
            ['code' => 'C1', 'name' => 'TRAVEL AIRWAYS', 'reference' => 'agence_travel_airways'],
        ];

        $company = $this->getReference(CompanyFixtures::COMPANY_HFF, Company::class);

        foreach ($agences as $agenceData) {
            $agence = new Agency();
            $agence->setCode($agenceData['code']);
            $agence->setName($agenceData['name']);
            $agence->setCompany($company);

            $manager->persist($agence);
            $this->addReference($agenceData['reference'], $agence);
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            CompanyFixtures::class,
        ];
    }
}
