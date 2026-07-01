<?php

namespace App\Security\Controller\Admin;

use App\Security\AppAction;
use App\Security\Entity\Agency;
use App\Security\Entity\AppMenu;
use App\Security\Entity\AppModule;
use App\Security\Entity\Company;
use App\Security\Entity\Service;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminUserPermissionController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    // ── Modules + menus (pour alimenter le formulaire) ──────────────────────

    #[Route('/api/admin/modules', methods: ['GET'])]
    public function listModules(): JsonResponse
    {
        $modules = $this->em->getRepository(AppModule::class)->findBy([], ['label' => 'ASC']);

        return $this->json(array_map(fn(AppModule $m) => [
            'id'    => $m->getId(),
            'label' => $m->getLabel(),
            'slug'  => $m->getSlug(),
            'menus' => $m->getMenus()->filter(fn(AppMenu $menu) => $menu->getParent() === null)
                ->map(fn(AppMenu $menu) => [
                    'id'       => $menu->getId(),
                    'label'    => $menu->getLabel(),
                    'slug'     => $menu->getSlug(),
                    'subMenus' => $menu->getSubMenus()->map(fn(AppMenu $sub) => [
                        'id'    => $sub->getId(),
                        'label' => $sub->getLabel(),
                        'slug'  => $sub->getSlug(),
                    ])->toArray(),
                ])->toArray(),
        ], $modules));
    }

    // ── Permissions d'un utilisateur ────────────────────────────────────────

    #[Route('/api/admin/users/{userId}/permissions', methods: ['GET'])]
    public function listPermissions(int $userId): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $permissions = $this->em->createQuery(
            'SELECT p, c FROM App\Security\Entity\UserPermission p JOIN p.company c WHERE p.user = :user ORDER BY c.name ASC'
        )->setParameter('user', $user)->getResult();

        return $this->json(array_map(fn(UserPermission $p) => $this->serializePermission($p), $permissions));
    }

    #[Route('/api/admin/users/{userId}/permissions', methods: ['POST'])]
    public function createPermission(int $userId, Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        [$perm, $error] = $this->buildPermission($data, $user);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($perm);
        $this->em->flush();

        return $this->json($this->serializePermission($perm), Response::HTTP_CREATED);
    }

    #[Route('/api/admin/permissions/{id}', methods: ['PUT'])]
    public function updatePermission(int $id, Request $request): JsonResponse
    {
        $perm = $this->em->getRepository(UserPermission::class)->find($id);
        if (!$perm) {
            return $this->json(['error' => 'Permission introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        [$updated, $error] = $this->buildPermission($data, $perm->getUser(), $perm);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->flush();

        return $this->json($this->serializePermission($updated));
    }

    #[Route('/api/admin/permissions/{id}', methods: ['DELETE'])]
    public function deletePermission(int $id): JsonResponse
    {
        $perm = $this->em->getRepository(UserPermission::class)->find($id);
        if (!$perm) {
            return $this->json(['error' => 'Permission introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($perm);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * @return array{UserPermission|null, string|null}
     */
    private function buildPermission(array $data, User $user, ?UserPermission $perm = null): array
    {
        $companyId    = $data['companyId']    ?? null;
        $resourceType = $data['resourceType'] ?? null;
        $resourceId    = $data['resourceId']    ?? null;
        $actions       = $data['actions']       ?? [];
        $scopeAll      = (bool)($data['scopeAll'] ?? true);
        $agencyScopesRaw = $data['agencyScopes'] ?? [];

        if (!$companyId) {
            return [null, 'Le champ companyId est obligatoire.'];
        }
        if (!in_array($resourceType, ['module', 'menu'], true)) {
            return [null, 'resourceType doit être "module" ou "menu".'];
        }
        if (!$resourceId) {
            return [null, 'Le champ resourceId est obligatoire.'];
        }

        $company = $this->em->getRepository(Company::class)->find($companyId);
        if (!$company) {
            return [null, 'Société introuvable.'];
        }

        $validActions = array_intersect($actions, AppAction::ALL);

        // Normaliser agencyScopes
        $agencyScopes = [];
        foreach ($agencyScopesRaw as $scope) {
            if (!isset($scope['agencyId'])) {
                continue;
            }
            $agencyScopes[] = [
                'agencyId'    => (int)$scope['agencyId'],
                'allServices' => (bool)($scope['allServices'] ?? true),
                'serviceIds'  => array_map('intval', $scope['serviceIds'] ?? []),
            ];
        }

        $p = $perm ?? new UserPermission();
        $p->setUser($user);
        $p->setCompany($company);
        $p->setResourceType($resourceType);
        $p->setResourceId((int)$resourceId);
        $p->setActions(array_values($validActions));
        $p->setScopeAll($scopeAll);
        $p->setAgencyScopes($scopeAll ? [] : $agencyScopes);

        return [$p, null];
    }

    private function serializePermission(UserPermission $p): array
    {
        $resourceLabel = '—';
        if ($p->getResourceType() === 'module') {
            $module = $this->em->getRepository(AppModule::class)->find($p->getResourceId());
            $resourceLabel = $module?->getLabel() ?? '?';
        } else {
            $menu = $this->em->getRepository(AppMenu::class)->find($p->getResourceId());
            $resourceLabel = $menu?->getLabel() ?? '?';
        }

        return [
            'id'            => $p->getId(),
            'company'       => ['id' => $p->getCompany()->getId(), 'name' => $p->getCompany()->getName(), 'code' => $p->getCompany()->getCode()],
            'resourceType'  => $p->getResourceType(),
            'resourceId'    => $p->getResourceId(),
            'resourceLabel' => $resourceLabel,
            'actions'       => $p->getActions(),
            'scopeAll'      => $p->isScopeAll(),
            'agencyScopes'  => $p->getAgencyScopes() ?? [],
        ];
    }
}
