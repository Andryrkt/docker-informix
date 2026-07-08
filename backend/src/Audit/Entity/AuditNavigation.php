<?php

namespace App\Audit\Entity;

use App\Audit\Repository\AuditNavigationRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Enregistre chaque passage d'un utilisateur : visite de page, recherche,
 * action tentée/annulée, redirection vers une page d'erreur.
 */
#[ORM\Entity(repositoryClass: AuditNavigationRepository::class)]
#[ORM\Table(name: 'audit_navigation')]
#[ORM\Index(columns: ['user_id'], name: 'idx_audit_nav_user')]
#[ORM\Index(columns: ['created_at'], name: 'idx_audit_nav_date')]
#[ORM\Index(columns: ['action_result'], name: 'idx_audit_nav_result')]
class AuditNavigation
{
    // Résultats possibles d'une action
    public const RESULT_VISITED        = 'VISITED';
    public const RESULT_SEARCHED       = 'SEARCHED';
    public const RESULT_ATTEMPTED      = 'ATTEMPTED';
    public const RESULT_CANCELLED      = 'CANCELLED';
    public const RESULT_ERROR_REDIRECT = 'ERROR_REDIRECT';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(name: 'user_id', type: 'integer', nullable: true)]
    private ?int $userId = null;

    #[ORM\Column(type: 'string', length: 100, nullable: true)]
    private ?string $username = null;

    #[ORM\Column(name: 'company_id', type: 'integer', nullable: true)]
    private ?int $companyId = null;

    #[ORM\Column(name: 'company_code', type: 'string', length: 50, nullable: true)]
    private ?string $companyCode = null;

    #[ORM\Column(name: 'session_id', type: 'string', length: 255, nullable: true)]
    private ?string $sessionId = null;

    #[ORM\Column(name: 'page_url', type: 'string', length: 500)]
    private string $pageUrl;

    #[ORM\Column(name: 'page_title', type: 'string', length: 255, nullable: true)]
    private ?string $pageTitle = null;

    /** Action tentée : DELETE, SEARCH, VIEW, SUBMIT, VALIDATE, etc. */
    #[ORM\Column(name: 'action_attempted', type: 'string', length: 100, nullable: true)]
    private ?string $actionAttempted = null;

    /** Résultat : VISITED, SEARCHED, ATTEMPTED, CANCELLED, ERROR_REDIRECT */
    #[ORM\Column(name: 'action_result', type: 'string', length: 50, nullable: true)]
    private ?string $actionResult = null;

    /** Paramètres de recherche en JSON */
    #[ORM\Column(name: 'search_data', type: 'text', nullable: true)]
    private ?string $searchData = null;

    #[ORM\Column(name: 'error_code', type: 'integer', nullable: true)]
    private ?int $errorCode = null;

    #[ORM\Column(name: 'error_message', type: 'text', nullable: true)]
    private ?string $errorMessage = null;

    #[ORM\Column(name: 'ip_address', type: 'string', length: 45, nullable: true)]
    private ?string $ipAddress = null;

    #[ORM\Column(name: 'user_agent', type: 'string', length: 500, nullable: true)]
    private ?string $userAgent = null;

    #[ORM\Column(name: 'referer_url', type: 'string', length: 500, nullable: true)]
    private ?string $refererUrl = null;

    #[ORM\Column(name: 'created_at', type: 'datetime')]
    private \DateTimeInterface $createdAt;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }

    public function getUserId(): ?int { return $this->userId; }
    public function setUserId(?int $userId): static { $this->userId = $userId; return $this; }

    public function getUsername(): ?string { return $this->username; }
    public function setUsername(?string $username): static { $this->username = $username; return $this; }

    public function getCompanyId(): ?int { return $this->companyId; }
    public function setCompanyId(?int $companyId): static { $this->companyId = $companyId; return $this; }

    public function getCompanyCode(): ?string { return $this->companyCode; }
    public function setCompanyCode(?string $companyCode): static { $this->companyCode = $companyCode; return $this; }

    public function getSessionId(): ?string { return $this->sessionId; }
    public function setSessionId(?string $sessionId): static { $this->sessionId = $sessionId; return $this; }

    public function getPageUrl(): string { return $this->pageUrl; }
    public function setPageUrl(string $pageUrl): static { $this->pageUrl = $pageUrl; return $this; }

    public function getPageTitle(): ?string { return $this->pageTitle; }
    public function setPageTitle(?string $pageTitle): static { $this->pageTitle = $pageTitle; return $this; }

    public function getActionAttempted(): ?string { return $this->actionAttempted; }
    public function setActionAttempted(?string $actionAttempted): static { $this->actionAttempted = $actionAttempted; return $this; }

    public function getActionResult(): ?string { return $this->actionResult; }
    public function setActionResult(?string $actionResult): static { $this->actionResult = $actionResult; return $this; }

    public function getSearchData(): ?string { return $this->searchData; }
    public function setSearchData(mixed $searchData): static
    {
        $this->searchData = is_array($searchData) ? json_encode($searchData, JSON_UNESCAPED_UNICODE) : $searchData;
        return $this;
    }

    public function getSearchDataAsArray(): array
    {
        return $this->searchData ? (json_decode($this->searchData, true) ?? []) : [];
    }

    public function getErrorCode(): ?int { return $this->errorCode; }
    public function setErrorCode(?int $errorCode): static { $this->errorCode = $errorCode; return $this; }

    public function getErrorMessage(): ?string { return $this->errorMessage; }
    public function setErrorMessage(?string $errorMessage): static { $this->errorMessage = $errorMessage; return $this; }

    public function getIpAddress(): ?string { return $this->ipAddress; }
    public function setIpAddress(?string $ipAddress): static { $this->ipAddress = $ipAddress; return $this; }

    public function getUserAgent(): ?string { return $this->userAgent; }
    public function setUserAgent(?string $userAgent): static { $this->userAgent = $userAgent; return $this; }

    public function getRefererUrl(): ?string { return $this->refererUrl; }
    public function setRefererUrl(?string $refererUrl): static { $this->refererUrl = $refererUrl; return $this; }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }
}
