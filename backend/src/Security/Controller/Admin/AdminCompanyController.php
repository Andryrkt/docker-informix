<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\Company;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/companies')]
class AdminCompanyController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $companies = $this->em->getRepository(Company::class)->findBy([], ['name' => 'ASC']);

        return $this->json(array_map(fn(Company $c) => [
            'id'   => $c->getId(),
            'name' => $c->getName(),
            'code' => $c->getCode(),
        ], $companies));
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

        $exists = $this->em->getRepository(Company::class)->findOneBy(['code' => $code]);
        if ($exists) {
            return $this->json(['error' => "Le code \"$code\" est déjà utilisé."], Response::HTTP_CONFLICT);
        }

        $company = new Company();
        $company->setName($name)->setCode($code);

        $this->em->persist($company);
        $this->em->flush();

        return $this->json(['id' => $company->getId(), 'name' => $company->getName(), 'code' => $company->getCode()], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $company = $this->em->getRepository(Company::class)->find($id);
        if (!$company) {
            return $this->json(['error' => 'Société introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $name = trim($data['name'] ?? '');
        $code = strtoupper(trim($data['code'] ?? ''));

        if ($name === '' || $code === '') {
            return $this->json(['error' => 'Les champs name et code sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $duplicate = $this->em->getRepository(Company::class)->findOneBy(['code' => $code]);
        if ($duplicate && $duplicate->getId() !== $id) {
            return $this->json(['error' => "Le code \"$code\" est déjà utilisé."], Response::HTTP_CONFLICT);
        }

        $company->setName($name)->setCode($code);
        $this->em->flush();

        return $this->json(['id' => $company->getId(), 'name' => $company->getName(), 'code' => $company->getCode()]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $company = $this->em->getRepository(Company::class)->find($id);
        if (!$company) {
            return $this->json(['error' => 'Société introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($company);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
