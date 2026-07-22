<?php

namespace App\Dit\Entity\Ips;

use Doctrine\ORM\Mapping as ORM;

/**
 * Matériel ERP (Informix ips, table `mat_mat`), lecture seule.
 *
 * `mmat_compteur` sert de compteur générique (km ou heures selon le type de
 * matériel) dans le legacy — il n'y a pas de colonne "casier" ni de km/heures
 * distincts directement sur cette table (le legacy les recalculait via une
 * jointure complexe sur mat_hir/mat_bil, hors périmètre ici). Ces valeurs ne
 * sont donc pas exposées pour l'instant plutôt que de deviner une mauvaise
 * source.
 */
#[ORM\Entity]
#[ORM\Table(name: 'mat_mat')]
class Materiel
{
    #[ORM\Id]
    #[ORM\Column(name: 'mmat_nummat', type: 'integer')]
    private int $numMat;

    #[ORM\Column(name: 'mmat_numserie', type: 'string', length: 20, nullable: true)]
    private ?string $numSerie;

    #[ORM\Column(name: 'mmat_numparc', type: 'string', length: 20, nullable: true)]
    private ?string $numParc;

    #[ORM\Column(name: 'mmat_desi', type: 'string', length: 30, nullable: true)]
    private ?string $designation;

    #[ORM\Column(name: 'mmat_marqmat', type: 'string', length: 4, nullable: true)]
    private ?string $constructeur;

    #[ORM\Column(name: 'mmat_typmat', type: 'string', length: 30, nullable: true)]
    private ?string $modele;

    #[ORM\Column(name: 'mmat_reffou', type: 'string', length: 15, nullable: true)]
    private ?string $refFou;

    #[ORM\Column(name: 'mmat_recalph', type: 'string', length: 15, nullable: true)]
    private ?string $recAlph;

    public function getNumMat(): int { return $this->numMat; }
    public function getNumSerie(): ?string { return $this->numSerie; }
    public function getNumParc(): ?string { return $this->numParc; }
    public function getDesignation(): ?string { return $this->designation; }
    public function getConstructeur(): ?string { return $this->constructeur; }
    public function getModele(): ?string { return $this->modele; }
    public function getRefFou(): ?string { return $this->refFou; }
    public function getRecAlph(): ?string { return $this->recAlph; }
}
