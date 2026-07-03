<?php

namespace App\It\Entity;

use App\It\Repository\TacheRepository;
use App\Security\Entity\Personnel;
use Doctrine\ORM\Mapping as ORM;

/**
 * Tâche à faire dans le cadre du support IT — assignée à un intervenant
 * (Personnel), avec une date et un ticket de référence optionnel.
 */
#[ORM\Entity(repositoryClass: TacheRepository::class)]
#[ORM\Table(name: 'it_tache')]
#[ORM\Index(columns: ['date_tache'], name: 'idx_tache_date')]
#[ORM\Index(columns: ['intervenant_id'], name: 'idx_tache_intervenant')]
class Tache
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'titre', type: 'string', length: 255)]
    private string $titre;

    #[ORM\Column(name: 'date_tache', type: 'datetime')]
    private \DateTimeInterface $dateTache;

    #[ORM\ManyToOne(targetEntity: Personnel::class)]
    #[ORM\JoinColumn(name: 'intervenant_id', referencedColumnName: 'id', nullable: false)]
    private ?Personnel $intervenant = null;

    /** Référence de ticket externe — facultative. */
    #[ORM\Column(name: 'ticket_ref', type: 'string', length: 100, nullable: true)]
    private ?string $ticketRef = null;

    #[ORM\Column(name: 'termine', type: 'boolean')]
    private bool $termine = false;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }

    public function getTitre(): string { return $this->titre; }
    public function setTitre(string $titre): static { $this->titre = $titre; return $this; }

    public function getDateTache(): \DateTimeInterface { return $this->dateTache; }
    public function setDateTache(\DateTimeInterface $dateTache): static { $this->dateTache = $dateTache; return $this; }

    public function getIntervenant(): ?Personnel { return $this->intervenant; }
    public function setIntervenant(?Personnel $intervenant): static { $this->intervenant = $intervenant; return $this; }

    public function getTicketRef(): ?string { return $this->ticketRef; }
    public function setTicketRef(?string $ticketRef): static { $this->ticketRef = $ticketRef; return $this; }

    public function isTermine(): bool { return $this->termine; }
    public function setTermine(bool $termine): static { $this->termine = $termine; return $this; }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
}
