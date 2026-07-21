<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Ips\Materiel;
use App\Shared\Repository\AbstractInformixRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends AbstractInformixRepository<Materiel>
 */
class MaterielRepository extends AbstractInformixRepository
{
    public function __construct(
        ManagerRegistry $registry,
        string $dbIps = 'ips_test',
        string $dbIrium = 'irium_test'
    ) {
        parent::__construct($registry, Materiel::class, $dbIps, $dbIrium);
    }

    /**
     * Sans terme de recherche, renvoie une page par défaut (les plus récents
     * par id) plutôt qu'une liste vide — le formulaire DIT charge cette liste
     * une fois au montage, sans saisie préalable de l'utilisateur.
     */
    public function search(string $term, int $limit = 20): array
    {
        $term = trim($term);
        $qb = $this->createQueryBuilder('m')->setMaxResults($limit);

        if ($term === '') {
            return $qb->orderBy('m.numMat', 'DESC')->getQuery()->getResult();
        }

        return $qb
            ->where('m.numParc LIKE :term OR m.numSerie LIKE :term OR m.designation LIKE :term')
            ->setParameter('term', '%' . $term . '%')
            ->getQuery()
            ->getResult();
    }

    /**
     * Résout les id matériel (base "ips") correspondant à un n° parc et/ou n°
     * série, pour filtrer ensuite `demande_intervention.id_materiel` (base
     * "irium") — les deux entités vivent sur des connexions Doctrine
     * différentes, pas de jointure DQL possible entre les deux.
     *
     * @return int[]
     */
    public function findIdsByNumParcOrNumSerie(?string $numParc, ?string $numSerie): array
    {
        $qb = $this->createQueryBuilder('m')->select('m.numMat');

        if ($numParc !== null && $numSerie !== null) {
            $qb->where('m.numParc LIKE :numParc OR m.numSerie LIKE :numSerie')
                ->setParameter('numParc', '%' . $numParc . '%')
                ->setParameter('numSerie', '%' . $numSerie . '%');
        } elseif ($numParc !== null) {
            $qb->where('m.numParc LIKE :numParc')->setParameter('numParc', '%' . $numParc . '%');
        } elseif ($numSerie !== null) {
            $qb->where('m.numSerie LIKE :numSerie')->setParameter('numSerie', '%' . $numSerie . '%');
        } else {
            return [];
        }

        return array_column($qb->getQuery()->getScalarResult(), 'numMat');
    }

    public function getHistorique(int $numMat): array
    {
        $sql = "SELECT
              TRIM(seor_succ) AS codeagence,
              TRIM(seor_servcrt) AS codeservice,
              sitv_datdeb AS datedebut,
              sitv_numor AS numeroor, 
              sitv_interv AS numerointervention, 
              TRIM(sitv_comment) AS commentaire,
              sitv_pos AS pos,
              SUM(
                slor_pxnreel * (
                CASE 
                  WHEN slor_typlig = 'P' 
                    THEN (slor_qterel + slor_qterea + slor_qteres + slor_qtewait - slor_qrec) 
                  WHEN slor_typlig IN ('F','M','U','C') 
                    THEN slor_qterea 
                END)
              ) AS somme
            FROM {$this->dbIps}.sav_eor, 
                 {$this->dbIps}.sav_lor, 
                 {$this->dbIps}.sav_itv, 
                 {$this->dbIps}.agr_succ, 
                 {$this->dbIps}.agr_tab ser, 
                 {$this->dbIps}.mat_mat, 
                 {$this->dbIps}.agr_tab ope, 
                 OUTER {$this->dbIps}.agr_tab sec
            WHERE seor_numor = slor_numor
              AND seor_serv <> 'DEV'
              AND sitv_numor = slor_numor
              AND sitv_interv = slor_nogrp/100
              AND (seor_succ = asuc_num)
              AND (seor_servcrt = ser.atab_code AND ser.atab_nom = 'SER')
              AND (sitv_typitv = sec.atab_code AND sec.atab_nom = 'TYI')
              AND (seor_ope = ope.atab_code AND ope.atab_nom = 'OPE')
              AND sitv_pos IN ('FC','FE','CP','ST', 'EC')
              AND (seor_nummat = mmat_nummat)
              AND mmat_nummat = :numMat
            GROUP BY 1,2,3,4,5,6,7
            ORDER BY sitv_pos DESC, sitv_datdeb DESC, sitv_numor, sitv_interv";

        $conn = $this->getEntityManager()->getConnection();
        $result = $conn->executeQuery($sql, ['numMat' => $numMat]);
        $data = $this->fetchAndDecode($result);

        foreach ($data as $i => $row) {
            if (isset($row['datedebut']) && $row['datedebut']) {
                $data[$i]['datedebut'] = implode('/', array_reverse(explode("-", $row['datedebut'])));
            }
            if (isset($row['somme'])) {
                // Remplacer les virgules par des points et formater
                $valStr = str_replace(',', '.', (string)$row['somme']);
                $data[$i]['somme'] = number_format((float)$valStr, 0, ',', ' ');
            }
        }

        return $data;
    }

    public function exclureHistorique(?string $refFou, ?string $recAlph, int $numMat): bool
    {
        return in_array($refFou, ['IMMODIV', 'PRESTDIV'], true)
            || $recAlph === 'EQPABS'
            || $numMat === 7711;
    }
}
