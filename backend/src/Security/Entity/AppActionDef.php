<?php

namespace App\Security\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: \App\Security\Repository\AppActionDefRepository::class)]
#[ORM\Table(name: 'app_action_def')]
class AppActionDef
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    private string $actionKey;

    #[ORM\Column(length: 100)]
    private string $label;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $category = null;

    #[ORM\Column]
    private int $sortOrder = 0;

    public function getId(): ?int { return $this->id; }

    public function getActionKey(): string { return $this->actionKey; }
    public function setActionKey(string $actionKey): static { $this->actionKey = $actionKey; return $this; }

    public function getLabel(): string { return $this->label; }
    public function setLabel(string $label): static { $this->label = $label; return $this; }

    public function getCategory(): ?string { return $this->category; }
    public function setCategory(?string $category): static { $this->category = $category; return $this; }

    public function getSortOrder(): int { return $this->sortOrder; }
    public function setSortOrder(int $sortOrder): static { $this->sortOrder = $sortOrder; return $this; }
}
