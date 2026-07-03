<?php

namespace App\Audit\Service;

use App\Notification\Entity\Notification;
use App\Notification\Service\NotificationService;
use App\Security\Entity\User;
use App\Security\Service\SecurityContextService;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Historisation via DBAL direct — jamais via l'ORM.
 * Un INSERT raté ne ferme pas l'EntityManager et ne perturbe aucune action métier.
 */
class AuditService
{
    public function __construct(
        private readonly Connection            $conn,
        private readonly Security              $security,
        private readonly RequestStack          $requestStack,
        private readonly SecurityContextService $securityContext,
        private readonly NotificationService    $notificationService,
    ) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    public function logNavigation(array $data): void
    {
        try {
            $user    = $this->security->getUser();
            $company = $this->securityContext->getActiveCompany();
            $request = $this->requestStack->getCurrentRequest();

            $searchData = $data['searchData'] ?? null;
            if (is_array($searchData)) {
                $searchData = json_encode($searchData, JSON_UNESCAPED_UNICODE);
            }

            $row = [
                'user_id'          => $user instanceof User ? $user->getId()       : null,
                'username'         => $user instanceof User ? $user->getUsername()  : null,
                'company_id'       => $company?->getId(),
                'company_code'     => $company?->getCode(),
                'session_id'       => isset($data['sessionId'])       ? substr((string) $data['sessionId'], 0, 255)       : null,
                'page_url'         => substr((string) ($data['pageUrl'] ?? '/'), 0, 500),
                'page_title'       => isset($data['pageTitle'])       ? substr((string) $data['pageTitle'], 0, 255)       : null,
                'action_attempted' => isset($data['actionAttempted']) ? substr((string) $data['actionAttempted'], 0, 100) : null,
                'action_result'    => substr((string) ($data['actionResult'] ?? 'VISITED'), 0, 50),
                'search_data'      => $searchData,
                'error_code'       => isset($data['errorCode']) ? (int) $data['errorCode'] : null,
                'error_message'    => $data['errorMessage'] ?? null,
                'ip_address'       => $request?->getClientIp(),
                'user_agent'       => $request ? substr($request->headers->get('User-Agent', ''), 0, 500) : null,
                'referer_url'      => isset($data['refererUrl']) ? substr((string) $data['refererUrl'], 0, 500) : null,
                'created_at'       => (new \DateTime())->format('Y-m-d\TH:i:s'), // 'T' obligatoire : sinon ce SQL Server inverse jour/mois
            ];

            $this->conn->insert('audit_navigation', array_filter($row, static fn($v) => $v !== null));

            if (($row['action_result'] ?? null) === 'ERROR_REDIRECT') {
                $this->notificationService->notifyFailure(
                    Notification::SOURCE_NAVIGATION,
                    'Erreur de navigation',
                    sprintf(
                        "Page : %s\nCode : %s\n%s",
                        $row['page_url'] ?? '?',
                        $row['error_code'] ?? '?',
                        $row['error_message'] ?? '',
                    ),
                    $row['page_url'] ?? null,
                );
            }
        } catch (\Throwable $e) {
            error_log('[AuditService] logNavigation failed: ' . $e->getMessage());
        }
    }

    // ── Opérations ────────────────────────────────────────────────────────────

    public function logOperation(array $data): void
    {
        try {
            $user    = $this->security->getUser();
            $company = $this->securityContext->getActiveCompany();
            $request = $this->requestStack->getCurrentRequest();

            $encode = static function (mixed $v): ?string {
                if ($v === null) {
                    return null;
                }
                return is_array($v) ? json_encode($v, JSON_UNESCAPED_UNICODE) : (string) $v;
            };

            $row = [
                'user_id'              => $user instanceof User ? $user->getId()       : null,
                'username'             => $user instanceof User ? $user->getUsername()  : null,
                'company_id'           => $company?->getId(),
                'company_code'         => $company?->getCode(),
                'operation_type'       => substr((string) ($data['operationType'] ?? ''), 0, 50),
                'document_type'        => isset($data['documentType'])   ? substr((string) $data['documentType'], 0, 50)    : null,
                'document_id'          => isset($data['documentId'])     ? substr((string) $data['documentId'], 0, 100)     : null,
                'document_number'      => isset($data['documentNumber']) ? substr((string) $data['documentNumber'], 0, 100) : null,
                'is_success'           => isset($data['isSuccess']) ? ((bool) $data['isSuccess'] ? 1 : 0) : 0,
                'success_message'      => $data['successMessage'] ?? null,
                'error_message'        => $data['errorMessage']   ?? null,
                'error_code'           => isset($data['errorCode']) ? substr((string) $data['errorCode'], 0, 50) : null,
                'submitted_data'       => $encode($data['submittedData'] ?? null),
                'constraints_violated' => $encode($data['constraintsViolated'] ?? null),
                'file_operations'      => $encode($data['fileOperations'] ?? null),
                'page_url'             => isset($data['pageUrl']) ? substr((string) $data['pageUrl'], 0, 500) : null,
                'duration_ms'          => isset($data['durationMs']) ? (int) $data['durationMs'] : null,
                'ip_address'           => $request?->getClientIp(),
                'created_at'           => (new \DateTime())->format('Y-m-d\TH:i:s'), // 'T' obligatoire : sinon ce SQL Server inverse jour/mois
            ];

            $this->conn->insert('audit_operation', array_filter($row, static fn($v) => $v !== null));

            if (($row['is_success'] ?? 1) === 0) {
                $this->notificationService->notifyFailure(
                    Notification::SOURCE_OPERATION,
                    sprintf('Échec opération %s', $row['operation_type'] ?? '?'),
                    sprintf(
                        "Type document : %s\nNuméro : %s\n%s",
                        $row['document_type']   ?? '?',
                        $row['document_number'] ?? '?',
                        $row['error_message']   ?? '',
                    ),
                    $row['page_url'] ?? null,
                );
            }
        } catch (\Throwable $e) {
            error_log('[AuditService] logOperation failed: ' . $e->getMessage());
        }
    }
}
