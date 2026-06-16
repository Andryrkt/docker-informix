<?php

namespace App\Security\Controller;

use App\Security\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class SecurityController extends AbstractController
{
    /**
     * Point d'entrée d'authentification LDAP.
     * La route est gérée par LdapAuthenticator + Lexik JWT.
     * Cette méthode n'est appelée qu'en cas de succès (token déjà généré par Lexik).
     */
    #[Route('/api/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        // Le token JWT est généré et injecté dans la réponse par Lexik.
        // Ici on peut retourner des infos supplémentaires si nécessaire.
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
    public function me(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Non authentifié.'], 401);
        }

        return $this->json([
            'username'    => $user->getUserIdentifier(),
            'displayName' => $user->getDisplayName(),
            'email'       => $user->getEmail(),
            'department'  => $user->getDepartment(),
            'roles'       => $user->getRoles(),
            'lastLoginAt' => $user->getLastLoginAt()?->format('d/m/Y H:i'),
        ]);
    }
}
