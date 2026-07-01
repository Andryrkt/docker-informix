<?php

namespace App\Audit\Controller;

use App\Audit\Entity\AuditNavigation;
use App\Audit\Entity\AuditOperation;
use App\Audit\Repository\AuditNavigationRepository;
use App\Audit\Repository\AuditOperationRepository;
use App\Audit\Service\AuditService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/audit')]
class AuditController extends AbstractController
{
    public function __construct(
        private readonly AuditService                $auditService,
        private readonly AuditNavigationRepository   $navRepo,
        private readonly AuditOperationRepository    $opRepo,
    ) {}

    // ── Navigation ────────────────────────────────────────────────────────────

    /**
     * Reçoit un événement de navigation depuis le frontend.
     * Fire-and-forget côté client : on répond 204 sans corps.
     */
    #[Route('/navigation', methods: ['POST'])]
    public function logNavigation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['pageUrl'])) {
            return $this->json(['error' => 'pageUrl is required'], Response::HTTP_BAD_REQUEST);
        }

        // On complète les infos qui ne sont disponibles que côté serveur
        $data['ipAddress']  = $request->getClientIp();
        $data['userAgent']  = substr($request->headers->get('User-Agent', ''), 0, 500);
        $data['refererUrl'] = $request->headers->get('Referer');

        $this->auditService->logNavigation($data);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Liste les logs de navigation (accès admin).
     */
    #[Route('/navigation', methods: ['GET'])]
    public function listNavigation(Request $request): JsonResponse
    {
        $limit     = min((int) ($request->query->get('limit', 100)), 500);
        $companyId = $request->query->get('companyId') ? (int) $request->query->get('companyId') : null;
        $userId    = $request->query->get('userId')    ? (int) $request->query->get('userId')    : null;
        $errorsOnly = filter_var($request->query->get('errorsOnly', false), FILTER_VALIDATE_BOOLEAN);

        if ($errorsOnly) {
            $logs = $this->navRepo->findErrors($limit);
        } elseif ($userId !== null) {
            $logs = $this->navRepo->findByUser($userId, $limit);
        } else {
            $logs = $this->navRepo->findRecent($limit, $companyId);
        }

        return $this->json(array_map([$this, 'serializeNavigation'], $logs));
    }

    // ── Opérations ────────────────────────────────────────────────────────────

    /**
     * Reçoit un événement d'opération métier depuis le frontend.
     */
    #[Route('/operation', methods: ['POST'])]
    public function logOperation(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['operationType'])) {
            return $this->json(['error' => 'operationType is required'], Response::HTTP_BAD_REQUEST);
        }

        $validOperationTypes = [
            AuditOperation::OP_SOUMISSION, AuditOperation::OP_VALIDATION,
            AuditOperation::OP_MODIFICATION, AuditOperation::OP_SUPPRESSION,
            AuditOperation::OP_CREATION, AuditOperation::OP_CLOTUR,
            AuditOperation::OP_FILE_MERGE, AuditOperation::OP_DB_SAV,
            AuditOperation::OP_DW_COP, AuditOperation::OP_FILE_UPLOAD,
            AuditOperation::OP_ANNULATION,
        ];

        if (!in_array($data['operationType'], $validOperationTypes, true)) {
            return $this->json(['error' => 'Invalid operationType'], Response::HTTP_BAD_REQUEST);
        }

        $this->auditService->logOperation($data);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Liste les logs d'opérations (accès admin).
     */
    #[Route('/operation', methods: ['GET'])]
    public function listOperations(Request $request): JsonResponse
    {
        $limit         = min((int) ($request->query->get('limit', 100)), 500);
        $companyId     = $request->query->get('companyId')     ? (int) $request->query->get('companyId')    : null;
        $operationType = $request->query->get('operationType') ?: null;
        $documentType  = $request->query->get('documentType')  ?: null;
        $failuresOnly  = filter_var($request->query->get('failuresOnly', false), FILTER_VALIDATE_BOOLEAN);

        if ($failuresOnly) {
            $logs = $this->opRepo->findFailures($limit, $companyId);
        } else {
            $logs = $this->opRepo->findRecent($limit, $companyId, $operationType, $documentType);
        }

        return $this->json(array_map([$this, 'serializeOperation'], $logs));
    }

    /**
     * Historique complet pour un document donné.
     */
    #[Route('/operation/document/{documentType}/{documentId}', methods: ['GET'])]
    public function documentHistory(string $documentType, string $documentId): JsonResponse
    {
        $logs = $this->opRepo->findByDocument($documentType, $documentId);

        return $this->json(array_map([$this, 'serializeOperation'], $logs));
    }

    // ── Sérialiseurs ─────────────────────────────────────────────────────────

    private function serializeNavigation(AuditNavigation $n): array
    {
        return [
            'id'              => $n->getId(),
            'userId'          => $n->getUserId(),
            'username'        => $n->getUsername(),
            'companyId'       => $n->getCompanyId(),
            'companyCode'     => $n->getCompanyCode(),
            'sessionId'       => $n->getSessionId(),
            'pageUrl'         => $n->getPageUrl(),
            'pageTitle'       => $n->getPageTitle(),
            'actionAttempted' => $n->getActionAttempted(),
            'actionResult'    => $n->getActionResult(),
            'searchData'      => $n->getSearchDataAsArray(),
            'errorCode'       => $n->getErrorCode(),
            'errorMessage'    => $n->getErrorMessage(),
            'ipAddress'       => $n->getIpAddress(),
            'userAgent'       => $n->getUserAgent(),
            'refererUrl'      => $n->getRefererUrl(),
            'createdAt'       => $n->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    private function serializeOperation(AuditOperation $o): array
    {
        return [
            'id'                  => $o->getId(),
            'userId'              => $o->getUserId(),
            'username'            => $o->getUsername(),
            'companyId'           => $o->getCompanyId(),
            'companyCode'         => $o->getCompanyCode(),
            'operationType'       => $o->getOperationType(),
            'documentType'        => $o->getDocumentType(),
            'documentId'          => $o->getDocumentId(),
            'documentNumber'      => $o->getDocumentNumber(),
            'isSuccess'           => $o->isSuccess(),
            'successMessage'      => $o->getSuccessMessage(),
            'errorMessage'        => $o->getErrorMessage(),
            'errorCode'           => $o->getErrorCode(),
            'submittedData'       => $o->getSubmittedData() ? json_decode($o->getSubmittedData(), true) : null,
            'constraintsViolated' => $o->getConstraintsViolated() ? json_decode($o->getConstraintsViolated(), true) : null,
            'fileOperations'      => $o->getFileOperations() ? json_decode($o->getFileOperations(), true) : null,
            'pageUrl'             => $o->getPageUrl(),
            'durationMs'          => $o->getDurationMs(),
            'ipAddress'           => $o->getIpAddress(),
            'createdAt'           => $o->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
