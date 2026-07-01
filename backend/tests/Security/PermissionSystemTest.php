<?php

namespace App\Tests\Security;

use App\Security\AppAction;
use App\Security\Entity\Company;
use App\Security\Entity\User;
use App\Security\Entity\UserPermission;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Http\Authenticator\Token\PostAuthenticationToken;

class PermissionSystemTest extends WebTestCase
{
    /**
     * Récupère l'utilisateur lanto depuis la base de test.
     * Marque le test skipped si les fixtures ne sont pas chargées.
     */
    private function getTestUser(string $username = 'lanto'): User
    {
        $em   = static::getContainer()->get('doctrine')->getManager('sqlserver');
        $user = $em->getRepository(User::class)->findOneBy(['username' => $username]);

        if (!$user) {
            $this->markTestSkipped("Utilisateur '$username' introuvable — fixtures non chargées.");
        }

        return $user;
    }

    /**
     * Test 1: Vérifie que l'API /api/me retourne les bonnes infos (sociétés et scope)
     */
    public function testGetMeWithPermissions(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();
        $user      = $this->getTestUser();

        $token = $container->get('lexik_jwt_authentication.jwt_manager')->create($user);
        $client->request('GET', '/api/me', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('companies', $data);
        $this->assertArrayHasKey('scope', $data);
    }

    /**
     * Test 2: Vérifie que AppActionVoter fonctionne pour une permission réelle de l'utilisateur.
     *
     * Le test récupère la première UserPermission existante de lanto pour HFF,
     * puis vérifie que le voter accorde ou refuse correctement l'accès.
     */
    public function testActionPermissions(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();
        $em        = $container->get('doctrine')->getManager('sqlserver');

        $user    = $this->getTestUser();
        $company = $em->getRepository(Company::class)->findOneBy(['code' => 'HFF']);

        if (!$company) {
            $this->markTestSkipped('Société HFF introuvable en base de test.');
        }

        // Récupérer une permission réelle de lanto pour HFF
        $permission = $em->getRepository(UserPermission::class)->findOneBy([
            'user'    => $user,
            'company' => $company,
        ]);

        if (!$permission) {
            $this->markTestSkipped('Aucune permission trouvée pour lanto@HFF — fixtures non chargées.');
        }

        // Préparer le contexte sécurité
        $security     = $container->get('security.authorization_checker');
        $tokenStorage = $container->get('security.token_storage');
        $requestStack = $container->get('request_stack');

        $request = new Request();
        $request->headers->set('X-Active-Company-ID', (string) $company->getId());
        $requestStack->push($request);

        $token = new PostAuthenticationToken($user, 'main', $user->getRoles());
        $tokenStorage->setToken($token);

        // Tester une action que lanto a réellement
        $firstAction = $permission->getActions()[0] ?? null;
        if (!$firstAction) {
            $this->markTestSkipped('La permission trouvée n\'a aucune action.');
        }

        // Passer la ressource directement (évite la dépendance au slug)
        $resourceType = $permission->getResourceType();
        $resourceId   = $permission->getResourceId();

        $repoClass = $resourceType === 'module'
            ? \App\Security\Entity\AppModule::class
            : \App\Security\Entity\AppMenu::class;

        $resource = $em->getRepository($repoClass)->find($resourceId);

        if (!$resource) {
            $this->markTestSkipped("Ressource $resourceType#$resourceId introuvable.");
        }

        $this->assertTrue(
            $security->isGranted($firstAction, $resource),
            "lanto devrait avoir l'action '$firstAction' sur $resourceType#$resourceId"
        );

        // Vérifier qu'une action inexistante est refusée
        $this->assertFalse(
            $security->isGranted('action_inexistante_xyz', $resource),
            'Une action fictive ne doit jamais être accordée'
        );
    }

    /**
     * Test 3: Vérifie que le filtre Doctrine (UserScopeFilter) est déclaré.
     */
    public function testDoctrineFilterIsApplied(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();
        $em        = $container->get('doctrine')->getManager('sqlserver');

        $user    = $this->getTestUser();
        $company = $em->getRepository(Company::class)->findOneBy(['code' => 'HFF']);

        if (!$company) {
            $this->markTestSkipped('Société HFF introuvable.');
        }

        $jwt = $container->get('lexik_jwt_authentication.jwt_manager')->create($user);
        $client->request('GET', '/api/me', [], [], [
            'HTTP_AUTHORIZATION'      => 'Bearer ' . $jwt,
            'HTTP_X_ACTIVE_COMPANY_ID' => $company->getId(),
        ]);

        // Vérifier que le filtre user_scope est enregistré dans Doctrine
        $ipsEm  = $container->get('doctrine')->getManager('ips');
        $this->assertTrue(
            $ipsEm->getFilters()->has('user_scope'),
            'Le filtre user_scope doit être déclaré dans Doctrine'
        );
    }

    /**
     * Test 4: Vérifie que la navigation échoue sans société active.
     */
    public function testNavigationRequiresActiveCompany(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();
        $user      = $this->getTestUser();

        $token = $container->get('lexik_jwt_authentication.jwt_manager')->create($user);
        $client->request('GET', '/api/navigation', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);

        $this->assertResponseStatusCodeSame(400);
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertStringContainsString('soci', strtolower($data['error']));
    }

    /**
     * Test 5: Vérifie que la navigation retourne la structure attendue.
     *
     * Structure actuelle du NavigationController :
     *   { societes: [...], modules: [...], data_scope: {...} }
     * Chaque module : { id, nom, menu: [{id, nom, route, actions, scope, sous-menu}] }
     */
    public function testNavigationReturnsMenuTree(): void
    {
        $client    = static::createClient();
        $container = static::getContainer();
        $em        = $container->get('doctrine')->getManager('sqlserver');

        $user    = $this->getTestUser();
        $company = $em->getRepository(Company::class)->findOneBy(['code' => 'HFF']);

        if (!$company) {
            $this->markTestSkipped('Société HFF introuvable.');
        }

        $token = $container->get('lexik_jwt_authentication.jwt_manager')->create($user);
        $client->request('GET', '/api/navigation', [], [], [
            'HTTP_AUTHORIZATION'      => 'Bearer ' . $token,
            'HTTP_X_ACTIVE_COMPANY_ID' => $company->getId(),
        ]);

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);

        // Clés de premier niveau
        $this->assertArrayHasKey('societes',    $data, 'La réponse doit contenir "societes"');
        $this->assertArrayHasKey('modules',     $data, 'La réponse doit contenir "modules"');
        $this->assertArrayHasKey('data_scope',  $data, 'La réponse doit contenir "data_scope"');

        // Si lanto a au moins un module visible
        if (!empty($data['modules'])) {
            $module = $data['modules'][0];
            $this->assertArrayHasKey('id',   $module);
            $this->assertArrayHasKey('nom',  $module);
            $this->assertArrayHasKey('menu', $module, 'Chaque module doit avoir une clé "menu"');

            // Si ce module contient des menus
            if (!empty($module['menu'])) {
                $menu = $module['menu'][0];
                $this->assertArrayHasKey('id',       $menu);
                $this->assertArrayHasKey('nom',      $menu);
                $this->assertArrayHasKey('actions',  $menu);
                $this->assertArrayHasKey('scope',    $menu);
                $this->assertArrayHasKey('sous-menu', $menu);

                // Structure du scope (nouveau format)
                $this->assertArrayHasKey('scopeAll',     $menu['scope']);
                $this->assertArrayHasKey('agencyScopes', $menu['scope']);
            }
        }
    }
}
