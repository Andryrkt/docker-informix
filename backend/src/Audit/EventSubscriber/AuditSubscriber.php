<?php

namespace App\Audit\EventSubscriber;

use App\Audit\Entity\AuditNavigation;
use App\Audit\Service\AuditService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Capture côté serveur les réponses HTTP d'erreur (4xx/5xx) sur les routes API.
 * La navigation SPA (changements de route React) est tracée par le frontend.
 */
class AuditSubscriber implements EventSubscriberInterface
{
    // Ne pas logger les routes de health-check, assets, ou login
    private const SKIP_PREFIXES = [
        '/api/login',
        '/api/me',
        '/api/navigation',
        '/api/audit',   // évite la récursion
        '/_profiler',
        '/_wdt',
    ];

    // Codes HTTP qui déclenchent l'enregistrement d'une erreur de navigation
    private const ERROR_CODES = [400, 401, 403, 404, 405, 422, 429, 500, 502, 503];

    public function __construct(
        private readonly AuditService $auditService,
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE  => [['onKernelResponse',  -10]],
            KernelEvents::EXCEPTION => [['onKernelException',  -10]],
        ];
    }

    /**
     * Logue les réponses avec un code d'erreur HTTP.
     */
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request  = $event->getRequest();
        $response = $event->getResponse();
        $status   = $response->getStatusCode();

        if (!in_array($status, self::ERROR_CODES, true)) {
            return;
        }

        if ($this->shouldSkip($request)) {
            return;
        }

        $this->auditService->logNavigation([
            'pageUrl'         => $request->getPathInfo(),
            'actionAttempted' => $request->getMethod(),
            'actionResult'    => AuditNavigation::RESULT_ERROR_REDIRECT,
            'errorCode'       => $status,
            'errorMessage'    => $this->extractErrorMessage($response->getContent()),
            'refererUrl'      => $request->headers->get('Referer'),
            'sessionId'       => null,
        ]);
    }

    /**
     * Logue les exceptions non gérées (500).
     */
    public function onKernelException(ExceptionEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request   = $event->getRequest();
        $exception = $event->getThrowable();

        if ($this->shouldSkip($request)) {
            return;
        }

        $status = $exception instanceof HttpExceptionInterface
            ? $exception->getStatusCode()
            : 500;

        // Les 404/403 déjà gérées par onKernelResponse — on ne double-log que les 500
        if ($status < 500) {
            return;
        }

        $this->auditService->logNavigation([
            'pageUrl'         => $request->getPathInfo(),
            'actionAttempted' => $request->getMethod(),
            'actionResult'    => AuditNavigation::RESULT_ERROR_REDIRECT,
            'errorCode'       => $status,
            'errorMessage'    => $exception->getMessage(),
            'refererUrl'      => $request->headers->get('Referer'),
            'sessionId'       => null,
        ]);
    }

    private function shouldSkip(Request $request): bool
    {
        $path = $request->getPathInfo();
        foreach (self::SKIP_PREFIXES as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return true;
            }
        }
        return false;
    }

    private function extractErrorMessage(string $content): ?string
    {
        if (!$content) {
            return null;
        }
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            return $decoded['message'] ?? $decoded['error'] ?? $decoded['detail'] ?? null;
        }
        // Tronque les réponses HTML (pages d'erreur Symfony en dev)
        return substr(strip_tags($content), 0, 500) ?: null;
    }
}
