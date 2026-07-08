<?php

namespace App\Dit\Entity\Irium;

use Doctrine\ORM\Mapping as ORM;

/**
 * Lookup Informix (irium) existant — catégories de demande DIT.
 * demande_intervention.categorie_demande stocke directement le libellé
 * (varchar(30)), pas cet id — cette table sert uniquement à peupler la liste
 * déroulante avec les valeurs réellement en usage.
 */
#[ORM\Entity]
#[ORM\Table(name: 'categorie_ate_app')]
class CategorieAteApp
{
    #[ORM\Id]
    #[ORM\Column(name: 'id', type: 'integer')]
    private int $id;

    #[ORM\Column(name: 'libelle_categorie_ate_app', type: 'string', length: 50, nullable: true)]
    private ?string $libelle;

    public function getId(): int { return $this->id; }
    public function getLibelle(): ?string { return $this->libelle; }
}
