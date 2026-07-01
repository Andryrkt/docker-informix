<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\AppActionDef;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class AppActionDefFixtures extends Fixture implements FixtureGroupInterface
{
    private const ACTIONS = [
        ['key' => 'view',               'label' => 'Voir',                  'category' => 'Lecture',        'order' => 1],
        ['key' => 'export',             'label' => 'Exporter',              'category' => 'Lecture',        'order' => 2],
        ['key' => 'print',              'label' => 'Imprimer',              'category' => 'Lecture',        'order' => 3],
        ['key' => 'create',             'label' => 'Créer',                 'category' => 'Écriture',       'order' => 10],
        ['key' => 'edit',               'label' => 'Modifier',              'category' => 'Écriture',       'order' => 11],
        ['key' => 'delete',             'label' => 'Supprimer',             'category' => 'Écriture',       'order' => 12],
        ['key' => 'validate',           'label' => 'Valider',               'category' => 'Métier',         'order' => 20],
        ['key' => 'approve',            'label' => 'Approuver',             'category' => 'Métier',         'order' => 21],
        ['key' => 'duplicate',          'label' => 'Dupliquer',             'category' => 'Métier',         'order' => 22],
        ['key' => 'archive',            'label' => 'Archiver',              'category' => 'Métier',         'order' => 23],
        ['key' => 'import',             'label' => 'Importer',              'category' => 'Import',         'order' => 30],
        ['key' => 'manage_users',       'label' => 'Gérer utilisateurs',    'category' => 'Administration', 'order' => 40],
        ['key' => 'manage_permissions', 'label' => 'Gérer permissions',     'category' => 'Administration', 'order' => 41],
    ];

    public static function getGroups(): array
    {
        return ['actions'];
    }

    public function load(ObjectManager $manager): void
    {
        foreach (self::ACTIONS as $def) {
            $existing = $manager->getRepository(AppActionDef::class)->findOneBy(['actionKey' => $def['key']]);
            if ($existing) {
                continue;
            }

            $action = new AppActionDef();
            $action->setActionKey($def['key']);
            $action->setLabel($def['label']);
            $action->setCategory($def['category']);
            $action->setSortOrder($def['order']);
            $manager->persist($action);
        }

        $manager->flush();
    }
}
