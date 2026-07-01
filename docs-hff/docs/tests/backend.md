---
sidebar_position: 1
---

# Tests Backend (PHPUnit)

## Configuration

### `phpunit.dist.xml`

```xml
<testsuites>
  <testsuite name="Unit">       <directory>tests/Unit</directory>       </testsuite>
  <testsuite name="Functional"> <directory>tests/Functional</directory> </testsuite>
  <testsuite name="Security">   <directory>tests/Security</directory>   </testsuite>
  <testsuite name="All">        <directory>tests</directory>            </testsuite>
</testsuites>
```

### `tests/bootstrap.php`

Chargé avant chaque suite. Il appelle `Dotenv::bootEnv('.env')` qui charge automatiquement `.env.test.local` quand `APP_ENV=test`.

---

## Suite Unit

Pas de kernel, pas de base de données. Rapide et isolée.

### `AppActionTest` — 6 tests

Fichier : `tests/Unit/Security/AppActionTest.php`

Vérifie la cohérence de la classe `AppAction` (constantes d'actions) :

| Test | Ce qu'il vérifie |
|---|---|
| `testAllContainsExpectedNumberOfActions` | `AppAction::ALL` contient exactement 13 actions |
| `testAllContainsAllDeclaredConstants` | Chaque constante déclarée est présente dans `ALL` |
| `testAllHasNoDuplicates` | Pas de doublons dans `ALL` |
| `testAllActionsAreNonEmptyStrings` | Toutes les actions sont des chaînes non vides |
| `testActionConstantValues` | Valeurs exactes (`'view'`, `'edit'`, `'manage_permissions'`, …) |
| `testActionsUseSnakeCase` | Toutes les valeurs respectent le format `snake_case` |

### `UserPermissionTest` — 18 tests

Fichier : `tests/Unit/Security/Entity/UserPermissionTest.php`

Teste l'entité `UserPermission` en mémoire pure :

**Valeurs par défaut**

- `isScopeAll()` retourne `true` par défaut
- `getActions()` retourne `[]` par défaut
- `getAgencyScopes()` retourne `[]` par défaut
- `getId()` retourne `null` avant persist

**Getters / Setters**

- `setResourceType` / `getResourceType` (`'module'` et `'menu'`)
- `setResourceId` / `getResourceId`
- `setUser` / `getUser`
- `setCompany` / `getCompany`

**Actions**

- `setActions` définit les actions
- `setActions` déduplique automatiquement
- `hasAction` retourne `true` pour une action présente
- `hasAction` retourne `false` pour une action absente ou vide
- `hasAction` est sensible à la casse (`'VIEW'` ≠ `'view'`)

**Scope**

- `setScopeAll(false)` puis `isScopeAll()` retourne `false`
- Aller-retour `false → true`
- `setAgencyScopes` / `getAgencyScopes` avec deux agences mixtes
- `setAgencyScopes([])` retourne un tableau vide
- Vérification détaillée de la structure `agencyScopes` imbriquée

**Fluent interface**

- Toutes les méthodes `set*` retournent `$this` pour le chaînage

---

## Suite Functional

Utilise `WebTestCase` Symfony — boot du kernel + appels HTTP réels contre la base SQL Server de test.

> **Contrainte importante** : `static::createClient()` ne peut être appelé qu'**une seule fois par méthode de test**. Réutiliser le même `$client` pour les requêtes de nettoyage en fin de test.

### `AdminPermissionTemplateControllerTest` — 9 tests

Fichier : `tests/Functional/Admin/AdminPermissionTemplateControllerTest.php`  
Route de base : `GET|POST|PUT|DELETE /api/admin/permission-templates`

#### Architecture du test

```php
// Helpers
private function makeClient(string $username = 'lanto'): KernelBrowser
// Crée LE client (appelé une seule fois par test) + injecte le JWT

private function json(KernelBrowser $client): array
// Décode la réponse JSON

private function deleteTemplate(KernelBrowser $client, int $id): void
// Nettoyage en fin de test — reçoit le $client existant (pas de re-boot)
```

#### Tableau des tests

| Test | Méthode HTTP | Code attendu | Nettoyage |
|---|---|---|---|
| `testListReturnsJsonArray` | `GET /` | 200 + array JSON | — |
| `testListRequiresAuthentication` | `GET /` sans JWT | 401 | — |
| `testCreateTemplate` | `POST /` | 201 + champs vérifiés | `DELETE /{id}` |
| `testCreateTemplateFailsWithoutName` | `POST /` sans `name` | 400 + `error` | — |
| `testCreateTemplateFailsWithDuplicateName` | `POST /` x2 même nom | 400 au 2e | `DELETE /{id}` |
| `testShowReturnsTemplate` | `POST /` puis `GET /{id}` | 200 + id + name | `DELETE /{id}` |
| `testShowReturns404ForUnknownId` | `GET /999999` | 404 | — |
| `testUpdateTemplate` | `POST /` puis `PUT /{id}` | 200 + nouveaux champs | `DELETE /{id}` |
| `testDeleteTemplate` | `POST /` puis `DELETE /{id}` puis `GET /{id}` | 204 puis 404 | — |

#### Pattern de nettoyage

Chaque test qui crée un enregistrement passe le même `$client` au helper `deleteTemplate()` pour éviter le re-boot du kernel :

```php
public function testCreateTemplate(): void
{
    $client = $this->makeClient();         // 1 seul createClient()
    $client->request('POST', '/api/admin/permission-templates', …);
    $id = $this->json($client)['id'];

    // assertions …

    $this->deleteTemplate($client, $id);   // même $client, pas de re-boot
}
```

---

## Suite Security

Tests fonctionnels qui vérifient le système d'authentification et les voters.

### `LdapAuthenticationTest` — 3 tests

Fichier : `tests/Security/LdapAuthenticationTest.php`

| Test | Description |
|---|---|
| `testLoginFailureWithInvalidCredentials` | `POST /api/login` avec faux identifiants → 401 |
| `testLoginWithValidCredentials` | Login réel via LDAP → token JWT dans la réponse (skipped si `TEST_USER`/`TEST_PASSWORD` absents ou LDAP injoignable) |
| `testLoginReturnsJsonOnFailure` | Content-Type `application/json` même en cas d'échec |

### `PermissionSystemTest` — 5 tests

Fichier : `tests/Security/PermissionSystemTest.php`

| Test | Description |
|---|---|
| `testGetMeWithPermissions` | `GET /api/me` retourne `companies` et `scope` |
| `testActionPermissions` | `AppActionVoter` accorde la 1re action réelle de lanto, refuse `'action_inexistante_xyz'` |
| `testDoctrineFilterIsApplied` | Le filtre Doctrine `user_scope` est déclaré |
| `testNavigationRequiresActiveCompany` | `GET /api/navigation` sans header → 400 avec message contenant `"soci"` |
| `testNavigationReturnsMenuTree` | Structure JSON : `societes`, `modules`, `data_scope` ; scope au format `scopeAll` + `agencyScopes` |

#### Helper partagé

```php
private function getTestUser(string $username = 'lanto'): User
{
    $em   = static::getContainer()->get('doctrine')->getManager('sqlserver');
    $user = $em->getRepository(User::class)->findOneBy(['username' => $username]);

    if (!$user) {
        $this->markTestSkipped("Utilisateur '$username' introuvable — fixtures non chargées.");
    }
    return $user;
}
```

Le `markTestSkipped()` évite que les tests tombent en **erreur** (rouge) quand la base de test ne contient pas les fixtures — ils apparaissent en **skipped** (jaune).

---

## Erreurs fréquentes

### `LogicException: Booting the kernel before calling createClient()`

**Cause** : `createClient()` appelé deux fois dans le même test (typiquement dans un helper de nettoyage).

**Fix** : Passer le `$client` existant au helper plutôt que d'en créer un nouveau.

```php
// ❌ Problème
private function deleteTemplate(int $id): void {
    $client = $this->createClient(); // re-boot du kernel → exception
    …
}

// ✅ Correct
private function deleteTemplate(KernelBrowser $client, int $id): void {
    $client->request('DELETE', "/api/admin/permission-templates/$id");
}
```

### Tests skipped vs erreurs

| Situation | Comportement attendu |
|---|---|
| `.env.test.local` absent | Tests LDAP/sécurité → **skipped** |
| Utilisateur `lanto` absent de la DB | Tests sécurité → **skipped** |
| Serveur LDAP injoignable | `testLoginWithValidCredentials` → **skipped** |
| Contrôleur retourne 500 | Tests fonctionnels → **failed** (à investiguer) |
