<?php

namespace App\Shared\Entity\SqlServer;

use App\Shared\Repository\NumeroCounterRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Compteur de numérotation par application (DIT, TIK, ...) — équivalent de
 * `Application.derniere_id` du legacy (qui n'a pas d'entité générique
 * "Application" dans ce backend). Une ligne par codeApp (voir
 * App\Audit\Entity\AuditOperation::DOC_*).
 */
#[ORM\Entity(repositoryClass: NumeroCounterRepository::class)]
#[ORM\Table(name: 'app_dit_counter')] // nom historique (créée pour DIT) — table déjà générique par codeApp, pas de migration à faire pour la partager
class NumeroCounter
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
