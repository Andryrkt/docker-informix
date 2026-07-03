<?php

namespace App\Tests\Functional\Tik;

use App\Security\AppAction;
use App\Security\Entity\Company;
use App\Security\Entity\User;
use App\Tik\Entity\TikCategorie;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests fonctionnels pour le workflow TIK (support informatique).
 * Route de base : /api/tik/tickets
 *
 * Prérequis : APP_ENV=test, base SQL Server accessible, fixtures chargées
 * (utilisateur "lanto", société "HFF", au moins une TikCategorie, un
 * Personnel dont le matricule correspond à lanto).
 */
class TikControllerTest extends WebTestCase
{
    private const USERNAME = 'lanto';
    private const COMPANY_CODE = 'HFF';

    /** @var int[] identifiants de tickets créés pendant les tests, nettoyés en tearDown */
    private array $createdTicketIds = [];

    /** @var int[] identifiants de permissions créées pendant les tests, nettoyées en tearDown */
    private array $createdPermissionIds = [];

    protected function tearDown(): void
    {
        if ($this->createdTicketIds || $this->createdPermissionIds) {
            $em = static::getContainer()->get('doctrine')->getManager('sqlserver');
            $conn = $em->getConnection();

            foreach ($this->createdTicketIds as $id) {
                $conn->executeStatement('DELETE FROM tik_historique WHERE tik_id = ?', [$id]);
                $conn->executeStatement('DELETE FROM tik_ticket WHERE id = ?', [$id]);
            }
            foreach ($this->createdPermissionIds as $id) {
                $conn->executeStatement('DELETE FROM app_user_permission WHERE id = ?', [$id]);
            }
        }

        parent::tearDown();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function makeClient(string $username = self::USERNAME): KernelBrowser
    {
        $client    = static::createClient();
        $container = static::getContainer();
        $em        = $container->get('doctrine')->getManager('sqlserver');

        $user = $em->getRepository(User::class)->findOneBy(['username' => $username]);
        if (!$user) {
            $this->markTestSkipped("Utilisateur '$username' introuvable — fixtures non chargées.");
        }

        $jwt = $container->get('lexik_jwt_authentication.jwt_manager')->create($user);
        $client->setServerParameter('HTTP_AUTHORIZATION', 'Bearer ' . $jwt);

        return $client;
    }

    /**
     * Les endpoints d'action (valider/refuser/planifier/...) lisent un corps
     * JSON brut — contrairement à create() qui lit des champs de formulaire
     * (multipart, pour les pièces jointes).
     */
    private function postJson(KernelBrowser $client, string $uri, array $payload = []): void
    {
        $client->request('POST', $uri, [], [], ['CONTENT_TYPE' => 'application/json'], json_encode($payload));
    }

    private function json(KernelBrowser $client): array
    {
        return json_decode($client->getResponse()->getContent(), true) ?? [];
    }

    private function getCompanyId(EntityManagerInterface $em): int
    {
        $company = $em->getRepository(Company::class)->findOneBy(['code' => self::COMPANY_CODE]);
        if (!$company) {
            $this->markTestSkipped('Société ' . self::COMPANY_CODE . ' introuvable en base de test.');
        }

        return $company->getId();
    }

    private function getFirstCategorieId(EntityManagerInterface $em): int
    {
        $categorie = $em->getRepository(TikCategorie::class)->findOneBy([]);
        if (!$categorie) {
            $this->markTestSkipped('Aucune TikCategorie en base — exécuter sql/create_tik_tables.sql.');
        }

        return $categorie->getId();
    }

    private function getAgencyAndServiceIds(EntityManagerInterface $em): array
    {
        $agency  = $em->getConnection()->fetchAssociative('SELECT TOP 1 id FROM app_agency');
        $service = $em->getConnection()->fetchAssociative('SELECT TOP 1 id FROM app_service');
        if (!$agency || !$service) {
            $this->markTestSkipped('Aucune agence/service en base de test.');
        }

        return [(int) $agency['id'], (int) $service['id']];
    }

    /**
     * Crée (ou réutilise) le module TIK et accorde les actions données à
     * l'utilisateur, pour la société de test. Retourne l'id de permission créé
     * (null si l'utilisateur avait déjà toutes les actions).
     */
    private function grantTikActions(EntityManagerInterface $em, User $user, int $companyId, array $actions): ?int
    {
        $conn = $em->getConnection();
        $tikModuleId = $conn->fetchOne("SELECT id FROM app_module WHERE slug = 'tik'");
        if (!$tikModuleId) {
            $this->markTestSkipped("Module 'tik' introuvable — exécuter le script de seed du module.");
        }

        $conn->insert('app_user_permission', [
            'userId'       => $user->getId(),
            'resourceType' => 'module',
            'resourceId'   => $tikModuleId,
            'companyId'    => $companyId,
            'actions'      => json_encode($actions),
            'scopeAll'     => 1,
            'agencyScopes' => json_encode([]),
        ]);

        $id = (int) $conn->lastInsertId();
        $this->createdPermissionIds[] = $id;

        return $id;
    }

    private function createTicket(KernelBrowser $client, EntityManagerInterface $em, array $overrides = []): array
    {
        [$agencyId, $serviceId] = $this->getAgencyAndServiceIds($em);

        $payload = array_merge([
            'objetDemande'      => 'Test PHPUnit ' . uniqid(),
            'detailDemande'     => 'Détail créé par le test fonctionnel.',
            'categorieId'       => $this->getFirstCategorieId($em),
            'agenceDebiteurId'  => $agencyId,
            'serviceDebiteurId' => $serviceId,
        ], $overrides);

        $client->request('POST', '/api/tik/tickets', $payload);
        $data = $this->json($client);

        if (($data['id'] ?? null)) {
            $this->createdTicketIds[] = $data['id'];
        }

        return $data;
    }

    // ── GET /api/tik/categories ──────────────────────────────────────────────

    public function testCategoriesTreeReturnsArray(): void
    {
        $client = $this->makeClient();
        $client->request('GET', '/api/tik/categories');

        $this->assertResponseIsSuccessful();
        $data = $this->json($client);
        $this->assertIsArray($data);

        if (!empty($data)) {
            $this->assertArrayHasKey('id', $data[0]);
            $this->assertArrayHasKey('description', $data[0]);
            $this->assertArrayHasKey('sousCategories', $data[0]);
        }
    }

    // ── GET /api/tik/tickets/defaults ────────────────────────────────────────

    public function testDefaultsReturnsExpectedShape(): void
    {
        $client = $this->makeClient();
        $client->request('GET', '/api/tik/tickets/defaults');

        $this->assertResponseIsSuccessful();
        $data = $this->json($client);

        $this->assertArrayHasKey('agenceEmetteur', $data);
        $this->assertArrayHasKey('serviceEmetteur', $data);
        $this->assertArrayHasKey('codeSociete', $data);
        $this->assertArrayHasKey('dateFinSouhaiteeDefaut', $data);
        $this->assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}$/', $data['dateFinSouhaiteeDefaut']);
    }

