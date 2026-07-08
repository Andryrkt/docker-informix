<?php

namespace App\Notification\Controller;

use App\Notification\Entity\Notification;
use App\Notification\Repository\NotificationRepository;
use App\Security\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/notifications')]
class NotificationController extends AbstractController
{
    public function __construct(
        private readonly NotificationRepository $notificationRepo,
        private readonly EntityManagerInterface  $sqlServerEm,
    ) {}

    /**
     * Liste les notifications de l'utilisateur connecté.
     */
    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $notifications = $this->notificationRepo->findForUser($user->getId());
        $unreadCount   = $this->notificationRepo->countUnreadForUser($user->getId());

        return $this->json([
            'unreadCount'   => $unreadCount,
            'notifications' => array_map([$this, 'serialize'], $notifications),
        ]);
    }

    /**
     * Marque une notification comme lue.
     */
    #[Route('/{id}/read', methods: ['POST'])]
    public function markRead(int $id): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $notification = $this->notificationRepo->find($id);
        if (!$notification || $notification->getUserId() !== $user->getId()) {
            return $this->json(['error' => 'Not found'], Response::HTTP_NOT_FOUND);
        }

        $notification->setIsRead(true);
        $this->sqlServerEm->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Marque toutes les notifications de l'utilisateur connecté comme lues.
     */
    #[Route('/read-all', methods: ['POST'])]
    public function markAllRead(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            return $this->json(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        foreach ($this->notificationRepo->findForUser($user->getId(), 500) as $notification) {
            if (!$notification->isRead()) {
                $notification->setIsRead(true);
            }
        }
        $this->sqlServerEm->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    private function serialize(Notification $n): array
    {
        return [
            'id'        => $n->getId(),
            'source'    => $n->getSource(),
            'title'     => $n->getTitle(),
            'message'   => $n->getMessage(),
            'pageUrl'   => $n->getPageUrl(),
            'isRead'    => $n->isRead(),
            'createdAt' => $n->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }
}
