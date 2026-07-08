<?php

namespace App\Tik\Entity;

use App\Security\Entity\User;
use App\Tik\Repository\TikHistoriqueRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Historique des changements de statut d'un ticket — une ligne par transition,
 * avec un commentaire optionnel (obligatoire pour certaines actions, imposé
 * côté contrôleur).
 */
#[ORM\Entity(repositoryClass: TikHistoriqueRepository::class)]
#[ORM\Table(name: 'tik_historique')]
#[ORM\Index(columns: ['tik_id'], name: 'idx_tik_historique_tik')]
class TikHistorique
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Tik::class)]
    #[ORM\JoinColumn(name: 'tik_id', referencedColumnName: 'id', nullable: false)]
    private ?Tik $tik = null;

    #[ORM\Column(name: 'statut', type: 'string', length: 20)]
    private string $statut;

    #[ORM\Column(name: 'commentaire', type: 'text', nullable: true)]
    private ?string $commentaire = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true)]
    private ?User $user = null;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }

    public function getTik(): ?Tik { return $this->tik; }
    public function setTik(?Tik $tik): static { $this->tik = $tik; return $this; }

    public function getStatut(): string { return $this->statut; }
    public function setStatut(string $statut): static { $this->statut = $statut; return $this; }

    public function getCommentaire(): ?string { return $this->commentaire; }
    public function setCommentaire(?string $commentaire): static { $this->commentaire = $commentaire; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
}