    // ── POST /api/tik/tickets (création) ─────────────────────────────────────

    public function testListRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/tik/tickets');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testCreateTicketFailsWithoutRequiredFields(): void
    {
        $client = $this->makeClient();
        $client->request('POST', '/api/tik/tickets', ['objetDemande' => 'Objet seul']);

        $this->assertResponseStatusCodeSame(400);
        $this->assertArrayHasKey('error', $this->json($client));
    }

    public function testCreateTicketSucceeds(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');

        $data = $this->createTicket($client, $em);

        $this->assertResponseStatusCodeSame(201);
        $this->assertMatchesRegularExpression('/^TIK\d{8}$/', $data['numeroTicket']);
        $this->assertSame('OUVERT', $data['statut']);
        $this->assertNull($data['intervenant']);
        $this->assertNull($data['validateur']);
        $this->assertArrayHasKey('actions', $data);
        $this->assertFalse($data['actions']['peutPlanifier'], 'Un ticket OUVERT sans intervenant ne peut pas être planifié');
    }

    public function testDetailReturns404ForUnknownTicket(): void
    {
        $client = $this->makeClient();
        $client->request('GET', '/api/tik/tickets/999999999');
        $this->assertResponseStatusCodeSame(404);
    }

    // ── Workflow : permissions ────────────────────────────────────────────────

    public function testValiderIsForbiddenWithoutValidatePermission(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');

        $ticket = $this->createTicket($client, $em);

        // Sans header X-Active-Company-ID ni permission "validate" accordée.
        $this->postJson($client, "/api/tik/tickets/{$ticket['id']}/valider", ['intervenantId' => 1]);

        $this->assertResponseStatusCodeSame(403);
    }

