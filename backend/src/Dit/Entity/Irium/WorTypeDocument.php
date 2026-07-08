<?php

namespace App\Dit\Entity\Irium;

use Doctrine\ORM\Mapping as ORM;

/**
 * Lookup Informix (irium) existant — types de document DIT (PAN, MAC, AUT, ...).
 */
#[ORM\Entity]
#[ORM\Table(name: 'wor_type_document')]
class WorTypeDocument
{
    #[ORM\Id]
    #[ORM\Column(name: 'id', type: 'integer')]
    private int $id;

    #[ORM\Column(name: 'code_document', type: 'string', length: 3, nullable: true)]
    private ?string $codeDocument;

    #[ORM\Column(name: 'description', type: 'string', length: 100, nullable: true)]
    private ?string $description;

    public function getId(): int { return $this->id; }
    public function getCodeDocument(): ?string { return $this->codeDocument; }
    public function getDescription(): ?string { return $this->description; }
}
