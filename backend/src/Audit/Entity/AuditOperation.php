<?php

namespace App\Audit\Entity;

use App\Audit\Repository\AuditOperationRepository;
use Doctrine\ORM\Mapping as ORM;

/**
 * Enregistre le résultat de chaque opération métier : soumission formulaire,
 * validation, suppression, upload, fusion, copie DocuWare, etc.
 */
#[ORM\Entity(repositoryClass: AuditOperationRepository::class)]
#[ORM\Table(name: 'audit_operation')]
#[ORM\Index(columns: ['user_id'], name: 'idx_audit_op_user')]
#[ORM\Index(columns: ['created_at'], name: 'idx_audit_op_date')]
#[ORM\Index(columns: ['operation_type'], name: 'idx_audit_op_type')]
#[ORM\Index(columns: ['document_type'], name: 'idx_audit_op_doctype')]
#[ORM\Index(columns: ['is_success'], name: 'idx_audit_op_success')]
class AuditOperation
{
    // Types d'opérations
    public const OP_SOUMISSION  = 'SOUMISSION';
    public const OP_VALIDATION  = 'VALIDATION';
    public const OP_MODIFICATION = 'MODIFICATION';
    public const OP_SUPPRESSION = 'SUPPRESSION';
    public const OP_CREATION    = 'CREATION';
    public const OP_CLOTUR      = 'CLOTUR';
    public const OP_FILE_MERGE  = 'FILE_MERGE';
    public const OP_DB_SAV      = 'DB_SAV';
    public const OP_DW_COP      = 'DW_COP';
    public const OP_FILE_UPLOAD = 'FILE_UPLOAD';
    public const OP_ANNULATION  = 'ANNULATION';

    // Types de documents
    public const DOC_DIT    = 'DIT';
    public const DOC_OR     = 'OR';
    public const DOC_FAC    = 'FAC';
    public const DOC_RI     = 'RI';
    public const DOC_TIK    = 'TIK';
    public const DOC_DA     = 'DA';
    public const DOC_DOM    = 'DOM';
    public const DOC_BDM    = 'BDM';
    public const DOC_CAS    = 'CAS';
    public const DOC_CDE    = 'CDE';
    public const DOC_DEV    = 'DEV';
    public const DOC_BC     = 'BC';
    public const DOC_AC     = 'AC';
    public const DOC_CDEFRN = 'CDEFRN';
    public const DOC_SW     = 'SW';
    public const DOC_MUT    = 'MUT';

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

    /** SOUMISSION | VALIDATION | MODIFICATION | SUPPRESSION | CREATION | CLOTUR | FILE_MERGE | DB_SAV | DW_COP | FILE_UPLOAD | ANNULATION */
    #[ORM\Column(name: 'operation_type', type: 'string', length: 50)]
    private string $operationType;

    /** DIT | OR | FAC | RI | TIK | DA | DOM | BDM | CAS | CDE | DEV | BC | AC | CDEFRN | SW | MUT */
    #[ORM\Column(name: 'document_type', type: 'string', length: 20, nullable: true)]
    private ?string $documentType = null;

    /** Identifiant technique du document */
    #[ORM\Column(name: 'document_id', type: 'string', length: 100, nullable: true)]
    private ?string $documentId = null;

    /** Numéro lisible du document (ex: DIT-2025-0001) */
    #[ORM\Column(name: 'document_number', type: 'string', length: 100, nullable: true)]
    private ?string $documentNumber = null;

    #[ORM\Column(name: 'is_success', type: 'boolean')]
    private bool $isSuccess = false;

    #[ORM\Column(name: 'success_message', type: 'text', nullable: true)]
    private ?string $successMessage = null;

    #[ORM\Column(name: 'error_message', type: 'text', nullable: true)]
    private ?string $errorMessage = null;

    #[ORM\Column(name: 'error_code', type: 'string', length: 100, nullable: true)]
    private ?string $errorCode = null;

    /** Données du formulaire soumis en JSON (données sensibles expurgées) */
    #[ORM\Column(name: 'submitted_data', type: 'text', nullable: true)]
    private ?string $submittedData = null;

    /** Contraintes métier violées en JSON : [{"field":"numeroOR","message":"..."}] */
    #[ORM\Column(name: 'constraints_violated', type: 'text', nullable: true)]
    private ?string $constraintsViolated = null;