    public function testRefuserRequiresComment(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');
        $user   = $em->getRepository(User::class)->findOneBy(['username' => self::USERNAME]);
        $companyId = $this->getCompanyId($em);

        $this->grantTikActions($em, $user, $companyId, [AppAction::VALIDATE]);
        $ticket = $this->createTicket($client, $em);

        $client->setServerParameter('HTTP_X_ACTIVE_COMPANY_ID', (string) $companyId);
        $this->postJson($client, "/api/tik/tickets/{$ticket['id']}/refuser", []);

        $this->assertResponseStatusCodeSame(400);
        $this->assertArrayHasKey('error', $this->json($client));
    }

    public function testRefuserSucceedsWithComment(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');
        $user   = $em->getRepository(User::class)->findOneBy(['username' => self::USERNAME]);
        $companyId = $this->getCompanyId($em);

        $this->grantTikActions($em, $user, $companyId, [AppAction::VALIDATE]);
        $ticket = $this->createTicket($client, $em);

        $client->setServerParameter('HTTP_X_ACTIVE_COMPANY_ID', (string) $companyId);
        $this->postJson($client, "/api/tik/tickets/{$ticket['id']}/refuser", ['commentaire' => 'Hors périmètre']);

        $this->assertResponseIsSuccessful();
        $data = $this->json($client);
        $this->assertSame('REFUSE', $data['statut']);
    }

    /**
     * Cycle complet : valider → planifier → résoudre → clôturer, en vérifiant
     * à chaque étape le statut et les indicateurs d'action calculés côté serveur.
     */
    public function testFullWorkflowValiderPlanifierResoudreCloturer(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');
        $user   = $em->getRepository(User::class)->findOneBy(['username' => self::USERNAME]);
        $companyId = $this->getCompanyId($em);

        // Personnel rattaché à lanto (même matricule) — nécessaire pour agir
        // comme intervenant assigné.
        if (!$user->getMatricule()) {
            $this->markTestSkipped("L'utilisateur lanto n'a pas de matricule renseigné.");
        }
        $personnel = $em->getConnection()->fetchAssociative(
            'SELECT id FROM app_personnel WHERE matricule = ?',
            [$user->getMatricule()],
        );
        if (!$personnel) {
            $this->markTestSkipped('Aucune fiche Personnel pour le matricule de lanto.');
        }
        $intervenantId = (int) $personnel['id'];

        $this->grantTikActions($em, $user, $companyId, [AppAction::VALIDATE]);
        $client->setServerParameter('HTTP_X_ACTIVE_COMPANY_ID', (string) $companyId);

        $ticket = $this->createTicket($client, $em);
        $id = $ticket['id'];

        // 1. Valider — assigne l'intervenant, passe en EN_COURS.
        $this->postJson($client, "/api/tik/tickets/$id/valider", ['intervenantId' => $intervenantId]);
        $this->assertResponseIsSuccessful();
        $data = $this->json($client);
        $this->assertSame('EN_COURS', $data['statut']);
        $this->assertSame($intervenantId, $data['intervenant']['id']);
        $this->assertTrue($data['actions']['peutPlanifier']);
        $this->assertTrue($data['actions']['peutResoudre']);

        // 2. Planifier — passe en PLANIFIE.
        $this->postJson($client, "/api/tik/tickets/$id/planifier", [
            'dateDebutPlanning' => '2026-08-10T08:00:00',
            'dateFinPlanning'   => '2026-08-10T10:00:00',
        ]);
        $this->assertResponseIsSuccessful();
        $this->assertSame('PLANIFIE', $this->json($client)['statut']);

        // 3. Résoudre — passe en RESOLU, ouvre clôture/réouverture.
        $this->postJson($client, "/api/tik/tickets/$id/resoudre", ['commentaire' => 'Corrigé']);
        $this->assertResponseIsSuccessful();
        $data = $this->json($client);
        $this->assertSame('RESOLU', $data['statut']);
        $this->assertTrue($data['actions']['peutCloturer']);
        $this->assertTrue($data['actions']['peutReouvrir']);
        $this->assertFalse($data['actions']['peutResoudre']);

        // 4. Clôturer — statut terminal, plus aucune action.
        $this->postJson($client, "/api/tik/tickets/$id/cloturer", ['commentaire' => 'Confirmé']);
        $this->assertResponseIsSuccessful();
        $data = $this->json($client);
        $this->assertSame('CLOTURE', $data['statut']);
        $this->assertFalse($data['actions']['peutCloturer']);
        $this->assertFalse($data['actions']['peutReouvrir']);

        // 5. Historique : une ligne par transition (OUVERT, EN_COURS, PLANIFIE, RESOLU, CLOTURE).
        $client->request('GET', "/api/tik/tickets/$id/historique");
        $this->assertResponseIsSuccessful();
        $historique = $this->json($client);
        $this->assertCount(5, $historique);
        $this->assertSame(
            ['OUVERT', 'EN_COURS', 'PLANIFIE', 'RESOLU', 'CLOTURE'],
            array_column($historique, 'statut'),
        );
    }

