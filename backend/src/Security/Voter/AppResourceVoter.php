<?php

namespace App\Security\Voter;

use App\Security\AppAction;
use App\Security\Entity\AppMenu;
use App\Security\Entity\AppModule;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use App\Security\Service\SecurityContextService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class AppResourceVoter extends Voter
{
    public function __construct(
        private readonly SecurityContextService $securityContext,
        private readonly EntityManagerInterface $entityManager
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return $attribute === AppAction::VIEW && ($subject instanceof AppModule || $subject instanceof AppMenu);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        // Si l'utilisateur est SUPER_ADMIN (à définir dans ses rôles), il a accès à tout
        if (in_array('ROLE_SUPER_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        $company = $this->securityContext->getActiveCompany();
        if (!$company) {
            return false;
        }

        $resourceType = $subject instanceof AppModule ? 'module' : 'menu';
        $resourceId = $subject->getId();

        $permission = $this->entityManager->getRepository(UserPermission::class)->findOneBy([
            'user' => $user,
            'company' => $company,
            'resourceType' => $resourceType,
            'resourceId' => $resourceId
        ]);

        return $permission?->hasAction(AppAction::VIEW) ?? false;
    }
}
