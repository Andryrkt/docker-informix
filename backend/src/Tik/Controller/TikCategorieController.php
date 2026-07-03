<?php

namespace App\Tik\Controller;

use App\Tik\Entity\TikAutresCategorie;
use App\Tik\Entity\TikCategorie;
use App\Tik\Entity\TikSousCategorie;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class TikCategorieController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {}

    /**
     * Arbre complet catégorie → sous-catégorie → autres catégorie,
     * utilisé par le formulaire de création de ticket.
     */
    #[Route('/api/tik/categories', methods: ['GET'])]
    public function tree(): JsonResponse
    {
        $categories = $this->em->getRepository(TikCategorie::class)->findBy([], ['description' => 'ASC']);
        $sousCategories = $this->em->getRepository(TikSousCategorie::class)->findBy([], ['description' => 'ASC']);
        $autresCategories = $this->em->getRepository(TikAutresCategorie::class)->findBy([], ['description' => 'ASC']);

        return $this->json(array_map(function (TikCategorie $c) use ($sousCategories, $autresCategories) {
            $sousCatsOfC = array_values(array_filter($sousCategories, fn(TikSousCategorie $sc) => $sc->getCategorie()?->getId() === $c->getId()));

            return [
                'id' => $c->getId(),
                'description' => $c->getDescription(),
                'sousCategories' => array_map(function (TikSousCategorie $sc) use ($autresCategories) {
                    $autresCatsOfSc = array_values(array_filter($autresCategories, fn(TikAutresCategorie $ac) => $ac->getSousCategorie()?->getId() === $sc->getId()));

                    return [
                        'id' => $sc->getId(),
                        'description' => $sc->getDescription(),
                        'autresCategories' => array_map(fn(TikAutresCategorie $ac) => [
                            'id' => $ac->getId(),
                            'description' => $ac->getDescription(),
                        ], $autresCatsOfSc),
                    ];
                }, $sousCatsOfC),
            ];
        }, $categories));
    }

    // ── Admin CRUD : Catégorie ───────────────────────────────────────────────────

    #[Route('/api/admin/tik/categories', methods: ['POST'])]
    public function createCategorie(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $description = trim((string) ($data['description'] ?? ''));
        if ($description === '') {
            return $this->json(['error' => 'La description est obligatoire.'], Response::HTTP_BAD_REQUEST);
        }

        $categorie = (new TikCategorie())->setDescription($description);
        $this->em->persist($categorie);
        $this->em->flush();

        return $this->json(['id' => $categorie->getId(), 'description' => $categorie->getDescription()], Response::HTTP_CREATED);
    }

    #[Route('/api/admin/tik/categories/{id}', methods: ['DELETE'])]
    public function deleteCategorie(int $id): JsonResponse
    {
        $categorie = $this->em->getRepository(TikCategorie::class)->find($id);
        if (!$categorie) {
            return $this->json(['error' => 'Catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }
        $this->em->remove($categorie);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Admin CRUD : Sous-catégorie ──────────────────────────────────────────────

    #[Route('/api/admin/tik/sous-categories', methods: ['POST'])]
    public function createSousCategorie(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $description = trim((string) ($data['description'] ?? ''));
        $categorieId = isset($data['categorieId']) ? (int) $data['categorieId'] : null;

        if ($description === '' || !$categorieId) {
            return $this->json(['error' => 'La description et la catégorie sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $categorie = $this->em->getRepository(TikCategorie::class)->find($categorieId);
        if (!$categorie) {
            return $this->json(['error' => 'Catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $sousCategorie = (new TikSousCategorie())->setDescription($description)->setCategorie($categorie);
        $this->em->persist($sousCategorie);
        $this->em->flush();

        return $this->json(['id' => $sousCategorie->getId(), 'description' => $sousCategorie->getDescription()], Response::HTTP_CREATED);
    }

    #[Route('/api/admin/tik/sous-categories/{id}', methods: ['DELETE'])]
    public function deleteSousCategorie(int $id): JsonResponse
    {
        $sousCategorie = $this->em->getRepository(TikSousCategorie::class)->find($id);
        if (!$sousCategorie) {
            return $this->json(['error' => 'Sous-catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }
        $this->em->remove($sousCategorie);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Admin CRUD : Autres catégorie ────────────────────────────────────────────

    #[Route('/api/admin/tik/autres-categories', methods: ['POST'])]
    public function createAutresCategorie(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $description = trim((string) ($data['description'] ?? ''));
        $sousCategorieId = isset($data['sousCategorieId']) ? (int) $data['sousCategorieId'] : null;

        if ($description === '' || !$sousCategorieId) {
            return $this->json(['error' => 'La description et la sous-catégorie sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $sousCategorie = $this->em->getRepository(TikSousCategorie::class)->find($sousCategorieId);
        if (!$sousCategorie) {
            return $this->json(['error' => 'Sous-catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $autresCategorie = (new TikAutresCategorie())->setDescription($description)->setSousCategorie($sousCategorie);
        $this->em->persist($autresCategorie);
        $this->em->flush();

        return $this->json(['id' => $autresCategorie->getId(), 'description' => $autresCategorie->getDescription()], Response::HTTP_CREATED);
    }

    #[Route('/api/admin/tik/autres-categories/{id}', methods: ['DELETE'])]
    public function deleteAutresCategorie(int $id): JsonResponse
    {
        $autresCategorie = $this->em->getRepository(TikAutresCategorie::class)->find($id);
        if (!$autresCategorie) {
            return $this->json(['error' => 'Catégorie introuvable.'], Response::HTTP_NOT_FOUND);
        }
        $this->em->remove($autresCategorie);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
