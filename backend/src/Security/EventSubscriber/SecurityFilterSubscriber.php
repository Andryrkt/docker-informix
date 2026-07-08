<?php

namespace App\Security\EventSubscriber;

use App\Security\Service\SecurityContextService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

class SecurityFilterSubscriber implements EventSubscriberInterface
{
    // Routes qui ne font jamais de requêtes Informix — inutile d'établir
    // une connexion SQL Server juste pour activer le filtre.
    private const SKIP_ROUTES = [
        '/api/login',
        '/api/me',
        '/api/navigation',
    ];

    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SecurityContextService $securityContext
    ) {}

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => [['onKernelRequest', 10]], // Exécuter après l'authentification
        ];
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $path = $event->getRequest()->getPathInfo();
        foreach (self::SKIP_ROUTES as $skip) {
            if (str_starts_with($path, $skip)) {
                return;
            }
        }

        $agencyIds = $this->securityContext->getAllowedAgencyIds();
        $serviceIds = $this->securityContext->getAllowedServiceIds();

        // Si l'utilisateur n'est pas SUPER_ADMIN et a un scope restreint
        if (!empty($agencyIds) || !empty($serviceIds)) {
            $filters = $this->entityManager->getFilters();
            if ($filters->has('user_scope')) {
                $filter = $filters->enable('user_scope');
                
                if (!empty($agencyIds)) {
                    // Doctrine attend une chaîne formatée pour le IN
                    $filter->setParameter('allowed_agencies', '"' . implode('","', $agencyIds) . '"');
                }
                
                if (!empty($serviceIds)) {
                    $filter->setParameter('allowed_services', '"' . implode('","', $serviceIds) . '"');
                }
            }
        }
    }
}
