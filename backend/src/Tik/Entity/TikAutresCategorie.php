<?php

namespace App\Tik\Entity;

use App\Tik\Repository\TikAutresCategorieRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: TikAutresCategorieRepository::class)]
#[ORM\Table(name: 'tik_autres_categorie')]
#[ORM\Index(columns: ['sous_categorie_id'], name: 'idx_tik_autrescat_souscat')]
class TikAutresCategorie
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'description', type: 'string', length: 100)]
    private string $description;

    #[ORM\ManyToOne(targetEntity: TikSousCategorie::class)]
    #[ORM\JoinColumn(name: 'sous_categorie_id', referencedColumnName: 'id', nullable: false)]
    private ?TikSousCategorie $sousCategorie = null;

    public function getId(): ?int { return $this->id; }

    public function getDescription(): string { return $this->description; }
    public function setDescription(string $description): static { $this->description = $description; return $this; }

    public function getSousCategorie(): ?TikSousCategorie { return $this->sousCategorie; }
    public function setSousCategorie(?TikSousCategorie $sousCategorie): static { $this->sousCategorie = $sousCategorie; return $this; }
}
