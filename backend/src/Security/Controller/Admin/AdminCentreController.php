<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\Agency;
use App\Security\Entity\Centre;
use App\Security\Entity\Service;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/centres')]
class AdminCentreController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $centres = $this->em->getRepository(Centre::class)->findBy([], ['code' => 'ASC']);

        return $this->json(array_map(fn(Centre $c) => $this->serialize($c), $centres));
    }

    #[Route('/{id}', methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $centre = $this->em->getRepository(Centre::class)->find($id);
        if (!$centre) {
            return $this->json(['error' => 'Centre introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return $this->json($this->serialize($centre));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        [$error, $agency, $service] = $this->resolveRelations($data);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $code        = strtoupper(trim($data['code'] ?? ''));
        $companyCode = strtoupper(trim($data['companyCode'] ?? ''));
        $codeSage    = trim($data['codeSage'] ?? '') ?: null;
        $responsable = trim($data['responsable'] ?? '') ?: null;

        if ($code === '' || $companyCode === '') {
            return $this->json(['error' => 'Les champs code et société sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $exists = $this->em->getRepository(Centre::class)->findOneBy(['code' => $code, 'codeSage' => $codeSage]);
        if ($exists) {
            return $this->json(['error' => "La combinaison code/codeSage \"$code/$codeSage\" existe déjà."], Response::HTTP_CONFLICT);
        }

        $centre = new Centre();
        $centre->setAgency($agency)->setService($service)
               ->setCode($code)->setCompanyCode($companyCode)
               ->setCodeSage($codeSage)->setResponsable($responsable);

        $this->em->persist($centre);
        $this->em->flush();

        return $this->json($this->serialize($centre), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        $centre = $this->em->getRepository(Centre::class)->find($id);
        if (!$centre) {
            return $this->json(['error' => 'Centre introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        [$error, $agency, $service] = $this->resolveRelations($data);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $code        = strtoupper(trim($data['code'] ?? ''));
        $companyCode = strtoupper(trim($data['companyCode'] ?? ''));
        $codeSage    = trim($data['codeSage'] ?? '') ?: null;
        $responsable = trim($data['responsable'] ?? '') ?: null;

        if ($code === '' || $companyCode === '') {
            return $this->json(['error' => 'Les champs code et société sont obligatoires.'], Response::HTTP_BAD_REQUEST);
        }

        $duplicate = $this->em->getRepository(Centre::class)->findOneBy(['code' => $code, 'codeSage' => $codeSage]);
        if ($duplicate && $duplicate->getId() !== $id) {
            return $this->json(['error' => "La combinaison code/codeSage \"$code/$codeSage\" existe déjà."], Response::HTTP_CONFLICT);
        }

        $centre->setAgency($agency)->setService($service)
               ->setCode($code)->setCompanyCode($companyCode)
               ->setCodeSage($codeSage)->setResponsable($responsable);

        $this->em->flush();

        return $this->json($this->serialize($centre));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        $centre = $this->em->getRepository(Centre::class)->find($id);
        if (!$centre) {
            return $this->json(['error' => 'Centre introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->em->remove($centre);
        $this->em->flush();

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function resolveRelations(array $data): array
    {
        $agencyId  = (int) ($data['agencyId'] ?? 0);
        $serviceId = (int) ($data['serviceId'] ?? 0);

        if (!$agencyId || !$serviceId) {
            return ["Les champs agence et service sont obligatoires.", null, null];
        }

        $agency  = $this->em->getRepository(Agency::class)->find($agencyId);
        $service = $this->em->getRepository(Service::class)->find($serviceId);

        if (!$agency)  return ["Agence introuvable (id=$agencyId).", null, null];
        if (!$service) return ["Service introuvable (id=$serviceId).", null, null];

        return [null, $agency, $service];
    }

    private function serialize(Centre $c): array
    {
        return [
            'id'          => $c->getId(),
            'code'        => $c->getCode(),
            'companyCode' => $c->getCompanyCode(),
            'codeSage'    => $c->getCodeSage(),
            'responsable' => $c->getResponsable(),
            'agency'      => [
                'id'   => $c->getAgency()->getId(),
                'code' => $c->getAgency()->getCode(),
                'name' => $c->getAgency()->getName(),
            ],
            'service'     => [
                'id'   => $c->getService()->getId(),
                'code' => $c->getService()->getCode(),
                'name' => $c->getService()->getName(),
            ],
        ];
    }
}
