<?php

namespace App\Tik\Entity;

use App\Tik\Repository\TikCategorieRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TikCategorieRepository::class)]
#[ORM\Table(name: 'tik_categorie')]
class TikCategorie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'description', type: 'string', length: 100)]
    private string $description;

    public function getId(): ?int { return $this->id; }

    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }
}
