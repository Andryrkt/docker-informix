<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\Company;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class CompanyFixtures extends Fixture
{
    public const COMPANY_HFF    = 'company_hff';
    public const COMPANY_FRAISE = 'company_fraise';

    public function load(ObjectManager $manager): void
    {
        $hff = new Company();
        $hff->setName('HOLDING FRAISE');
        $hff->setCode('HFF');
        $manager->persist($hff);
        $this->addReference(self::COMPANY_HFF, $hff);

        $fraise = new Company();
        $fraise->setName('FRAISE SUD');
        $fraise->setCode('FS');
        $manager->persist($fraise);
        $this->addReference(self::COMPANY_FRAISE, $fraise);

        $manager->flush();
    }
}
