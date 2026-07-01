<?php

namespace App\Security\Entity;

use App\Security\Repository\PermissionTemplateRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PermissionTemplateRepository::class)]
#[ORM\Table(name: 'app_permission_template')]
class PermissionTemplate
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100, unique: true)]
    private string $name;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $description = null;

    #[ORM\OneToMany(
        targetEntity: PermissionTemplateItem::class,
        mappedBy: 'template',
        cascade: ['persist', 'remove'],
        orphanRemoval: true,
    )]
    private Collection $items;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): static { $this->description = $description; return $this; }

    /** @return Collection<int, PermissionTemplateItem> */
    public function getItems(): Collection { return $this->items; }

    public function addItem(PermissionTemplateItem $item): static
    {
        if (!$this->items->contains($item)) {
            $this->items->add($item);
            $item->setTemplate($this);
        }
        return $this;
    }

    public function removeItem(PermissionTemplateItem $item): static
    {
        $this->items->removeElement($item);
        return $this;
    }

    public function clearItems(): static
    {
        foreach ($this->items as $item) {
            $this->items->removeElement($item);
        }
        return $this;
    }
}
