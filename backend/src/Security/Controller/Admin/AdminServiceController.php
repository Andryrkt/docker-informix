<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/services')]
class AdminServiceController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $services = $this->em->getRepository(Service::class)->findBy([], ['name' => 'ASC']);

        return $this->json(array_map(fn(Service $s) => [
            'id'   => $s->getId(),
            'name' => $s->getName(),
            'code' => $s->getCode(),
        ], $services));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $name = trim($data['name'] ?? '');
        $code = strtoupper(trim($data['code'] ?? ''));

        if ($name === '' || $code === '') {
            return $this->json(['error' => 'Les champs name et code sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $exists = $this->em->getRepository(Service::class)->findOneBy(['code' => $code]);
        if ($exists) {
            return $this->json(['error' => "Le code \"$code\" est déjà utilisé."], Response::HTTP_CONFLICT);
        }

        $service = new Service();
        $service->setName($name)->setCode($code);

        $this->em->persist($service);
        $this->em->flush();

        return $this->json(['id' => $service->getId(), 'name' => $service->getName(), 'code' => $service->getCode()], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $service = $this->em->getRepository(Service::class)->find($id);
        if (!$service) {
            return $this->json(['error' => 'Service introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $name = trim($data['name'] ?? '');
        $code = strtoupper(trim($data['code'] ?? ''));

        if ($name === '' || $code === '') {
            return $this->json(['error' => 'Les champs name et code sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $duplicate = $this->em->getRepository(Service::class)->findOneBy(['code' => $code]);
        if ($duplicate && $duplicate->getId() !== $id) {
            return $this->json(['error' => "Le code \"$code\" est déjà utilisé."], Response::HTTP_CONFLICT);
        }

        $service->setName($name)->setCode($code);
        $this->em->flush();

        return $this->json(['id' => $service->getId(), 'name' => $service->getName(), 'code' => $service->getCode()]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $service = $this->em->getRepository(Service::class)->find($id);
        if (!$service) {
            return $this->json(['error' => 'Service introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($service);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
