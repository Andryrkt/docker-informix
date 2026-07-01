<?php

namespace App\Security\Controller\Admin;

use App\Security\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
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
        $users = $this->em->getRepository(User::class)->findBy([], ['displayName' => 'ASC']);

        return $this->json(array_map(fn(User $u) => [
            'id'          => $u->getId(),
            'username'    => $u->getUserIdentifier(),
            'displayName' => $u->getDisplayName(),
            'email'       => $u->getEmail(),
            'department'  => $u->getDepartment(),
            'roles'       => $u->getRoles(),
            'lastLoginAt' => $u->getLastLoginAt()?->format('d/m/Y H:i'),
        ], $users));
    }
}
