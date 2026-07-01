---
sidebar_position: 3
sidebar_label: Vue d'ensemble
---

# Tests — Vue d'ensemble

Le projet dispose de deux couches de tests indépendantes :

| Couche | Stack | Commande |
|---|---|---|
| **Backend** (Symfony) | PHPUnit 12.5 | `php bin/phpunit` |
| **Frontend** (React / TypeScript) | Vitest 3 + Testing Library | `npm run test` |

---

## Backend — Suites PHPUnit

Définis dans [`backend/phpunit.dist.xml`](../../backend/phpunit.dist.xml), les tests se répartissent en trois suites :

```
tests/
├── Unit/
│   └── Security/
│       ├── AppActionTest.php          (6 tests)
│       └── Entity/
│           └── UserPermissionTest.php (18 tests)
├── Functional/
│   └── Admin/
│       └── AdminPermissionTemplateControllerTest.php (9 tests)
└── Security/
    ├── LdapAuthenticationTest.php     (3 tests)
    └── PermissionSystemTest.php       (5 tests)
```

### Lancer les tests

```bash
# Dans le container backend
docker exec -it hff_backend bash

# Toutes les suites
php bin/phpunit

# Suite rapide (sans DB, sans kernel)
php bin/phpunit --testsuite Unit

# Tests fonctionnels HTTP (nécessitent la DB)
php bin/phpunit --testsuite Functional

# Tests de sécurité / LDAP / voters
php bin/phpunit --testsuite Security
```

---

## Frontend — Vitest

```
frontend/src/
├── test/
│   ├── setup.ts              # Configuration globale (MSW, jest-dom, localStorage)
│   ├── utils.tsx             # renderWithProviders (QueryClient wrapper)
│   └── mocks/
│       ├── server.ts         # Serveur MSW (Node mode)
│       └── handlers.ts       # Handlers API mockés
└── domains/admin/
    ├── api/__tests__/
    │   └── adminApi.test.ts   (3 suites — types AgencyScope, UserPermission, PermissionTemplate)
    └── components/__tests__/
        ├── CopyFromUserDialog.test.tsx    (9 tests)
        └── ApplyTemplateDialog.test.tsx   (9 tests)
```

### Lancer les tests

```bash
# Dans le container frontend
docker exec -it hff_frontend bash

# Mode watch (développement)
npm run test

# Mode CI (une seule passe)
npm run test:run

# Interface graphique Vitest UI
npm run test:ui

# Rapport de couverture
npm run coverage
```

---

## Prérequis environnement

### Backend : `.env.test.local`

Créer ce fichier dans `backend/` (non commité — ignoré via `/.env.*.local`) :

```env
APP_ENV=test
TEST_USER=lanto
TEST_PASSWORD=VotreMotDePasse
```

Ces variables sont lues automatiquement par `Dotenv::bootEnv()` dans `tests/bootstrap.php`. Sans elles, les tests LDAP et les tests de sécurité qui accèdent à la base sont marqués **skipped** (pas en erreur).

### Frontend : aucun prérequis

Les tests frontend utilisent **MSW** (Mock Service Worker en mode Node) pour intercepter tous les appels HTTP. Aucune connexion réelle n'est nécessaire.
