<?php

namespace App\Security\Entity;

use App\Security\Repository\PersonnelRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PersonnelRepository::class)]
#[ORM\Table(name: 'app_personnel')]
#[ORM\Index(columns: ['matricule'], name: 'idx_personnel_matricule')]
#[ORM\Index(columns: ['centre_id'],  name: 'idx_personnel_centre')]
class Personnel
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private string $nom;

    #[ORM\Column(length: 150)]
    private string $prenoms;

    #[ORM\Column(length: 20, unique: true)]
    private string $matricule;

    #[ORM\Column(name: 'code_bancaire', length: 60, nullable: true)]
    private ?string $codeBancaire = null;

    #[ORM\ManyToOne(targetEntity: Centre::class)]
    #[ORM\JoinColumn(name: 'centre_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?Centre $centre = null;

    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public function getId(): ?int { return $this->id; }

    public function getNom(): string { return $this->nom; }
    public function setNom(string $nom): static { $this->nom = $nom; return $this; }

    public function getPrenoms(): string { return $this->prenoms; }
    public function setPrenoms(string $prenoms): static { $this->prenoms = $prenoms; return $this; }

    public function getMatricule(): string { return $this->matricule; }
    public function setMatricule(string $matricule): static { $this->matricule = $matricule; return $this; }

    public function getCodeBancaire(): ?string { return $this->codeBancaire; }
    public function setCodeBancaire(?string $codeBancaire): static { $this->codeBancaire = $codeBancaire; return $this; }

    public function getCentre(): ?Centre { return $this->centre; }
    public function setCentre(?Centre $centre): static { $this->centre = $centre; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }
}
