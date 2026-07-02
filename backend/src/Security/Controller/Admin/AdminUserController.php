<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\Agency;
use App\Security\Entity\Personnel;
use App\Security\Entity\Service;
use App\Security\Entity\User;
use App\Security\Entity\UserScope;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/users')]
class AdminUserController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $users              = $this->em->getRepository(User::class)->findBy([], ['displayName' => 'ASC']);
        $personnelByMatricule = $this->indexPersonnelByMatricule();

        return $this->json(array_map(fn(User $u) => array_merge([
            'id'          => $u->getId(),
            'username'    => $u->getUserIdentifier(),
            'displayName' => $u->getDisplayName(),
            'email'       => $u->getEmail(),
            'department'  => $u->getDepartment(),
            'matricule'   => $u->getMatricule(),
            'roles'       => $u->getRoles(),
            'lastLoginAt' => $u->getLastLoginAt()?->format('d/m/Y H:i'),
        ], $this->serializeDefaultScope($u->getMatricule() ? ($personnelByMatricule[$u->getMatricule()] ?? null) : null)), $users));
    }

    /**
     * Détail d'un utilisateur, incluant son scope autorisé (UserScope) et son
     * agence/service par défaut (issus de Personnel → Centre, rattaché par matricule).
     */
    #[Route('/{id}', methods: ['GET'])]
    public function detail(int $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $scope     = $this->em->getRepository(UserScope::class)->findOneBy(['user' => $user]);
        $personnel = $user->getMatricule()
            ? $this->em->getRepository(Personnel::class)->findOneBy(['matricule' => $user->getMatricule()])
            : null;

        return $this->json(array_merge([
            'id'          => $user->getId(),
            'username'    => $user->getUserIdentifier(),
            'displayName' => $user->getDisplayName(),
            'email'       => $user->getEmail(),
            'matricule'   => $user->getMatricule(),
            'roles'       => $user->getRoles(),
            'agencyIds'   => $scope ? $scope->getAgencies()->map(fn(Agency $a) => $a->getId())->toArray()   : [],
            'serviceIds'  => $scope ? $scope->getServices()->map(fn(Service $s) => $s->getId())->toArray() : [],
        ], $this->serializeDefaultScope($personnel)));
    }

    /**
     * Renseigne manuellement le matricule de l'utilisateur — c'est la clé de
     * rattachement vers sa fiche Personnel (agence/service par défaut).
     */
    #[Route('/{id}/matricule', methods: ['PUT'])]
    public function updateMatricule(int $id, Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data      = json_decode($request->getContent(), true) ?? [];
        $matricule = trim((string) ($data['matricule'] ?? ''));

        $user->setMatricule($matricule !== '' ? $matricule : null);
        $this->em->flush();

        return $this->json(['id' => $user->getId(), 'matricule' => $user->getMatricule()]);
    }

    /**
     * Remplace les rôles de l'utilisateur (ex: ["ROLE_ADMIN"]).
     * ROLE_USER est toujours implicite, inutile de l'inclure.
     */
    #[Route('/{id}/roles', methods: ['PUT'])]
    public function updateRoles(int $id, Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data  = json_decode($request->getContent(), true) ?? [];
        $roles = array_values(array_filter(
            $data['roles'] ?? [],
            static fn($r) => is_string($r) && str_starts_with($r, 'ROLE_') && $r !== 'ROLE_USER',
        ));

        $user->setRoles($roles);
        $this->em->flush();

        return $this->json(['id' => $user->getId(), 'roles' => $user->getRoles()]);
    }

    /**
     * Remplace le scope (agences/services autorisés) de l'utilisateur.
     */
    #[Route('/{id}/scope', methods: ['PUT'])]
    public function updateScope(int $id, Request $request): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data       = json_decode($request->getContent(), true) ?? [];
        $agencyIds  = $data['agencyIds']  ?? [];
        $serviceIds = $data['serviceIds'] ?? [];

        $scope = $this->em->getRepository(UserScope::class)->findOneBy(['user' => $user]);
        if (!$scope) {
            $scope = new UserScope();
            $scope->setUser($user);
            $this->em->persist($scope);
        }

        foreach ($scope->getAgencies()->toArray() as $a) {
            $scope->removeAgency($a);
        }
        foreach ($agencyIds as $agencyId) {
            $agency = $this->em->getRepository(Agency::class)->find($agencyId);
            if ($agency) {
                $scope->addAgency($agency);
            }
        }

        foreach ($scope->getServices()->toArray() as $s) {
            $scope->removeService($s);
        }
        foreach ($serviceIds as $serviceId) {
            $service = $this->em->getRepository(Service::class)->find($serviceId);
            if ($service) {
                $scope->addService($service);
            }
        }

        $this->em->flush();

        return $this->json([
            'agencyIds'  => $scope->getAgencies()->map(fn(Agency $a) => $a->getId())->toArray(),
            'serviceIds' => $scope->getServices()->map(fn(Service $s) => $s->getId())->toArray(),
        ]);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * Indexe tous les Personnel par matricule, avec leur Centre/Agency/Service
     * préchargés en une seule requête (évite le N+1 dans list()).
     *
     * @return array<string, Personnel>
     */
    private function indexPersonnelByMatricule(): array
    {
        $personnelList = $this->em->getRepository(Personnel::class)->createQueryBuilder('p')
            ->addSelect('c', 'a', 's')
            ->leftJoin('p.centre', 'c')
            ->leftJoin('c.agency', 'a')
            ->leftJoin('c.service', 's')
            ->getQuery()
            ->getResult();

        $map = [];
        foreach ($personnelList as $p) {
            /** @var Personnel $p */
            $map[$p->getMatricule()] = $p;
        }

        return $map;
    }

    /**
     * Agence/service par défaut de l'utilisateur, dérivés de son Personnel → Centre.
     */
    private function serializeDefaultScope(?Personnel $personnel): array
    {
        $centre = $personnel?->getCentre();

        return [
            'defaultAgency' => $centre?->getAgency() ? [
                'id'   => $centre->getAgency()->getId(),
                'name' => $centre->getAgency()->getName(),
                'code' => $centre->getAgency()->getCode(),
            ] : null,
            'defaultService' => $centre?->getService() ? [
                'id'   => $centre->getService()->getId(),
                'name' => $centre->getService()->getName(),
                'code' => $centre->getService()->getCode(),
            ] : null,
        ];
    }
}
