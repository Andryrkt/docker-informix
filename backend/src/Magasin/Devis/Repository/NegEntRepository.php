<?php

namespace App\Appro\Repository\Ips;

use App\Appro\Entity\Ips\NegEnt;
use App\Shared\Repository\AbstractInformixRepository;
use Doctrine\Persistence\ManagerRegistry;

class NegEntRepository extends AbstractInformixRepository
{
    public function __construct(
        ManagerRegistry $registry,
        string $dbIps = 'ips_test',
        string $dbIrium = 'irium_test'
    ) {
        parent::__construct($registry, NegEnt::class, $dbIps, $dbIrium);
    }

    /**
     * Requête principale pour la liste des devis
     */
    public function findDevisList(
        string $codeSociete,
        string $sucNeg,
        int $skip = 0,
        int $limit = 50
    ): array {
        $statutDwATraiter = 'A traiter';
        $sql = "
            SELECT
                nent.nent_datecde                                           AS date_cde_brute
                , CASE
                    WHEN dneg.statut_dw = '' OR dneg.statut_dw IS NULL THEN '$statutDwATraiter'
                    ELSE dneg.statut_dw
                END                                                         AS statut_dw
                ,dneg.statut_bc                                             AS statut_bc
                ,nent.nent_numcde                                           AS numero_devis
                ,TO_CHAR(nent.nent_datecde, '%d/%m/%Y')                     AS date_creation
                ,nent.nent_succ || ' - ' || nent_servcrt                    AS emetteur
                ,nent.nent_numcli || ' - ' || nent_nomcli                   AS client
                ,TRIM(nent.nent_refcde)                                     AS reference_client
                ,nent.nent_cdeht                                            AS montant_devis
                ,TO_CHAR(dneg.date_envoye_devis_client, '%d/%m/%Y')         AS date_envoye_devis_au_client
                ,dneg.stop_progression_global                               AS stop_progression_global
                ,dneg.motif_stop_global                                     AS motif_stop_global

                -- Pour statut_relance_1
                ,CASE
                    WHEN rl.date_relance1 IS NOT NULL
                        THEN TO_CHAR(rl.date_relance1, '%d/%m/%Y')
                    WHEN dneg.statut_bc = 'En attente bc'
                        AND NVL(rl.nb_relances, 0) = 0
                        AND dneg.date_envoye_devis_client IS NOT NULL
                        AND (TODAY - DATE(dneg.date_envoye_devis_client)) >= 7
                        AND (dneg.stop_progression_global = 0 OR dneg.stop_progression_global IS NULL)
                        THEN 'A relancer'
                    ELSE NULL
                END AS statut_relance_1
                -- Pour statut_relance_2
                ,CASE
                    WHEN rl.date_relance2 IS NOT NULL
                        THEN TO_CHAR(rl.date_relance2, '%d/%m/%Y')
                    WHEN dneg.statut_bc = 'En attente bc'
                        AND rl.nb_relances = 1
                        AND rl.delai_jours >= 7
                        AND (dneg.stop_progression_global = 0 OR dneg.stop_progression_global IS NULL)
                        THEN 'A relancer'
                    ELSE NULL
                END AS statut_relance_2

                -- Pour statut_relance_3
                ,CASE
                    WHEN rl.date_relance3 IS NOT NULL
                        THEN TO_CHAR(rl.date_relance3, '%d/%m/%Y')
                    WHEN dneg.statut_bc = 'En attente bc'
                        AND rl.nb_relances = 2
                        AND rl.delai_jours >= 7
                        AND (dneg.stop_progression_global = 0 OR dneg.stop_progression_global IS NULL)
                        THEN 'A relancer'
                    ELSE NULL
                END AS statut_relance_3

                ,nent.nent_posl                                             AS position_ips
                ,TRIM(ausr.ausr_nom)                                        AS utilisateur_createur_devis
                ,dneg.utilisateur                                           AS soumis_par
                ,nent.nent_devise                                           AS devise
                ,(SELECT MAX(nlig_constp) FROM {$this->dbIps}:informix.neg_lig WHERE nlig_numcde = nent.nent_numcde) AS constructeur

            FROM {$this->dbIps}:informix.neg_ent nent

            LEFT JOIN {$this->dbIps}:informix.agr_usr ausr
                ON ausr.ausr_num = nent.nent_usr
                AND ausr.ausr_soc = nent.nent_soc

            LEFT JOIN {$this->dbIrium}:Informix.devis_soumis_a_validation_neg dneg
                ON dneg.numero_devis = nent.nent_numcde
                AND dneg.numero_version = (SELECT MAX(numero_version) FROM {$this->dbIrium}:Informix.devis_soumis_a_validation_neg WHERE numero_devis = nent.nent_numcde)

            LEFT JOIN (
                SELECT
                    numero_devis as num_dev
                    ,MAX(CASE WHEN numero_relance = 1 THEN date_de_relance ELSE NULL END) AS date_relance1
                    ,MAX(CASE WHEN numero_relance = 2 THEN date_de_relance ELSE NULL END) AS date_relance2
                    ,MAX(CASE WHEN numero_relance = 3 THEN date_de_relance ELSE NULL END) AS date_relance3
                    ,COUNT(*) AS nb_relances
                    ,MAX(date_de_relance) AS derniere_relance
                    ,(TODAY - DATE(MAX(date_de_relance))) AS delai_jours
                FROM {$this->dbIrium}:Informix.pointage_relance
                GROUP BY 1
            ) rl ON rl.num_dev = nent.nent_numcde

            WHERE nent.nent_natop = 'DEV'
              AND nent.nent_datecde >= MDY(9, 1, 2025)
              AND nent.nent_succ = ?
              AND nent.nent_soc = ?
              AND EXISTS (
                  SELECT 1 FROM {$this->dbIps}:informix.neg_lig nl
                  WHERE nl.nlig_numcde = nent.nent_numcde
                    AND nl.nlig_codg = 'ST'
              )
            LIMIT 40
        ";

        $em = $this->getEntityManager();

        $stmt = $em->getConnection()->prepare($sql);

        $stmt->bindValue(1, $sucNeg);
        $stmt->bindValue(2, $codeSociete);

        $result = $stmt->executeQuery();
        $data = $this->fetchAndDecode($result);

        // dump($data);

        return $data;
    }

    /**
     * Récupère le code et le libellé du client
     * 
     * cette méthode utilise la table neg_ent pour récupérer le code et le libellé du client
     * 
     * @return array Les informations du client
     */
    public function getCodeLibelleClient(): array
    {
        $sql = "SELECT DISTINCT nent_numcli as code_client, nent_nomcli as nom_client
                FROM {$this->dbIps}:informix.neg_ent
                where nent_numcli IS NOT NULL AND nent_numcli != 0
                ORDER BY nent_numcli
                ";

        $em = $this->getEntityManager();
        $stmt = $em->getConnection()->prepare($sql);
        $result = $stmt->executeQuery();

        return $this->fetchAndDecode($result);
    }
}
