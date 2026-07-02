<?php

namespace App\Security\Entity;

use App\Security\Repository\CentreRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Centre analytique : combinaison agence + service avec son code Sage.
 * Ex: agence Antananarivo / service Negoce => code 01-NEG, codeSage AB11.
 */
#[ORM\Entity(repositoryClass: CentreRepository::class)]
#[ORM\Table(name: 'app_centre')]
#[ORM\UniqueConstraint(name: 'uq_centre_code_sage', columns: ['code', 'code_sage'])]
#[ORM\Index(columns: ['code'], name: 'idx_centre_code')]
#[ORM\Index(columns: ['company_code'], name: 'idx_centre_company')]
class Centre
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Agency::class)]
    #[ORM\JoinColumn(name: 'agency_id', referencedColumnName: 'id', nullable: false)]
    private ?Agency $agency = null;

    #[ORM\ManyToOne(targetEntity: Service::class)]
    #[ORM\JoinColumn(name: 'service_id', referencedColumnName: 'id', nullable: false)]
    private ?Service $service = null;

    /** Code analytique interne — ex: 01-NEG, 40-ATE, 91-TSI */
    #[ORM\Column(length: 20)]
    private string $code;

    /** Code société Sage — ex: HF (Holding Fraise), TA (Travel Airways) */
    #[ORM\Column(name: 'company_code', length: 10)]
    private string $companyCode;

    /** Code analytique Sage — ex: AB11, AC11 */
    #[ORM\Column(name: 'code_sage', length: 20, nullable: true)]
    private ?string $codeSage = null;

    /** Responsable du centre */
    #[ORM\Column(length: 100, nullable: true)]
    private ?string $responsable = null;

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAgency(): ?Agency
    {
        return $this->agency;
    }

    public function setAgency(Agency $agency): static
    {
        $this->agency = $agency;
        return $this;
    }

    public function getService(): ?Service
    {
        return $this->service;
    }

    public function setService(Service $service): static
    {
        $this->service = $service;
        return $this;
    }

    public function getCode(): string
    {
        return $this->code;
    }

    public function setCode(string $code): static
    {
        $this->code = $code;
        return $this;
    }

    public function getCompanyCode(): string
    {
        return $this->companyCode;
    }

    public function setCompanyCode(string $companyCode): static
    {
        $this->companyCode = $companyCode;
        return $this;
    }

    public function getCodeSage(): ?string
    {
        return $this->codeSage;
    }

    public function setCodeSage(?string $codeSage): static
    {
        $this->codeSage = $codeSage ?: null;
        return $this;
    }

    public function getResponsable(): ?string
    {
        return $this->responsable;
    }

    public function setResponsable(?string $responsable): static
    {
        $this->responsable = $responsable ?: null;
        return $this;
    }
}
