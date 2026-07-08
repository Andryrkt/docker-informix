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

    /**
     * true = accès complet (toutes agences, tous services).
     * false = accès restreint défini par agencyScopes.
     */
    #[ORM\Column(type: 'boolean')]
    private bool $scopeAll = true;

    /**
     * Portée par agence. Utilisé uniquement quand scopeAll = false.
     * Format : [{agencyId: int, allServices: bool, serviceIds: int[]}]
     *
     * - allServices: true  → tous les services de cette agence
     * - allServices: false → uniquement les services listés dans serviceIds
     *
     * @var array<array{agencyId: int, allServices: bool, serviceIds: int[]}>
     */
    #[ORM\Column(type: 'json', nullable: true)]
    private array $agencyScopes = [];

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getResourceType(): ?string { return $this->resourceType; }
    public function setResourceType(string $resourceType): static { $this->resourceType = $resourceType; return $this; }

    public function getResourceId(): ?int { return $this->resourceId; }
    public function setResourceId(int $resourceId): static { $this->resourceId = $resourceId; return $this; }

    public function getCompany(): ?Company { return $this->company; }
    public function setCompany(?Company $company): static { $this->company = $company; return $this; }

    /** @return array<string> */
    public function getActions(): array { return $this->actions; }

    /** @param array<string> $actions */
    public function setActions(array $actions): static { $this->actions = array_unique($actions); return $this; }

    public function hasAction(string $action): bool { return in_array($action, $this->actions, true); }

    public function isScopeAll(): bool { return $this->scopeAll; }
    public function setScopeAll(bool $scopeAll): static { $this->scopeAll = $scopeAll; return $this; }

    /** @return array<array{agencyId: int, allServices: bool, serviceIds: int[]}> */
    public function getAgencyScopes(): array { return $this->agencyScopes; }

    /** @param array<array{agencyId: int, allServices: bool, serviceIds: int[]}> $agencyScopes */
    public function setAgencyScopes(array $agencyScopes): static { $this->agencyScopes = $agencyScopes; return $this; }
}