    /** Résultats des opérations fichier en JSON */
    #[ORM\Column(name: 'file_operations', type: 'text', nullable: true)]
    private ?string $fileOperations = null;

    /** URL de la page ayant déclenché l'opération */
    #[ORM\Column(name: 'page_url', type: 'string', length: 500, nullable: true)]
    private ?string $pageUrl = null;

    /** Durée de l'opération en millisecondes */
    #[ORM\Column(name: 'duration_ms', type: 'integer', nullable: true)]
    private ?int $durationMs = null;

    #[ORM\Column(name: 'ip_address', type: 'string', length: 45, nullable: true)]
    private ?string $ipAddress = null;

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

    public function getOperationType(): string { return $this->operationType; }
    public function setOperationType(string $operationType): static { $this->operationType = $operationType; return $this; }

    public function getDocumentType(): ?string { return $this->documentType; }
    public function setDocumentType(?string $documentType): static { $this->documentType = $documentType; return $this; }

    public function getDocumentId(): ?string { return $this->documentId; }
    public function setDocumentId(?string $documentId): static { $this->documentId = $documentId; return $this; }

    public function getDocumentNumber(): ?string { return $this->documentNumber; }
    public function setDocumentNumber(?string $documentNumber): static { $this->documentNumber = $documentNumber; return $this; }

    public function isSuccess(): bool { return $this->isSuccess; }
    public function setIsSuccess(bool $isSuccess): static { $this->isSuccess = $isSuccess; return $this; }

    public function getSuccessMessage(): ?string { return $this->successMessage; }
    public function setSuccessMessage(?string $successMessage): static { $this->successMessage = $successMessage; return $this; }

    public function getErrorMessage(): ?string { return $this->errorMessage; }
    public function setErrorMessage(?string $errorMessage): static { $this->errorMessage = $errorMessage; return $this; }

    public function getErrorCode(): ?string { return $this->errorCode; }
    public function setErrorCode(?string $errorCode): static { $this->errorCode = $errorCode; return $this; }

    public function getSubmittedData(): ?string { return $this->submittedData; }
    public function setSubmittedData(mixed $submittedData): static
    {
        if (is_array($submittedData)) {
            $submittedData = $this->sanitizeData($submittedData);
            $this->submittedData = json_encode($submittedData, JSON_UNESCAPED_UNICODE);
        } else {
            $this->submittedData = $submittedData;
        }
        return $this;
    }

    public function getConstraintsViolated(): ?string { return $this->constraintsViolated; }
    public function setConstraintsViolated(mixed $constraintsViolated): static
    {
        $this->constraintsViolated = is_array($constraintsViolated)
            ? json_encode($constraintsViolated, JSON_UNESCAPED_UNICODE)
            : $constraintsViolated;
        return $this;
    }

    public function getFileOperations(): ?string { return $this->fileOperations; }
    public function setFileOperations(mixed $fileOperations): static
    {
        $this->fileOperations = is_array($fileOperations)
            ? json_encode($fileOperations, JSON_UNESCAPED_UNICODE)
            : $fileOperations;
        return $this;
    }

    public function getPageUrl(): ?string { return $this->pageUrl; }
    public function setPageUrl(?string $pageUrl): static { $this->pageUrl = $pageUrl; return $this; }

    public function getDurationMs(): ?int { return $this->durationMs; }
    public function setDurationMs(?int $durationMs): static { $this->durationMs = $durationMs; return $this; }

    public function getIpAddress(): ?string { return $this->ipAddress; }
    public function setIpAddress(?string $ipAddress): static { $this->ipAddress = $ipAddress; return $this; }

    public function getCreatedAt(): \DateTimeInterface { return $this->createdAt; }

    /** Retire les champs sensibles avant de persister les données de formulaire */
    private function sanitizeData(array $data): array
    {
        $sensitiveKeys = ['password', 'mot_de_passe', 'token', 'secret', 'pin', 'cvv', 'card'];
        foreach ($data as $key => $value) {
            foreach ($sensitiveKeys as $sensitive) {
                if (stripos((string) $key, $sensitive) !== false) {
                    $data[$key] = '***';
                    break;
                }
            }
            if (is_array($value)) {
                $data[$key] = $this->sanitizeData($value);
            }
        }
        return $data;
    }
}
