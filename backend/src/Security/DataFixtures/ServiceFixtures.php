<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\Service;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class ServiceFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        $services = [
            'NEG' => 'NÉGOCE',
            'COM' => 'COMMERCIAL',
            'ATE' => 'ATELIER',
            'CSP' => 'CSP',
            'GAR' => 'GARAGE',
            'ASS' => 'ASSURANCE',
            'FLE' => 'FLEET',
            'MAS' => 'MAGASIN SAV',
            'MAP' => 'MAGASIN PNEU',
            'LCD' => 'LOCATION COURTE DURÉE',
            'LTV' => 'LOCATION LONGUE DURÉE',
            'LFD' => 'LOCATION FORT-DAUPHIN',
            'LBV' => 'LOCATION LBV',
            'LR6' => 'LOCATION LR6',
            'LST' => 'LOCATION LST',
            'LSC' => 'LOCATION LSC',
            'MAN' => 'MANUTENTION',
            'LEV' => 'LEVAGE',
            'DIR' => 'DIRECTION',
            'FIN' => 'FINANCE',
            'PER' => 'PERSONNEL / RH',
            'INF' => 'INFORMATIQUE',
            'IMM' => 'IMMOBILIER',
            'TRA' => 'TRANSIT',
            'APP' => 'APPROVISIONNEMENT',
            'UMP' => 'UMP',
            'LGR' => 'LGR',
            'VAT' => 'VAT',
            'BLK' => 'BLK',
            'ENG' => 'ÉNERGIE',
            'SLR' => 'SOLAIRE',
            'MAH' => 'MAHAJANGA',
            'NOS' => 'NOSY BE',
            'TUL' => 'TULÉAR',
            'AMB' => 'AMBANJA',
            'LCJ' => 'LCJ',
            'FOR' => 'FORMATION',
            'THO' => 'THONIER',
            'TSD' => 'TSIROANOMANDIDY DISTRIBUTION',
            'TSI' => 'TSIROANOMANDIDY',
            'C1'  => 'TRAVEL AIRWAYS C1',
        ];

        foreach ($services as $code => $name) {
            $service = new Service();
            $service->setCode($code);
            $service->setName($name);
            
            $manager->persist($service);
            $this->addReference('service_' . strtolower($code), $service);
        }

        $manager->flush();
    }
}
