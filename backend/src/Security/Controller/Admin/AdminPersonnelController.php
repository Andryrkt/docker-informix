<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\Centre;
use App\Security\Entity\Personnel;
use App\Security\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/personnel')]
class AdminPersonnelController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $list = $this->em->getRepository(Personnel::class)->findBy([], ['nom' => 'ASC']);

        return $this->json(array_map(fn(Personnel $p) => $this->serialize($p), $list));
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $p = $this->em->getRepository(Personnel::class)->find($id);
        if (!$p) {
            return $this->json(['error' => 'Personnel introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serialize($p));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        [$error, $p] = $this->hydrate(new Personnel(), $data);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $duplicate = $this->em->getRepository(Personnel::class)->findOneBy(['matricule' => $p->getMatricule()]);
        if ($duplicate) {
            return $this->json(['error' => "Le matricule \"{$p->getMatricule()}\" est déjà utilisé."], Response::HTTP_CONFLICT);
        }

        $this->em->persist($p);
        $this->em->flush();

        return $this->json($this->serialize($p), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $p = $this->em->getRepository(Personnel::class)->find($id);
        if (!$p) {
            return $this->json(['error' => 'Personnel introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        [$error, $p] = $this->hydrate($p, $data);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $duplicate = $this->em->getRepository(Personnel::class)->findOneBy(['matricule' => $p->getMatricule()]);
        if ($duplicate && $duplicate->getId() !== $id) {
            return $this->json(['error' => "Le matricule \"{$p->getMatricule()}\" est déjà utilisé."], Response::HTTP_CONFLICT);
        }

        $this->em->flush();

        return $this->json($this->serialize($p));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $p = $this->em->getRepository(Personnel::class)->find($id);
        if (!$p) {
            return $this->json(['error' => 'Personnel introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($p);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function hydrate(Personnel $p, array $data): array
    {
        $nom       = trim($data['nom'] ?? '');
        $prenoms   = trim($data['prenoms'] ?? '');
        $matricule = trim($data['matricule'] ?? '');

        if ($nom === '' || $prenoms === '' || $matricule === '') {
            return ['Les champs nom, prénoms et matricule sont obligatoires.', null];
        }

        $centreId = isset($data['centreId']) ? (int) $data['centreId'] : null;
        $userId   = isset($data['userId'])   ? (int) $data['userId']   : null;

        $centre = $centreId ? $this->em->getRepository(Centre::class)->find($centreId) : null;
        $user   = $userId   ? $this->em->getRepository(User::class)->find($userId)     : null;

        if ($centreId && !$centre) {
            return ["Centre introuvable (id=$centreId).", null];
        }
        if ($userId && !$user) {
            return ["Utilisateur introuvable (id=$userId).", null];
        }

        $p->setNom($nom)
          ->setPrenoms($prenoms)
          ->setMatricule($matricule)
          ->setCodeBancaire(trim($data['codeBancaire'] ?? '') ?: null)
          ->setCentre($centre)
          ->setUser($user);

        return [null, $p];
    }

    private function serialize(Personnel $p): array
    {
        return [
            'id'          => $p->getId(),
            'nom'         => $p->getNom(),
            'prenoms'     => $p->getPrenoms(),
            'matricule'   => $p->getMatricule(),
            'codeBancaire'=> $p->getCodeBancaire(),
            'centre'      => $p->getCentre() ? [
                'id'      => $p->getCentre()->getId(),
                'code'    => $p->getCentre()->getCode(),
                'codeSage'=> $p->getCentre()->getCodeSage(),
            ] : null,
            'user'        => $p->getUser() ? [
                'id'          => $p->getUser()->getId(),
                'username'    => $p->getUser()->getUsername(),
                'displayName' => $p->getUser()->getDisplayName(),
            ] : null,
        ];
    }
}
