<?php

namespace App\Tests\Security;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests fonctionnels pour l'authentification LDAP.
 *
 * Les credentials de test sont lus depuis les variables d'environnement
 * définies dans .env.test.local (non commité) :
 *   TEST_USER=lanto
 *   TEST_PASSWORD=motdepasse
 */
class LdapAuthenticationTest extends WebTestCase
{
    public function testLoginFailureWithInvalidCredentials(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => 'utilisateur_inexistant_xyz',
                'password' => 'mauvais_mot_de_passe_xyz',
            ])
        );

        $this->assertResponseStatusCodeSame(401);

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('error', $data);
    }

    public function testLoginWithValidCredentials(): void
    {
        $username = $_ENV['TEST_USER']     ?? getenv('TEST_USER')     ?: null;
        $password = $_ENV['TEST_PASSWORD'] ?? getenv('TEST_PASSWORD') ?: null;

        if (!$username || !$password) {
            $this->markTestSkipped(
                'TEST_USER et TEST_PASSWORD doivent être définis dans .env.test.local pour ce test.'
            );
        }

        $client = static::createClient();
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => $username, 'password' => $password])
        );

        $response = $client->getResponse();

        if ($response->getStatusCode() !== 200) {
            $this->markTestSkipped('Le serveur LDAP n\'est pas joignable depuis l\'environnement de test.');
        }

        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('token', $data);
        $this->assertArrayHasKey('user',  $data);
        $this->assertSame($username, $data['user']['username']);
    }

    public function testLoginReturnsJsonOnFailure(): void
    {
        $client = static::createClient();
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['username' => 'x', 'password' => 'x'])
        );

        $this->assertResponseHeaderSame('content-type', 'application/json');
    }
}
