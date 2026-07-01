<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\Agency;
use App\Security\Entity\Company;
use App\Security\Entity\Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/agencies')]
class AdminAgencyController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $agencies = $this->em->getRepository(Agency::class)->findBy([], ['name' => 'ASC']);

        return $this->json(array_map(fn(Agency $a) => [
            'id'      => $a->getId(),
            'name'    => $a->getName(),
            'code'    => $a->getCode(),
            'company' => [
                'id'   => $a->getCompany()?->getId(),
                'name' => $a->getCompany()?->getName(),
                'code' => $a->getCompany()?->getCode(),
            ],
            'services' => $a->getServices()->map(fn(Service $s) => [
                'id'   => $s->getId(),
                'name' => $s->getName(),
                'code' => $s->getCode(),
            ])->toArray(),
        ], $agencies));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $name      = trim($data['name'] ?? '');
        $code      = strtoupper(trim($data['code'] ?? ''));
        $companyId = $data['companyId'] ?? null;

        if ($name === '' || $code === '' || !$companyId) {
            return $this->json(['error' => 'Les champs name, code et companyId sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $company = $this->em->getRepository(Company::class)->find($companyId);
        if (!$company) {
            return $this->json(['error' => 'Société introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $agency = new Agency();
        $agency->setName($name)->setCode($code)->setCompany($company);

        foreach ($data['serviceIds'] ?? [] as $serviceId) {
            $service = $this->em->getRepository(Service::class)->find($serviceId);
            if ($service) {
                $agency->addService($service);
            }
        }

        $this->em->persist($agency);
        $this->em->flush();

        return $this->json(['id' => $agency->getId(), 'name' => $agency->getName(), 'code' => $agency->getCode()], Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $agency = $this->em->getRepository(Agency::class)->find($id);
        if (!$agency) {
            return $this->json(['error' => 'Agence introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data      = json_decode($request->getContent(), true) ?? [];
        $name      = trim($data['name'] ?? '');
        $code      = strtoupper(trim($data['code'] ?? ''));
        $companyId = $data['companyId'] ?? null;

        if ($name === '' || $code === '' || !$companyId) {
            return $this->json(['error' => 'Les champs name, code et companyId sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $company = $this->em->getRepository(Company::class)->find($companyId);
        if (!$company) {
            return $this->json(['error' => 'Société introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $agency->setName($name)->setCode($code)->setCompany($company);

        // Remplacer les services
        foreach ($agency->getServices()->toArray() as $s) {
            $agency->removeService($s);
        }
        foreach ($data['serviceIds'] ?? [] as $serviceId) {
            $service = $this->em->getRepository(Service::class)->find($serviceId);
            if ($service) {
                $agency->addService($service);
            }
        }

        $this->em->flush();

        return $this->json(['id' => $agency->getId(), 'name' => $agency->getName(), 'code' => $agency->getCode()]);
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $agency = $this->em->getRepository(Agency::class)->find($id);
        if (!$agency) {
            return $this->json(['error' => 'Agence introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($agency);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }
}
