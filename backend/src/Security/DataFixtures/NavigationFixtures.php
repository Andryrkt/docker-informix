<?php

namespace App\Security\DataFixtures;

use App\Security\Entity\AppMenu;
use App\Security\Entity\AppModule;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class NavigationFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // --- Module MAGASIN ---
        $magasin = new AppModule();
        $magasin->setLabel('Magasin');
        $magasin->setSlug('magasin');
        $magasin->setIcon('inventory_2');
        $manager->persist($magasin);
        $this->addReference('module_magasin', $magasin);

        $devis = new AppMenu();
        $devis->setLabel('Devis');
        $devis->setSlug('devis');
        $devis->setRoute('/magasin/devis');
        $devis->setModule($magasin);
        $manager->persist($devis);
        $this->addReference('menu_devis', $devis);

        $stock = new AppMenu();
        $stock->setLabel('État du Stock');
        $stock->setSlug('stock');
        $stock->setRoute('/magasin/stock');
        $stock->setModule($magasin);
        $manager->persist($stock);

        // --- Module APPRO ---
        $appro = new AppModule();
        $appro->setLabel('Appro');
        $appro->setSlug('appro');
        $appro->setIcon('shopping_cart');
        $manager->persist($appro);
        $this->addReference('module_appro', $appro);

        $commandes = new AppMenu();
        $commandes->setLabel('Commandes Fournisseurs');
        $commandes->setSlug('commandes_fourn');
        $commandes->setRoute('/appro/commandes');
        $commandes->setModule($appro);
        $manager->persist($commandes);

        // --- Module ATELIER ---
        $atelier = new AppModule();
        $atelier->setLabel('Atelier');
        $atelier->setSlug('atelier');
        $atelier->setIcon('build');
        $manager->persist($atelier);
        $this->addReference('module_atelier', $atelier);

        $manager->flush();
    }
}
