<?php

namespace App\Security\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: \App\Security\Repository\UserPermissionRepository::class)]
#[ORM\Table(name: 'app_user_permission')]
class UserPermission
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, name: 'userId')]
    private ?User $user = null;

    #[ORM\Column(length: 20)]
    private ?string $resourceType = null; // 'module' or 'menu'

    #[ORM\Column]
    private ?int $resourceId = null;

    #[ORM\ManyToOne(targetEntity: Company::class)]
    #[ORM\JoinColumn(nullable: false, name: 'companyId')]
    private ?Company $company = null;

    /**
     * Liste des actions autorisées (ex: ['view', 'edit', 'validate'])
     * @var array<string>
     */
    #[ORM\Column(type: 'json')]
    private array $actions = [];

    #[ORM\Column(type: 'boolean')]
    private bool $allAgences = false;

    #[ORM\Column(type: 'boolean')]
    private bool $allServices = false;

    /**
     * IDs des agences autorisées pour cette ressource.
     * @var array<int>
     */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $agenceIds = [];

    /**
     * IDs des services autorisés pour cette ressource.
     * @var array<int>
     */
    #[ORM\Column(type: 'json', nullable: true)]
    private ?array $serviceIds = [];

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

    public function getResourceType(): ?string
    {
        return $this->resourceType;
    }

    public function setResourceType(string $resourceType): static
    {
        $this->resourceType = $resourceType;
        return $this;
    }

    public function getResourceId(): ?int
    {
        return $this->resourceId;
    }

    public function setResourceId(int $resourceId): static
    {
        $this->resourceId = $resourceId;
        return $this;
    }

    public function getCompany(): ?Company
    {
        return $this->company;
    }

    public function setCompany(?Company $company): static
    {
        $this->company = $company;
        return $this;
    }

    /**
     * @return array<string>
     */
    public function getActions(): array
    {
        return $this->actions;
    }

    /**
     * @param array<string> $actions
     */
    public function setActions(array $actions): static
    {
        $this->actions = array_unique($actions);
        return $this;
    }

    public function hasAction(string $action): bool
    {
        return in_array($action, $this->actions, true);
    }

    public function isAllAgences(): bool
    {
        return $this->allAgences;
    }

    public function setAllAgences(bool $allAgences): static
    {
        $this->allAgences = $allAgences;
        return $this;
    }

    public function isAllServices(): bool
    {
        return $this->allServices;
    }

    public function setAllServices(bool $allServices): static
    {
        $this->allServices = $allServices;
        return $this;
    }

    /**
     * @return array<int>|null
     */
    public function getAgenceIds(): ?array
    {
        return $this->agenceIds;
    }

    /**
     * @param array<int>|null $agenceIds
     */
    public function setAgenceIds(?array $agenceIds): static
    {
        $this->agenceIds = $agenceIds;
        return $this;
    }

    /**
     * @return array<int>|null
     */
    public function getServiceIds(): ?array
    {
        return $this->serviceIds;
    }

    /**
     * @param array<int>|null $serviceIds
     */
    public function setServiceIds(?array $serviceIds): static
    {
        $this->serviceIds = $serviceIds;
        return $this;
    }
}
