<?php

namespace App\Security\Service;

use App\Security\Entity\Company;
use App\Security\Entity\User;
use App\Security\Entity\UserScope;
use App\Security\Repository\CompanyRepository;
use App\Security\Repository\UserScopeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

class SecurityContextService
{
    private ?Company $activeCompany = null;
    private ?UserScope $userScope = null;

    public function __construct(
        private readonly RequestStack $requestStack,
        private readonly Security $security,
        private readonly EntityManagerInterface $entityManager
    ) {}

    /**
     * Récupère la société active depuis le header X-Active-Company-ID.
     */
    public function getActiveCompany(): ?Company
    {
        if ($this->activeCompany !== null) {
            return $this->activeCompany;
        }

        $request = $this->requestStack->getCurrentRequest();
        if (!$request) {
            return null;
        }

        $companyId = $request->headers->get('X-Active-Company-ID');
        if (!$companyId) {
            return null;
        }

        $this->activeCompany = $this->entityManager->getRepository(Company::class)->find($companyId);

        return $this->activeCompany;
    }

    /**
     * Récupère le scope (agences/services) de l'utilisateur connecté.
     */
    public function getUserScope(): ?UserScope
    {
        if ($this->userScope !== null) {
            return $this->userScope;
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return null;
        }

        $this->userScope = $this->entityManager->getRepository(UserScope::class)->findOneBy(['user' => $user]);

        return $this->userScope;
    }

    /**
     * Retourne les IDs des agences autorisées.
     * @return array<int>
     */
    public function getAllowedAgencyIds(): array
    {
        $scope = $this->getUserScope();
        if (!$scope) {
            return [];
        }

        return $scope->getAgencies()->map(fn($a) => $a->getId())->toArray();
    }

    /**
     * Retourne les IDs des services autorisés.
     * @return array<int>
     */
    public function getAllowedServiceIds(): array
    {
        $scope = $this->getUserScope();
        if (!$scope) {
            return [];
        }

        return $scope->getServices()->map(fn($s) => $s->getId())->toArray();
    }
}
