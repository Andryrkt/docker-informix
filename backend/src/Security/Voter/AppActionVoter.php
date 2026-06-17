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

class AppActionVoter extends Voter
{
    public function __construct(
        private readonly SecurityContextService $securityContext,
        private readonly EntityManagerInterface $entityManager
    ) {}

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, AppAction::ALL, true)
            && ($subject instanceof AppModule || $subject instanceof AppMenu || is_string($subject));
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        if (in_array('ROLE_SUPER_ADMIN', $user->getRoles(), true)) {
            return true;
        }

        $company = $this->securityContext->getActiveCompany();
        if (!$company) {
            return false;
        }

        // Si le sujet est un slug (string), on cherche la ressource
        if (is_string($subject)) {
            // On cherche d'abord dans les modules, puis les menus
            $resource = $this->entityManager->getRepository(AppModule::class)->findOneBy(['slug' => $subject]);
            if (!$resource) {
                $resource = $this->entityManager->getRepository(AppMenu::class)->findOneBy(['slug' => $subject]);
            }
            
            if (!$resource) {
                return false;
            }
            $subject = $resource;
        }

        $resourceType = $subject instanceof AppModule ? 'module' : 'menu';
        
        $permission = $this->entityManager->getRepository(UserPermission::class)->findOneBy([
            'user' => $user,
            'company' => $company,
            'resourceType' => $resourceType,
            'resourceId' => $subject->getId()
        ]);

        return $permission?->hasAction($attribute) ?? false;
    }
}
