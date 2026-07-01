<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\AppActionDef;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/actions')]
class AdminActionController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $actions = $this->em->getRepository(AppActionDef::class)
            ->findBy([], ['sortOrder' => 'ASC', 'label' => 'ASC']);

        return $this->json(array_map(fn(AppActionDef $a) => $this->serialize($a), $actions));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        [$action, $error] = $this->buildAction($data);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->persist($action);
        $this->em->flush();

        return $this->json($this->serialize($action), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $action = $this->em->getRepository(AppActionDef::class)->find($id);
        if (!$action) {
            return $this->json(['error' => 'Action introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        [, $error] = $this->buildAction($data, $action);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->em->flush();

        return $this->json($this->serialize($action));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $action = $this->em->getRepository(AppActionDef::class)->find($id);
        if (!$action) {
            return $this->json(['error' => 'Action introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($action);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    /**
     * @return array{AppActionDef|null, string|null}
     */
    private function buildAction(array $data, ?AppActionDef $existing = null): array
    {
        $key      = strtolower(trim(preg_replace('/\s+/', '_', $data['actionKey'] ?? '')));
        $label    = trim($data['label'] ?? '');
        $category = trim($data['category'] ?? '') ?: null;
        $order    = (int)($data['sortOrder'] ?? 0);

        if ($key === '') {
            return [null, 'Le champ actionKey est obligatoire.'];
        }
        if (!preg_match('/^[a-z][a-z0-9_]*$/', $key)) {
            return [null, 'actionKey doit être en minuscules, sans espaces ni accents (ex: validate, export_pdf).'];
        }
        if ($label === '') {
            return [null, 'Le champ label est obligatoire.'];
        }

        $duplicate = $this->em->getRepository(AppActionDef::class)->findOneBy(['actionKey' => $key]);
        if ($duplicate && $duplicate->getId() !== $existing?->getId()) {
            return [null, "La clé \"$key\" est déjà utilisée."];
        }

        $action = $existing ?? new AppActionDef();
        $action->setActionKey($key);
        $action->setLabel($label);
        $action->setCategory($category);
        $action->setSortOrder($order);

        return [$action, null];
    }

    private function serialize(AppActionDef $a): array
    {
        return [
            'id'        => $a->getId(),
            'actionKey' => $a->getActionKey(),
            'label'     => $a->getLabel(),
            'category'  => $a->getCategory(),
            'sortOrder' => $a->getSortOrder(),
        ];
    }
}
