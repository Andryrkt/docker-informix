<?php

namespace App\Security\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: \App\Security\Repository\AppMenuRepository::class)]
#[ORM\Table(name: 'app_menu')]
class AppMenu
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $label = null;

    #[ORM\Column(length: 50)]
    private ?string $slug = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $route = null;

    #[ORM\ManyToOne(targetEntity: AppModule::class, inversedBy: 'menus')]
    #[ORM\JoinColumn(nullable: false, name: 'moduleId')]
    private ?AppModule $module = null;

    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'subMenus')]
    #[ORM\JoinColumn(name: 'parentId')]
    private ?self $parent = null;

    #[ORM\OneToMany(mappedBy: 'parent', targetEntity: self::class)]
    private Collection $subMenus;

    public function __construct()
    {
        $this->subMenus = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;
        return $this;
    }

    public function getSlug(): ?string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;
        return $this;
    }

    public function getRoute(): ?string
    {
        return $this->route;
    }

    public function setRoute(?string $route): static
    {
        $this->route = $route;
        return $this;
    }

    public function getModule(): ?AppModule
    {
        return $this->module;
    }

    public function setModule(?AppModule $module): static
    {
        $this->module = $module;
        return $this;
    }

    public function getParent(): ?self
    {
        return $this->parent;
    }

    public function setParent(?self $parent): static
    {
        $this->parent = $parent;
        return $this;
    }

    /**
     * @return Collection<int, self>
     */
    public function getSubMenus(): Collection
    {
        return $this->subMenus;
    }

    public function addSubMenu(self $subMenu): static
    {
        if (!$this->subMenus->contains($subMenu)) {
            $this->subMenus->add($subMenu);
            $subMenu->setParent($this);
        }

        return $this;
    }

    public function removeSubMenu(self $subMenu): static
    {
        if ($this->subMenus->removeElement($subMenu)) {
            // set the owning side to null (unless already changed)
            if ($subMenu->getParent() === $this) {
                $subMenu->setParent(null);
            }
        }

        return $this;
    }
}
