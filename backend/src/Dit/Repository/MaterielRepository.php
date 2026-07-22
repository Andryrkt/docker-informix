<?php

namespace App\Dit\Repository;

use App\Dit\Entity\Ips\Materiel;
use App\Shared\Repository\AbstractInformixRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

/**
 * @extends AbstractInformixRepository<Materiel>
 */
class MaterielRepository extends AbstractInformixRepository
{
    public function __construct(
        ManagerRegistry $registry,
        private readonly CacheInterface $materielSearchCache,
        string $dbIps = 'ips_test',
        string $dbIrium = 'irium_test'
    ) {
        parent::__construct($registry, Materiel::class, $dbIps, $dbIrium);
    }

    /**
     * Recherche full-text de matériels avec cache Redis (TTL 5 min).
     * Sans terme, renvoie les 30 matériels les plus récents.
     */
    public function search(string $term, int $limit = 30): array
    {
        $term = trim($term);
        // Clé de cache : term + limit (sanitizée pour Redis)
        $cacheKey = 'mat_search_' . md5($term . '_' . $limit);

        return $this->materielSearchCache->get($cacheKey, function (ItemInterface $item) use ($term, $limit): array {
            $item->expiresAfter(300); // 5 minutes
            return $this->doSearch($term, $limit);
        });
    }

    private function doSearch(string $term, int $limit): array
    {
        // LEFT JOIN sur la dernière entrée de mat_hir (au lieu de 2 sous-requêtes
        // corrélées dans le SELECT, qui forcent N×2 accès sur mat_hir).
        $joinHir = "LEFT OUTER JOIN mat_hir h
                       ON  h.mhir_nummat  = m.mmat_nummat
                       AND h.mhir_daterel = (
                               SELECT MAX(b.mhir_daterel)
                               FROM   mat_hir b
                               WHERE  b.mhir_nummat = m.mmat_nummat
                           )";

        $selectCols = "m.mmat_nummat, m.mmat_numserie, m.mmat_numparc,
                       m.mmat_recalph, m.mmat_desi, m.mmat_marqmat, m.mmat_typmat,
                       h.mhir_compteur AS heure, h.mhir_cumcomp AS km";

        $conn = $this->getEntityManager()->getConnection();

        if ($term === '') {
            $sql = "SELECT FIRST {$limit} {$selectCols}
                    FROM  mat_mat m {$joinHir}
                    ORDER BY m.mmat_nummat DESC";
            $result = $conn->executeQuery($sql);
        } elseif (is_numeric($term)) {
            $sql = "SELECT FIRST {$limit} {$selectCols}
                    FROM  mat_mat m {$joinHir}
                    WHERE m.mmat_nummat  = ?
                       OR m.mmat_recalph LIKE ?
                       OR m.mmat_numserie LIKE ?
                       OR m.mmat_desi    LIKE ?";
            $like = '%' . $term . '%';
            $result = $conn->executeQuery($sql, [(int) $term, $like, $like, $like]);
        } else {
            $sql = "SELECT FIRST {$limit} {$selectCols}
                    FROM  mat_mat m {$joinHir}
                    WHERE m.mmat_recalph LIKE ?
                       OR m.mmat_numserie LIKE ?
                       OR m.mmat_desi    LIKE ?";
            $like = '%' . $term . '%';
            $result = $conn->executeQuery($sql, [$like, $like, $like]);
        }

        return $this->fetchAndDecode($result);
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
            FROM sav_eor, 
                 sav_lor, 
                 sav_itv, 
                 agr_succ, 
                 agr_tab ser, 
                 mat_mat, 
                 agr_tab ope, 
                 OUTER agr_tab sec
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
