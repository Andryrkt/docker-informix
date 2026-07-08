<?php

namespace App\Dit\Entity\Irium;

use Doctrine\ORM\Mapping as ORM;

/**
 * Lookup Informix (irium) existant — statuts partagés entre plusieurs
 * applications legacy, filtrés ici par code_application = 'DIT'.
 */
#[ORM\Entity]
#[ORM\Table(name: 'statut_demande')]
class StatutDemande
{
    #[ORM\Id]
    #[ORM\Column(name: 'id_statut_demande', type: 'integer')]
    private int $id;

    #[ORM\Column(name: 'code_application', type: 'string', length: 3, nullable: true)]
    private ?string $codeApplication;

    #[ORM\Column(name: 'code_statut', type: 'string', length: 5, nullable: true)]
    private ?string $codeStatut;

    #[ORM\Column(name: 'description', type: 'string', length: 50, nullable: true)]
    private ?string $description;

    public function getId(): int { return $this->id; }
    public function getCodeApplication(): ?string { return $this->codeApplication; }
    public function getCodeStatut(): ?string { return $this->codeStatut; }
    public function getDescription(): ?string { return $this->description; }
}
