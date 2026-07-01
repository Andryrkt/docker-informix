<?php

namespace App\Security\Entity;

use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity]
#[ORM\Table(name: 'app_permission_template_item')]
class PermissionTemplateItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: PermissionTemplate::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false, name: 'templateId')]
    private PermissionTemplate $template;

    #[ORM\ManyToOne(targetEntity: Company::class)]
    #[ORM\JoinColumn(nullable: false, name: 'companyId')]
    private Company $company;

    #[ORM\Column(length: 20)]
    private string $resourceType;

    #[ORM\Column]
    private int $resourceId;

    /** @var array<string> */
    #[ORM\Column(type: 'json')]
    private array $actions = [];

    #[ORM\Column(type: 'boolean')]
    private bool $scopeAll = true;

    /** @var array<array{agencyId: int, allServices: bool, serviceIds: int[]}> */
    #[ORM\Column(type: 'json', nullable: true)]
    private array $agencyScopes = [];

    public function getId(): ?int { return $this->id; }

    public function getTemplate(): PermissionTemplate { return $this->template; }
    public function setTemplate(PermissionTemplate $template): static { $this->template = $template; return $this; }

    public function getCompany(): Company { return $this->company; }
    public function setCompany(Company $company): static { $this->company = $company; return $this; }

    public function getResourceType(): string { return $this->resourceType; }
    public function setResourceType(string $resourceType): static { $this->resourceType = $resourceType; return $this; }

    public function getResourceId(): int { return $this->resourceId; }
    public function setResourceId(int $resourceId): static { $this->resourceId = $resourceId; return $this; }

    public function getActions(): array { return $this->actions; }
    public function setActions(array $actions): static { $this->actions = array_unique($actions); return $this; }

    public function isScopeAll(): bool { return $this->scopeAll; }
    public function setScopeAll(bool $scopeAll): static { $this->scopeAll = $scopeAll; return $this; }

    public function getAgencyScopes(): array { return $this->agencyScopes ?? []; }
    public function setAgencyScopes(array $agencyScopes): static { $this->agencyScopes = $agencyScopes; return $this; }
}
