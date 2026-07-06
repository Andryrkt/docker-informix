<?php

namespace App\Tik\DataFixtures;

use App\Security\Entity\Agency;
use App\Security\Entity\Personnel;
use App\Security\Entity\Service;
use App\Security\Entity\User;
use App\Tik\Entity\Tik;
use App\Tik\Entity\TikCategorie;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

/**
 * Jeu de tickets fictifs pour tester le module Tik (liste, detail, planification...).
 * Idempotent : recharger la fixture ne duplique pas les tickets deja crees.
 *
 * Ecrit en DBAL brut (comme TikController) plutot que via l'ORM : le driver
 * SQL Server de ce projet rejette le format datetime par defaut de Doctrine
 * ("Y-m-d H:i:s") avec une erreur de conversion — le format ISO avec 'T'
 * ("Y-m-d\TH:i:s") est celui utilise partout ailleurs dans l'appli.
 *
 * Commande : doctrine:fixtures:load --em=sqlserver --group=tik --append --no-interaction
 */
class TikFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['tik'];
    }

    public function load(ObjectManager $manager): void
    {
        $conn = $manager->getConnection();

        $categories = $manager->getRepository(TikCategorie::class)->findAll();
        $users = $manager->getRepository(User::class)->findAll();

        if (empty($categories) || empty($users)) {
            echo "TikFixtures: categories (sql/create_tik_tables.sql) ou users manquants, rien a charger.\n";
            return;
        }

        $categorieByLibelle = [];
        foreach ($categories as $c) {
            $categorieByLibelle[$c->getDescription()] = $c;
        }

        $personnels = $manager->getRepository(Personnel::class)->findAll();
        $agencies = $manager->getRepository(Agency::class)->findAll();
        $services = $manager->getRepository(Service::class)->findAll();

        $demandeur = fn (int $i) => $users[$i % count($users)];
        $intervenant = fn (int $i) => empty($personnels) ? null : $personnels[$i % count($personnels)];
        $agence = fn (int $i) => empty($agencies) ? null : $agencies[$i % count($agencies)];
        $service = fn (int $i) => empty($services) ? null : $services[$i % count($services)];
        $categorie = fn (string $libelle) => $categorieByLibelle[$libelle] ?? $categories[0];

        $tickets = [
            ['objet' => '[TEST] PC ne demarre plus', 'detail' => "Le poste ne s'allume plus depuis ce matin, voyant d'alimentation eteint.", 'categorie' => 'MATERIELS', 'urgence' => 'P1', 'statut' => Tik::STATUT_OUVERT, 'joursCreation' => 0, 'joursFin' => 2],
            ['objet' => '[TEST] Ecran qui scintille', 'detail' => 'Ecran externe qui scintille par intermittence, cable deja verifie.', 'categorie' => 'MATERIELS', 'urgence' => 'P3', 'statut' => Tik::STATUT_OUVERT, 'joursCreation' => 1, 'joursFin' => 5],
            ['objet' => '[TEST] Demande installation Office', 'detail' => "Merci d'installer la suite Office sur le nouveau poste du service comptabilite.", 'categorie' => 'BUREAUTIQUE', 'urgence' => 'P4', 'statut' => Tik::STATUT_EN_ATTENTE, 'joursCreation' => 2, 'joursFin' => 7],
            ['objet' => '[TEST] Compte bloque apres tentatives echouees', 'detail' => 'Le compte utilisateur est verrouille suite a plusieurs mots de passe errones.', 'categorie' => 'SECURITE', 'urgence' => 'P2', 'statut' => Tik::STATUT_EN_COURS, 'joursCreation' => 3, 'joursFin' => 1],
            ['objet' => '[TEST] Boite mail pleine', 'detail' => "La boite mail n'accepte plus de nouveaux messages, quota depasse.", 'categorie' => 'MESSAGERIE', 'urgence' => 'P3', 'statut' => Tik::STATUT_EN_COURS, 'joursCreation' => 4, 'joursFin' => 3],
            ['objet' => '[TEST] Coupure reseau agence', 'detail' => "Perte de connexion reseau intermittente sur l'ensemble des postes de l'agence.", 'categorie' => 'RESEAU INFORMATIQUE', 'urgence' => 'P1', 'statut' => Tik::STATUT_PLANIFIE, 'joursCreation' => 5, 'joursFin' => 1],
            ['objet' => '[TEST] Mise a jour application metier', 'detail' => "Demande de mise a jour de l'application metier vers la derniere version.", 'categorie' => 'APPLICATION METIER', 'urgence' => 'P4', 'statut' => Tik::STATUT_PLANIFIE, 'joursCreation' => 6, 'joursFin' => 10],
            ['objet' => '[TEST] Imprimante hors service', 'detail' => "L'imprimante du 2eme etage affiche une erreur de bourrage papier persistante.", 'categorie' => 'MATERIELS', 'urgence' => 'P3', 'statut' => Tik::STATUT_RESOLU, 'joursCreation' => 8, 'joursFin' => 4],
            ['objet' => '[TEST] Acces intranet impossible', 'detail' => "Impossible d'acceder au portail intranet depuis hier, message d'erreur 403.", 'categorie' => 'SERVICE INTERNET', 'urgence' => 'P2', 'statut' => Tik::STATUT_RESOLU, 'joursCreation' => 9, 'joursFin' => 2],
            ['objet' => '[TEST] Export rapport mensuel en erreur', 'detail' => "L'export du rapport mensuel echoue avec un message d'erreur SQL.", 'categorie' => 'REPORTING', 'urgence' => 'P3', 'statut' => Tik::STATUT_CLOTURE, 'joursCreation' => 12, 'joursFin' => 6],
            ['objet' => '[TEST] Fourniture cable reseau', 'detail' => 'Besoin de deux cables reseau supplementaires pour le nouveau poste.', 'categorie' => 'SERVICE DIVERS', 'urgence' => 'P5', 'statut' => Tik::STATUT_CLOTURE, 'joursCreation' => 15, 'joursFin' => 20],
            ['objet' => '[TEST] Demande hors perimetre IT', 'detail' => 'Demande concernant du materiel non gere par le service informatique.', 'categorie' => 'SERVICE DIVERS', 'urgence' => 'P4', 'statut' => Tik::STATUT_REFUSE, 'joursCreation' => 10, 'joursFin' => 15],
            ['objet' => '[TEST] Probleme resolu puis reapparu', 'detail' => 'Le probleme signale la semaine derniere est revenu, meme comportement.', 'categorie' => 'APPLICATION METIER', 'urgence' => 'P2', 'statut' => Tik::STATUT_REOUVERT, 'joursCreation' => 7, 'joursFin' => 2],
        ];

        $created = 0;

        foreach ($tickets as $i => $data) {
            if ($conn->fetchOne('SELECT id FROM tik_ticket WHERE objet_demande = ?', [$data['objet']])) {
                continue;
            }

            $createdAt = (new \DateTime())->modify(sprintf('-%d days', $data['joursCreation']));
            $dateFinSouhaitee = (new \DateTime())->modify(sprintf('+%d days', $data['joursFin']));

            $prefix = 'TIK' . $createdAt->format('ym');
            $sequence = (int) $conn->fetchOne('SELECT COUNT(*) FROM tik_ticket WHERE numero_ticket LIKE ?', [$prefix . '%']) + 1;
            $numero = $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);

            $estTraite = $data['statut'] !== Tik::STATUT_OUVERT;
            $estAffecte = in_array($data['statut'], [Tik::STATUT_PLANIFIE, Tik::STATUT_EN_COURS, Tik::STATUT_RESOLU, Tik::STATUT_CLOTURE, Tik::STATUT_REOUVERT], true);

            $conn->insert('tik_ticket', array_filter([
                'numero_ticket'       => $numero,
                'objet_demande'       => $data['objet'],
                'detail_demande'      => $data['detail'],
                'categorie_id'        => $categorie($data['categorie'])->getId(),
                'niveau_urgence'      => $data['urgence'],
                'demandeur_id'        => $demandeur($i)->getId(),
                'agence_emetteur_id'  => $agence($i)?->getId(),
                'service_emetteur_id' => $service($i)?->getId(),
                'date_fin_souhaitee'  => $dateFinSouhaitee->format('Y-m-d\TH:i:s'),
                'statut'              => $data['statut'],
                'validateur_id'       => $estTraite ? $demandeur($i + 1)->getId() : null,
                'intervenant_id'      => $estAffecte ? $intervenant($i)?->getId() : null,
                'date_debut_planning' => $estAffecte ? (clone $createdAt)->modify('+1 day')->format('Y-m-d\TH:i:s') : null,
                'date_fin_planning'   => $estAffecte ? (clone $createdAt)->modify('+3 days')->format('Y-m-d\TH:i:s') : null,
                'created_at'          => $createdAt->format('Y-m-d\TH:i:s'),
            ], static fn ($v) => $v !== null));

            $id = (int) $conn->lastInsertId();

            $conn->insert('tik_historique', [
                'tik_id'      => $id,
                'statut'      => $data['statut'],
                'commentaire' => 'Donnee de test generee par TikFixtures',
                'user_id'     => $demandeur($i)->getId(),
                'created_at'  => $createdAt->format('Y-m-d\TH:i:s'),
            ]);

            $created++;
        }

        echo sprintf("TikFixtures: %d tickets de test crees.\n", $created);
    }
}
