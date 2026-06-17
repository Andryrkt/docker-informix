<?php

namespace App\Security\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity(repositoryClass: \App\Security\Repository\UserScopeRepository::class)]
#[ORM\Table(name: 'app_user_scope')]
class UserScope
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\OneToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, name: 'userId')]
    private ?User $user = null;

    #[ORM\ManyToMany(targetEntity: Agency::class)]
    #[ORM\JoinTable(name: 'app_user_scope_agencies')]
    private Collection $agencies;

    #[ORM\ManyToMany(targetEntity: Service::class)]
    #[ORM\JoinTable(name: 'app_user_scope_services')]
    private Collection $services;

    public function __construct()
    {
        $this->agencies = new ArrayCollection();
        $this->services = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    /**
     * @return Collection<int, Agency>
     */
    public function getAgencies(): Collection
    {
        return $this->agencies;
    }

    public function addAgency(Agency $agency): static
    {
        if (!$this->agencies->contains($agency)) {
            $this->agencies->add($agency);
        }

        return $this;
    }

    public function removeAgency(Agency $agency): static
    {
        $this->agencies->removeElement($agency);
        return $this;
    }

    /**
     * @return Collection<int, Service>
     */
    public function getServices(): Collection
    {
        return $this->services;
    }

    public function addService(Service $service): static
    {
        if (!$this->services->contains($service)) {
            $this->services->add($service);
        }

        return $this;
    }

    public function removeService(Service $service): static
    {
        $this->services->removeElement($service);
        return $this;
    }
}
