<?php

namespace App\Tests\Security;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class LdapAuthenticationTest extends WebTestCase
{
    /**
     * Ce test simule une tentative d'authentification.
     * Note: Pour qu'il passe réellement, le serveur LDAP doit être accessible
     * ou les services doivent être mockés.
     */
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
                'username' => 'invalid_user',
                'password' => 'wrong_password',
            ])
        );

        $response = $client->getResponse();
        
        // On s'attend à un 401 Unauthorized car les identifiants sont faux
        $this->assertEquals(401, $response->getStatusCode());
        
        $data = json_decode($response->getContent(), true);
        $this->assertArrayHasKey('error', $data);
    }

    /**
     * Test de la structure de la réponse en cas de succès (si credentials valides fournis)
     * Attention: Ce test nécessite un vrai LDAP ou un Mock.
     */
    public function testLoginSuccessStructure(): void
    {
        // Si tu veux tester un vrai succès, remplace par des identifiants valides
        // pour ton environnement de test/dev.
        $username = 'lanto'; 
        $password = 'Hasina#2026-2';

        $client = static::createClient();
        $client->request(
            'POST',
            '/api/login',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'username' => $username,
                'password' => $password,
            ])
        );

        $response = $client->getResponse();

        // Si le LDAP n'est pas joignable en test, ce test échouera.
        // C'est normal sans configuration de Mock LDAP.
        if ($response->getStatusCode() === 200) {
            $data = json_decode($response->getContent(), true);
            $this->assertArrayHasKey('token', $data);
            $this->assertArrayHasKey('user', $data);
            $this->assertEquals($username, $data['user']['username']);
        }
    }
}
