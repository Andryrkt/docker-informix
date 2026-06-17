<?php

namespace App\Security\Controller;

use App\Security\AppAction;
use App\Security\Entity\AppMenu;
use App\Security\Entity\AppModule;
use App\Security\Entity\Company;
use App\Security\Entity\UserPermission;
use App\Security\Service\SecurityContextService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class NavigationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly SecurityContextService $securityContext
    ) {}

    #[Route('/api/navigation', name: 'api_navigation', methods: ['GET'])]
    public function getNavigation(): JsonResponse
    {
        $user = $this->getUser();
        $company = $this->securityContext->getActiveCompany();

        if (!$company) {
            return $this->json(['error' => 'Veuillez sélectionner une société.'], 400);
        }

        // 1. Récupérer toutes les permissions de l'utilisateur pour cette société
        $allPermissions = $this->entityManager->getRepository(UserPermission::class)->findBy([
            'user' => $user,
            'company' => $company
        ]);

        // Indexer les permissions pour un accès rapide [resourceType][resourceId]
        $permissionsMap = [];
        foreach ($allPermissions as $p) {
            $permissionsMap[$p->getResourceType()][$p->getResourceId()] = $p;
        }

        // 2. Récupérer les sociétés autorisées
        $companies = [];
        $companyPermissions = $this->entityManager->getRepository(UserPermission::class)->findBy(['user' => $user]);
        foreach ($companyPermissions as $cp) {
            $c = $cp->getCompany();
            $companies[$c->getId()] = [
                'id' => $c->getId(),
                'nom' => $c->getName()
            ];
        }

        // 3. Construire les vignettes (Modules)
        $vignettes = [];
        $modules = $this->entityManager->getRepository(AppModule::class)->findAll();
        
        foreach ($modules as $module) {
            $mPerm = $permissionsMap['module'][$module->getId()] ?? null;
            if (!$mPerm || !$mPerm->hasAction(AppAction::VIEW)) {
                continue;
            }

            $moduleData = [
                'id' => $module->getId(),
                'nom' => $module->getLabel(),
                'Module' => [] // Dans ton JSON, "Module" contient les menus
            ];

            // Menus de premier niveau pour ce module
            $menus = $this->entityManager->getRepository(AppMenu::class)->findBy([
                'module' => $module,
                'parent' => null
            ]);

            foreach ($menus as $menu) {
                $menuPerm = $permissionsMap['menu'][$menu->getId()] ?? null;
                if (!$menuPerm || !$menuPerm->hasAction(AppAction::VIEW)) {
                    continue;
                }

                $moduleData['Module'][] = $this->serializeMenu($menu, $permissionsMap);
            }

            $vignettes[] = $moduleData;
        }

        // 4. Data Scope (Infos utilisateur)
        $userScope = $this->securityContext->getUserScope();
        // Ici on prend la première agence/service comme défaut (à adapter si besoin)
        $defaultAgency = $userScope && !$userScope->getAgencies()->isEmpty() ? $userScope->getAgencies()->first()->getId() : null;
        $defaultService = $userScope && !$userScope->getServices()->isEmpty() ? $userScope->getServices()->first()->getId() : null;

        return $this->json([
            'societes' => array_values($companies),
            'vignettes' => $vignettes,
            'data_scope' => [
                'userAgenceId' => $defaultAgency,
                'userServiceId' => $defaultService
            ]
        ]);
    }

    private function serializeMenu(AppMenu $menu, array $permissionsMap): array
    {
        $perm = $permissionsMap['menu'][$menu->getId()] ?? null;

        $data = [
            'id' => $menu->getId(),
            'nom' => $menu->getLabel(),
            'route' => $menu->getRoute(),
            'actions' => $perm ? $perm->getActions() : [],
            'scope' => [
                'allAgences' => $perm ? $perm->isAllAgences() : false,
                'allServices' => $perm ? $perm->isAllServices() : false,
                'agenceIds' => $perm ? $perm->getAgenceIds() : [],
                'serviceIds' => $perm ? $perm->getServiceIds() : []
            ],
            'menu' => [] // Submenus
        ];

        foreach ($menu->getSubMenus() as $subMenu) {
            $subPerm = $permissionsMap['menu'][$subMenu->getId()] ?? null;
            if ($subPerm && $subPerm->hasAction(AppAction::VIEW)) {
                $data['menu'][] = $this->serializeMenu($subMenu, $permissionsMap);
            }
        }

        return $data;
    }
}
