<?php

namespace App\It\Controller;

use App\It\Entity\Tache;
use App\It\Repository\TacheRepository;
use App\Security\Entity\Personnel;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Lecture via l'ORM (mappé sqlserver), écriture via DBAL direct : le driver
 * SQL Server custom ne convertit pas correctement un DateTime lié en paramètre
 * via l'ORM (même limitation contournée dans AuditService/NotificationService).
 */
#[Route('/api/it/taches')]
class TacheController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Connection             $conn,
        private readonly TacheRepository        $tacheRepo,
    ) {}

    #[Route('', methods: ['GET'])]
    public function list(): JsonResponse
    {
        return $this->json(array_map(
            fn(Tache $t) => $this->serialize($t),
            $this->tacheRepo->findAllOrdered(),
        ));
    }

    #[Route('', methods: ['POST'])]
    public function create(Request $request): JsonResponse
    {
        [$error, $row] = $this->validate($request);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        // Séparateur 'T' obligatoire : ce serveur SQL Server interprète
        // 'YYYY-MM-DD HH:MI:SS' (avec espace) en inversant jour/mois.
        $row['created_at'] = (new \DateTime())->format('Y-m-d\TH:i:s');
        $this->conn->insert('it_tache', $row);
        $id = (int) $this->conn->lastInsertId();

        return $this->json($this->serialize($this->tacheRepo->find($id)), Response::HTTP_CREATED);
    }

    #[Route('/{id}', methods: ['PUT'])]
    public function update(int $id, Request $request): JsonResponse
    {
        if (!$this->tacheRepo->find($id)) {
            return $this->json(['error' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        [$error, $row] = $this->validate($request);
        if ($error) {
            return $this->json(['error' => $error], Response::HTTP_BAD_REQUEST);
        }

        $this->conn->update('it_tache', $row, ['id' => $id]);
        $this->em->clear();

        return $this->json($this->serialize($this->tacheRepo->find($id)));
    }

    /**
     * Bascule l'état terminé / à faire.
     */
    #[Route('/{id}/toggle', methods: ['POST'])]
    public function toggle(int $id): JsonResponse
    {
        $tache = $this->tacheRepo->find($id);
        if (!$tache) {
            return $this->json(['error' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->conn->update('it_tache', ['termine' => !$tache->isTermine() ? 1 : 0], ['id' => $id]);
        $this->em->clear();

        return $this->json($this->serialize($this->tacheRepo->find($id)));
    }

    #[Route('/{id}', methods: ['DELETE'])]
    public function delete(int $id): JsonResponse
    {
        if (!$this->tacheRepo->find($id)) {
            return $this->json(['error' => 'Tâche introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $this->conn->delete('it_tache', ['id' => $id]);

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * @return array{0: string|null, 1: array<string, mixed>}
     */
    private function validate(Request $request): array
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $titre         = trim((string) ($data['titre'] ?? ''));
        $dateTache     = trim((string) ($data['dateTache'] ?? ''));
        $intervenantId = isset($data['intervenantId']) ? (int) $data['intervenantId'] : null;
        $ticketRef     = trim((string) ($data['ticketRef'] ?? ''));

        if ($titre === '' || $dateTache === '' || !$intervenantId) {
            return ['Les champs titre, date et intervenant sont obligatoires.', []];
        }

        // Format explicite avec heure à zéro : createFromFormat('Y-m-d', ...) sans
        // heure complète l'heure courante au lieu de minuit (piège classique PHP).
        $date = \DateTime::createFromFormat('Y-m-d H:i:s', $dateTache . ' 00:00:00');
        if (!$date) {
            return ['Date invalide (format attendu AAAA-MM-JJ).', []];
        }

        $intervenant = $this->em->getRepository(Personnel::class)->find($intervenantId);
        if (!$intervenant) {
            return ["Intervenant introuvable (id=$intervenantId).", []];
        }

        return [null, [
            'titre'          => $titre,
            // Séparateur 'T' obligatoire, voir commentaire sur created_at plus bas.
            'date_tache'     => $date->format('Y-m-d\TH:i:s'),
            'intervenant_id' => $intervenantId,
            'ticket_ref'     => $ticketRef !== '' ? $ticketRef : null,
        ]];
    }

    private function serialize(Tache $t): array
    {
        return [
            'id'         => $t->getId(),
            'titre'      => $t->getTitre(),
            'dateTache'  => $t->getDateTache()->format('Y-m-d'),
            'ticketRef'  => $t->getTicketRef(),
            'termine'    => $t->isTermine(),
            'createdAt'  => $t->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'intervenant' => $t->getIntervenant() ? [
                'id'      => $t->getIntervenant()->getId(),
                'nom'     => $t->getIntervenant()->getNom(),
                'prenoms' => $t->getIntervenant()->getPrenoms(),
            ] : null,
        ];
    }
}
