<?php

namespace App\Security\Controller;

use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use App\Security\Service\SecurityContextService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use OpenApi\Attributes as OA;

class SecurityController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager
    ) {}

    /**
     * Point d'entrée d'authentification LDAP.
     */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    #[OA\Post(
        path: '/api/login',
        summary: 'Authentification LDAP',
        description: 'Authentifie un utilisateur via LDAP et retourne un token JWT.',
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'username', type: 'string', example: 'lanto'),
                    new OA\Property(property: 'password', type: 'string', example: '********')
                ]
            )
        )
    )]
    #[OA\Response(
        response: 200,
        description: 'Token JWT généré avec succès',
        content: new OA\JsonContent(
            properties: [
                new OA\Property(property: 'token', type: 'string'),
                new OA\Property(property: 'user', type: 'object')
            ]
        )
    )]
    #[OA\Response(response: 401, description: 'Identifiants invalides')]
    #[OA\Tag(name: 'Sécurité')]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Authentification requise.'], 401);
        }

        return $this->json([
            'username'    => $user->getUserIdentifier(),
            'displayName' => $user->getDisplayName(),
            'email'       => $user->getEmail(),
            'department'  => $user->getDepartment(),
            'roles'       => $user->getRoles(),
        ]);
    }

    /**
     * Retourne les informations de l'utilisateur connecté (via JWT).
     */
    #[Route('/api/me', name: 'api_me', methods: ['GET'])]
    #[OA\Get(
        path: '/api/me',
        summary: 'Profil utilisateur et périmètre',
        description: 'Retourne les infos de l\'utilisateur connecté, ses sociétés et son scope (agences/services).'
    )]
    #[OA\Response(response: 200, description: 'Profil récupéré')]
    #[OA\Tag(name: 'Sécurité')]
    public function me(#[CurrentUser] ?User $user, SecurityContextService $securityContext): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], 401);
        }

        // Récupérer les sociétés via les permissions
        $permissions = $this->entityManager->getRepository(UserPermission::class)->findBy(['user' => $user]);
        $companies = [];
        foreach ($permissions as $p) {
            $comp = $p->getCompany();
            $companies[$comp->getId()] = [
                'id' => $comp->getId(),
                'name' => $comp->getName(),
                'code' => $comp->getCode(),
            ];
        }

        $scope = $securityContext->getUserScope();

        return $this->json([
            'username'    => $user->getUserIdentifier(),
            'displayName' => $user->getDisplayName(),
            'email'       => $user->getEmail(),
            'department'  => $user->getDepartment(),
            'roles'       => $user->getRoles(),
            'lastLoginAt' => $user->getLastLoginAt()?->format('d/m/Y H:i'),
            'companies'   => array_values($companies),
            'scope'       => [
                'agencies' => $scope ? $scope->getAgencies()->map(fn($a) => ['id' => $a->getId(), 'name' => $a->getName()])->toArray() : [],
                'services' => $scope ? $scope->getServices()->map(fn($s) => ['id' => $s->getId(), 'name' => $s->getName()])->toArray() : [],
            ]
        ]);
    }
}