    public function testReouvrirThenReplanifierCycle(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');
        $user   = $em->getRepository(User::class)->findOneBy(['username' => self::USERNAME]);
        $companyId = $this->getCompanyId($em);

        if (!$user->getMatricule()) {
            $this->markTestSkipped("L'utilisateur lanto n'a pas de matricule renseigné.");
        }
        $personnel = $em->getConnection()->fetchAssociative(
            'SELECT id FROM app_personnel WHERE matricule = ?',
            [$user->getMatricule()],
        );
        if (!$personnel) {
            $this->markTestSkipped('Aucune fiche Personnel pour le matricule de lanto.');
        }
        $intervenantId = (int) $personnel['id'];

        $this->grantTikActions($em, $user, $companyId, [AppAction::VALIDATE]);
        $client->setServerParameter('HTTP_X_ACTIVE_COMPANY_ID', (string) $companyId);

        $ticket = $this->createTicket($client, $em);
        $id = $ticket['id'];

        $this->postJson($client, "/api/tik/tickets/$id/valider", ['intervenantId' => $intervenantId]);
        $this->assertResponseIsSuccessful();
        $this->postJson($client, "/api/tik/tickets/$id/resoudre", []);
        $this->assertResponseIsSuccessful();
        $this->assertSame('RESOLU', $this->json($client)['statut']);

        // Le demandeur (lanto) conteste la résolution.
        $this->postJson($client, "/api/tik/tickets/$id/reouvrir", ['commentaire' => 'Toujours en panne']);
        $this->assertResponseIsSuccessful();
        $data = $this->json($client);
        $this->assertSame('REOUVERT', $data['statut']);
        $this->assertTrue($data['actions']['peutPlanifier'], 'Un ticket réouvert doit pouvoir être re-planifié');

        // Cycle : re-planifier puis re-résoudre.
        $this->postJson($client, "/api/tik/tickets/$id/planifier", [
            'dateDebutPlanning' => '2026-08-11T08:00:00',
            'dateFinPlanning'   => '2026-08-11T09:00:00',
        ]);
        $this->assertResponseIsSuccessful();
        $this->postJson($client, "/api/tik/tickets/$id/resoudre", ['commentaire' => 'Corrigé cette fois']);
        $this->assertResponseIsSuccessful();
        $this->assertSame('RESOLU', $this->json($client)['statut']);
    }

    public function testCloturerFailsWhenNotResolu(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');
        $user   = $em->getRepository(User::class)->findOneBy(['username' => self::USERNAME]);
        $companyId = $this->getCompanyId($em);

        $this->grantTikActions($em, $user, $companyId, [AppAction::VALIDATE]);
        $client->setServerParameter('HTTP_X_ACTIVE_COMPANY_ID', (string) $companyId);

        $ticket = $this->createTicket($client, $em);

        // Ticket encore OUVERT : la clôture doit être refusée.
        $this->postJson($client, "/api/tik/tickets/{$ticket['id']}/cloturer", []);
        $this->assertResponseStatusCodeSame(409);
    }

    public function testIntervenantsDisponiblesReflectsInterveneAction(): void
    {
        $client = $this->makeClient();
        $em     = static::getContainer()->get('doctrine')->getManager('sqlserver');
        $user   = $em->getRepository(User::class)->findOneBy(['username' => self::USERNAME]);
        $companyId = $this->getCompanyId($em);

        $client->setServerParameter('HTTP_X_ACTIVE_COMPANY_ID', (string) $companyId);
        $client->request('GET', '/api/tik/tickets/intervenants');
        $this->assertResponseIsSuccessful();
        $before = $this->json($client);

        $this->grantTikActions($em, $user, $companyId, [AppAction::INTERVENE]);

        $client->request('GET', '/api/tik/tickets/intervenants');
        $this->assertResponseIsSuccessful();
        $after = $this->json($client);

        $this->assertGreaterThan(count($before), count($after), "L'octroi de la permission 'intervene' doit ajouter au moins un intervenant éligible");
    }
}
