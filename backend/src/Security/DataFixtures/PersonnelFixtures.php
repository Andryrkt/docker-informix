<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\Centre;
use App\Security\Entity\Personnel;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

/**
 * Charge les données de personnel.
 * Commande : doctrine:fixtures:load --em=sqlserver --group=personnel --append --no-interaction
 *
 * La clé agServIrium (ex: center_inf_DA14) correspond au centre
 * dont le codeSage = 'DA14' (service INF, agence Administration).
 */
class PersonnelFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['personnel'];
    }

    public function load(ObjectManager $manager): void
    {
        $centreRepo = $manager->getRepository(Centre::class);

        // agServIrium → codeSage du centre correspondant
        $centreKeyMap = [
            'center_inf_DA14' => 'DA14',
        ];

        $personnels = [
            ['nom' => 'Rabe',          'prenoms' => 'Jean',  'matricule' => '9999', 'codeBancaire' => null,                              'agServIrium' => 'center_inf_DA14'],
            ['nom' => 'ANDRIANADISON', 'prenoms' => 'lanto', 'matricule' => '9998', 'codeBancaire' => '4875 96321547 89966 3211 4778',   'agServIrium' => 'center_inf_DA14'],
        ];

        $centreCache = [];

        foreach ($personnels as $data) {
            // Idempotent
            if ($manager->getRepository(Personnel::class)->findOneBy(['matricule' => $data['matricule']])) {
                continue;
            }

            $codeSage = $centreKeyMap[$data['agServIrium']] ?? null;
            $centre   = null;

            if ($codeSage) {
                if (!isset($centreCache[$codeSage])) {
                    $centreCache[$codeSage] = $centreRepo->findOneBy(['codeSage' => $codeSage]);
                }
                $centre = $centreCache[$codeSage];
            }

            $p = new Personnel();
            $p->setNom($data['nom'])
              ->setPrenoms($data['prenoms'])
              ->setMatricule($data['matricule'])
              ->setCodeBancaire($data['codeBancaire'])
              ->setCentre($centre);

            $manager->persist($p);
        }

        $manager->flush();
        echo sprintf("PersonnelFixtures: %d personnels chargés.\n", count($personnels));
    }
}
