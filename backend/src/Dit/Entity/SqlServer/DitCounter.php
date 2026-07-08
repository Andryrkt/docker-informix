<?php

namespace App\Dit\Entity\SqlServer;

use App\Dit\Repository\DitCounterRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Compteur de numérotation DIT — équivalent de `Application.derniere_id` du
 * legacy (qui n'a pas d'entité générique "Application" dans ce backend). Une
 * seule ligne en pratique (codeApp = 'DIT').
 */
#[ORM\Entity(repositoryClass: DitCounterRepository::class)]
#[ORM\Table(name: 'app_dit_counter')]
class DitCounter
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 10, unique: true)]
    private string $codeApp;

    #[ORM\Column(name: 'derniere_id', length: 11, nullable: true)]
    private ?string $derniereId = null;

    public function getId(): ?int { return $this->id; }

    public function getCodeApp(): string { return $this->codeApp; }
    public function setCodeApp(string $codeApp): static { $this->codeApp = $codeApp; return $this; }

    public function getDerniereId(): ?string { return $this->derniereId; }
    public function setDerniereId(?string $derniereId): static { $this->derniereId = $derniereId; return $this; }
}
