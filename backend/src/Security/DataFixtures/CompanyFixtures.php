<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\Company;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CompanyFixtures extends Fixture
{
    public const COMPANY_HFF = 'company_hff';

    public function load(ObjectManager $manager): void
    {
        $company = new Company();
        $company->setName('HOLDING FRAISE');
        $company->setCode('HFF');
        
        $manager->persist($company);
        $this->addReference(self::COMPANY_HFF, $company);

        $manager->flush();
    }
}
