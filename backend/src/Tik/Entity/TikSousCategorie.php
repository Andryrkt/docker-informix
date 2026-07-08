<?php

namespace App\Tik\Entity;

use App\Tik\Repository\TikSousCategorieRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TikSousCategorieRepository::class)]
#[ORM\Table(name: 'tik_sous_categorie')]
#[ORM\Index(columns: ['categorie_id'], name: 'idx_tik_souscat_categorie')]
class TikSousCategorie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'description', type: 'string', length: 100)]
    private string $description;

    #[ORM\ManyToOne(targetEntity: TikCategorie::class)]
    #[ORM\JoinColumn(name: 'categorie_id', referencedColumnName: 'id', nullable: false)]
    private ?TikCategorie $categorie = null;

    public function getId(): ?int { return $this->id; }

    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }

    public function getCategorie(): ?TikCategorie { return $this->categorie; }
    public function setCategorie(?TikCategorie $categorie): static { $this->categorie = $categorie; return $this; }
}
