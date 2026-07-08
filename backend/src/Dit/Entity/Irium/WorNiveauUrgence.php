<?php

namespace App\Dit\Entity\Irium;

use Doctrine\ORM\Mapping as ORM;

/**
 * Lookup Informix (irium) existant — niveaux d'urgence DIT (P0..P3 en base
 * de test au moment de l'écriture ; ne pas coder les valeurs en dur ailleurs).
 */
#[ORM\Entity]
#[ORM\Table(name: 'wor_niveau_urgence')]
class WorNiveauUrgence
{
    #[ORM\Id]
    #[ORM\Column(name: 'id', type: 'integer')]
    private int $id;

    #[ORM\Column(name: 'description', type: 'string', length: 50, nullable: true)]
    private ?string $description;

    public function getId(): int { return $this->id; }
    public function getDescription(): ?string { return $this->description; }
}
