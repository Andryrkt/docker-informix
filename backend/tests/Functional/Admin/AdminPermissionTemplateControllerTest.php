<?php

namespace App\Tests\Functional\Admin;

use App\Security\Entity\User;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests fonctionnels pour AdminPermissionTemplateController.
 * Route de base : /api/admin/permission-templates
 *
 * Prérequis : APP_ENV=test, base SQL Server accessible, fixtures chargées.
 */
class AdminPermissionTemplateControllerTest extends WebTestCase
{
    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Crée un client HTTP authentifié.
     * Doit être appelé UNE SEULE FOIS par test (contrainte WebTestCase Symfony).
     */
    private function makeClient(string $username = 'lanto'): KernelBrowser
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
        $client->setServerParameter('CONTENT_TYPE', 'application/json');

        return $client;
    }

    /** Décode la réponse JSON du client. */
    private function json(KernelBrowser $client): array
    {
        return json_decode($client->getResponse()->getContent(), true) ?? [];
    }

    /**
     * Supprime un modèle via le client existant (même kernel, pas de re-boot).
     */
    private function deleteTemplate(KernelBrowser $client, int $id): void
    {
        $client->request('DELETE', "/api/admin/permission-templates/$id");
    }

    // ── GET /api/admin/permission-templates ──────────────────────────────────

    public function testListReturnsJsonArray(): void
    {
        $client = $this->makeClient();
        $client->request('GET', '/api/admin/permission-templates');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/json');
        $this->assertIsArray($this->json($client));
    }

    public function testListRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/admin/permission-templates');

        $this->assertResponseStatusCodeSame(401);
    }

    // ── POST /api/admin/permission-templates ─────────────────────────────────

    public function testCreateTemplate(): void
    {
        $client = $this->makeClient();
        $name   = 'Test modèle ' . uniqid();

        $client->request('POST', '/api/admin/permission-templates', [], [], [], json_encode([
            'name'        => $name,
            'description' => 'Créé par test fonctionnel',
            'items'       => [],
        ]));

        $this->assertResponseStatusCodeSame(201);
        $data = $this->json($client);

        $this->assertArrayHasKey('id', $data);
        $this->assertSame($name, $data['name']);
        $this->assertSame('Créé par test fonctionnel', $data['description']);
        $this->assertIsArray($data['items']);
        $this->assertEmpty($data['items']);

        $this->deleteTemplate($client, $data['id']);
    }

    public function testCreateTemplateFailsWithoutName(): void
    {
        $client = $this->makeClient();

        $client->request('POST', '/api/admin/permission-templates', [], [], [], json_encode([
            'description' => 'Sans nom',
            'items'       => [],
        ]));

        $this->assertResponseStatusCodeSame(400);
        $this->assertArrayHasKey('error', $this->json($client));
    }

    public function testCreateTemplateFailsWithDuplicateName(): void
    {
        $client = $this->makeClient();
        $name   = 'Doublon ' . uniqid();

        // Première création
        $client->request('POST', '/api/admin/permission-templates', [], [], [], json_encode([
            'name' => $name, 'items' => [],
        ]));
        $this->assertResponseStatusCodeSame(201);
        $id = $this->json($client)['id'];

        // Deuxième création avec le même nom → 400
        $client->request('POST', '/api/admin/permission-templates', [], [], [], json_encode([
            'name' => $name, 'items' => [],
        ]));
        $this->assertResponseStatusCodeSame(400);

        $this->deleteTemplate($client, $id);
    }

    // ── GET /api/admin/permission-templates/{id} ─────────────────────────────

    public function testShowReturnsTemplate(): void
    {
        $client = $this->makeClient();
        $name   = 'Show test ' . uniqid();

        $client->request('POST', '/api/admin/permission-templates', [], [], [], json_encode([
            'name' => $name, 'items' => [],
        ]));
        $id = $this->json($client)['id'];

        $client->request('GET', "/api/admin/permission-templates/$id");
        $this->assertResponseIsSuccessful();

        $data = $this->json($client);
        $this->assertSame($id, $data['id']);
        $this->assertSame($name, $data['name']);

        $this->deleteTemplate($client, $id);
    }

    public function testShowReturns404ForUnknownId(): void
    {
        $client = $this->makeClient();
        $client->request('GET', '/api/admin/permission-templates/999999');
        $this->assertResponseStatusCodeSame(404);
    }

    // ── PUT /api/admin/permission-templates/{id} ─────────────────────────────

    public function testUpdateTemplate(): void
    {
        $client  = $this->makeClient();
        $nameOld = 'Avant màj ' . uniqid();
        $nameNew = 'Après màj ' . uniqid();

        $client->request('POST', '/api/admin/permission-templates', [], [], [], json_encode([
            'name' => $nameOld, 'items' => [],
        ]));
        $id = $this->json($client)['id'];

        $client->request('PUT', "/api/admin/permission-templates/$id", [], [], [], json_encode([
            'name'        => $nameNew,
            'description' => 'Description mise à jour',
            'items'       => [],
        ]));
        $this->assertResponseIsSuccessful();

        $data = $this->json($client);
        $this->assertSame($nameNew, $data['name']);
        $this->assertSame('Description mise à jour', $data['description']);

        $this->deleteTemplate($client, $id);
    }

    // ── DELETE /api/admin/permission-templates/{id} ──────────────────────────

    public function testDeleteTemplate(): void
    {
        $client = $this->makeClient();

        $client->request('POST', '/api/admin/permission-templates', [], [], [], json_encode([
            'name' => 'À supprimer ' . uniqid(), 'items' => [],
        ]));
        $id = $this->json($client)['id'];

        $client->request('DELETE', "/api/admin/permission-templates/$id");
        $this->assertResponseStatusCodeSame(204);

        $client->request('GET', "/api/admin/permission-templates/$id");
        $this->assertResponseStatusCodeSame(404);
    }
}
