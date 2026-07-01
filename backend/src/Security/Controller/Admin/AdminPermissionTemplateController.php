<?php

namespace App\Security\Controller\Admin;

use App\Security\AppAction;
use App\Security\Entity\AppMenu;
use App\Security\Entity\AppModule;
use App\Security\Entity\Company;
use App\Security\Entity\PermissionTemplate;
use App\Security\Entity\PermissionTemplateItem;
use App\Security\Repository\PermissionTemplateRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/permission-templates')]
class AdminPermissionTemplateController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly PermissionTemplateRepository $repo,
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $templates = $this->repo->findBy([], ['name' => 'ASC']);
        return $this->json(array_map(fn(PermissionTemplate $t) => $this->serialize($t), $templates));
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $template = $this->repo->find($id);
        if (!$template) {
            return $this->json(['error' => 'Modèle introuvable.'], Response::HTTP_NOT_FOUND);
        }
        return $this->json($this->serialize($template));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        [$template, $error] = $this->buildTemplate($data);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($template);
        $this->em->flush();

        return $this->json($this->serialize($template), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $template = $this->repo->find($id);
        if (!$template) {
            return $this->json(['error' => 'Modèle introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        [, $error] = $this->buildTemplate($data, $template);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->flush();

        return $this->json($this->serialize($template));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $template = $this->repo->find($id);
        if (!$template) {
            return $this->json(['error' => 'Modèle introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($template);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /** @return array{PermissionTemplate|null, string|null} */
    private function buildTemplate(array $data, ?PermissionTemplate $existing = null): array
    {
        $name        = trim($data['name'] ?? '');
        $description = trim($data['description'] ?? '') ?: null;
        $itemsData   = $data['items'] ?? [];

        if ($name === '') {
            return [null, 'Le nom du modèle est obligatoire.'];
        }

        $duplicate = $this->repo->findByNameExcluding($name, $existing?->getId());
        if ($duplicate) {
            return [null, "Un modèle nommé \"$name\" existe déjà."];
        }

        $template = $existing ?? new PermissionTemplate();
        $template->setName($name);
        $template->setDescription($description);

        // Remplacer tous les items existants
        foreach ($template->getItems() as $item) {
            $template->removeItem($item);
            $this->em->remove($item);
        }

        foreach ($itemsData as $itemData) {
            [$item, $err] = $this->buildItem($itemData);
            if ($err) {
                return [null, $err];
            }
            $template->addItem($item);
        }

        return [$template, null];
    }

    /** @return array{PermissionTemplateItem|null, string|null} */
    private function buildItem(array $data): array
    {
        $companyId    = $data['companyId']    ?? null;
        $resourceType = $data['resourceType'] ?? null;
        $resourceId   = $data['resourceId']   ?? null;
        $actions      = $data['actions']      ?? [];
        $scopeAll     = (bool)($data['scopeAll'] ?? true);
        $agencyScopesRaw = $data['agencyScopes'] ?? [];

        if (!$companyId) {
            return [null, 'Le champ companyId est obligatoire dans un item.'];
        }
        if (!in_array($resourceType, ['module', 'menu'], true)) {
            return [null, 'resourceType doit être "module" ou "menu".'];
        }
        if (!$resourceId) {
            return [null, 'Le champ resourceId est obligatoire dans un item.'];
        }

        $company = $this->em->getRepository(Company::class)->find($companyId);
        if (!$company) {
            return [null, "Société #$companyId introuvable."];
        }

        $validActions = array_values(array_intersect($actions, AppAction::ALL));

        $agencyScopes = [];
        foreach ($agencyScopesRaw as $scope) {
            if (!isset($scope['agencyId'])) continue;
            $agencyScopes[] = [
                'agencyId'    => (int)$scope['agencyId'],
                'allServices' => (bool)($scope['allServices'] ?? true),
                'serviceIds'  => array_map('intval', $scope['serviceIds'] ?? []),
            ];
        }

        $item = new PermissionTemplateItem();
        $item->setCompany($company);
        $item->setResourceType($resourceType);
        $item->setResourceId((int)$resourceId);
        $item->setActions($validActions);
        $item->setScopeAll($scopeAll);
        $item->setAgencyScopes($scopeAll ? [] : $agencyScopes);

        return [$item, null];
    }

    private function serialize(PermissionTemplate $t): array
    {
        return [
            'id'          => $t->getId(),
            'name'        => $t->getName(),
            'description' => $t->getDescription(),
            'items'       => $t->getItems()->map(fn(PermissionTemplateItem $i) => $this->serializeItem($i))->toArray(),
        ];
    }

    private function serializeItem(PermissionTemplateItem $i): array
    {
        $resourceLabel = '—';
        if ($i->getResourceType() === 'module') {
            $module = $this->em->getRepository(AppModule::class)->find($i->getResourceId());
            $resourceLabel = $module?->getLabel() ?? '?';
        } else {
            $menu = $this->em->getRepository(AppMenu::class)->find($i->getResourceId());
            $resourceLabel = $menu?->getLabel() ?? '?';
        }

        return [
            'id'            => $i->getId(),
            'company'       => ['id' => $i->getCompany()->getId(), 'name' => $i->getCompany()->getName(), 'code' => $i->getCompany()->getCode()],
            'resourceType'  => $i->getResourceType(),
            'resourceId'    => $i->getResourceId(),
            'resourceLabel' => $resourceLabel,
            'actions'       => $i->getActions(),
            'scopeAll'      => $i->isScopeAll(),
            'agencyScopes'  => $i->getAgencyScopes(),
        ];
    }
}
