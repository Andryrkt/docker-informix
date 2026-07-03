<?php

namespace App\Notification\Service;

use App\Security\Repository\UserRepository;
use Doctrine\DBAL\Connection;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

/**
 * Notifie (in-app + email) les administrateurs d'une agence/service donnés
 * en cas d'erreur/échec applicatif.
 *
 * Écriture via DBAL direct — jamais via l'ORM (voir AuditService) : un
 * échec de notification ne doit jamais perturber le flux appelant.
 */
class NotificationService
{
    // Agence/service devant recevoir les alertes d'erreur (cf. demande métier).
    private const TARGET_AGENCY_CODE  = '80';
    private const TARGET_SERVICE_CODE = 'INF';

    public function __construct(
        private readonly Connection      $conn,
        private readonly UserRepository  $userRepository,
        private readonly MailerInterface $mailer,
        private readonly string          $mailerFrom,
    ) {}

    public function notifyFailure(string $source, string $title, string $message, ?string $pageUrl = null): void
    {
        try {
            $admins = $this->userRepository->findAdminsByAgencyAndService(
                self::TARGET_AGENCY_CODE,
                self::TARGET_SERVICE_CODE,
            );

            foreach ($admins as $admin) {
                $this->insertNotification($admin->getId(), $source, $title, $message, $pageUrl);
                $this->sendEmail($admin->getEmail(), $title, $message, $pageUrl);
            }
        } catch (\Throwable $e) {
            error_log('[NotificationService] notifyFailure failed: ' . $e->getMessage());
        }
    }

    private function insertNotification(int $userId, string $source, string $title, string $message, ?string $pageUrl): void
    {
        try {
            $this->conn->insert('app_notification', array_filter([
                'user_id'    => $userId,
                'source'     => $source,
                'title'      => $title,
                'message'    => $message,
                'page_url'   => $pageUrl,
                'is_read'    => 0,
                'created_at' => (new \DateTime())->format('Y-m-d\TH:i:s'), // 'T' obligatoire : sinon ce SQL Server inverse jour/mois
            ], static fn($v) => $v !== null));
        } catch (\Throwable $e) {
            error_log('[NotificationService] insertNotification failed: ' . $e->getMessage());
        }
    }

    private function sendEmail(?string $to, string $title, string $message, ?string $pageUrl): void
    {
        if (!$to) {
            return;
        }

        try {
            $body = $message . ($pageUrl ? "\n\nPage : {$pageUrl}" : '');

            $email = (new Email())
                ->from($this->mailerFrom)
                ->to($to)
                ->subject("[Intranet HFF] {$title}")
                ->text($body);

            $this->mailer->send($email);
        } catch (\Throwable $e) {
            error_log('[NotificationService] sendEmail failed: ' . $e->getMessage());
        }
    }
}
