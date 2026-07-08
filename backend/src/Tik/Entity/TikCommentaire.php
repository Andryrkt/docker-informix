<?php

namespace App\Tik\Entity;

use App\Security\Entity\User;
use Doctrine\ORM\Mapping as ORM;

/**
 * Message dans le fil de discussion d'un ticket — échange libre entre le
 * demandeur, le validateur et l'intervenant assigné, indépendant des
 * changements de statut (portage du legacy TkiCommentaires).
 */
#[ORM\Entity(repositoryClass: \App\Tik\Repository\TikCommentaireRepository::class)]
#[ORM\Table(name: 'tik_commentaire')]
#[ORM\Index(columns: ['tik_id'], name: 'idx_tik_commentaire_tik')]
class TikCommentaire
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Tik::class)]
    #[ORM\JoinColumn(name: 'tik_id', referencedColumnName: 'id', nullable: false)]
    private ?Tik $tik = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column(name: 'commentaire', type: 'text')]
    private string $commentaire;

    /** JSON encodé : [{"name":"...","storedName":"...","sizeKb":n}] — même format que Tik::fileNames. */
    #[ORM\Column(name: 'file_names', type: 'text', nullable: true)]
    private ?string $fileNames = null;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }

    public function getTik(): ?Tik { return $this->tik; }
    public function setTik(?Tik $tik): static { $this->tik = $tik; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getCommentaire(): string { return $this->commentaire; }
    public function setCommentaire(string $commentaire): static { $this->commentaire = $commentaire; return $this; }

    public function getFileNames(): ?string { return $this->fileNames; }
    public function setFileNames(?string $fileNames): static { $this->fileNames = $fileNames; return $this; }

    /** @return array<array{name:string,storedName:string,sizeKb:int}> */
    public function getFileNamesAsArray(): array
    {
        return $this->fileNames ? (json_decode($this->fileNames, true) ?? []) : [];
    }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
}
