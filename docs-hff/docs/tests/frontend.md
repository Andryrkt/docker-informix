---
sidebar_position: 2
---

# Tests Frontend (Vitest)

## Stack

| Outil | Rôle |
|---|---|
| **Vitest 3** | Runner de tests (compatible Jest API) |
| **@testing-library/react 16** | Rendu de composants + queries DOM |
| **@testing-library/user-event** | Simulation d'interactions utilisateur réalistes |
| **@testing-library/jest-dom** | Matchers supplémentaires (`toBeInTheDocument`, `toBeDisabled`, …) |
| **MSW 2 (Mock Service Worker)** | Interception des appels HTTP API en mode Node |
| **jsdom** | DOM simulé dans Node.js |
| **@vitest/coverage-v8** | Rapport de couverture de code |

---

## Configuration

### `vitest.config.ts`

```ts
import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(viteConfig, defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/test/**", "src/main.tsx", "src/routes/**", "src/**/__tests__/**"],
    },
  },
}));
```

`mergeConfig` est nécessaire pour hériter des plugins Vite (React, Tailwind) sans les redéclarer.

### `src/test/setup.ts`

Exécuté avant chaque fichier de test via `setupFiles` :

```ts
import "@testing-library/jest-dom";           // matchers DOM
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());       // reset entre chaque test
afterAll(() => server.close());

// Neutraliser la redirection /login de l'intercepteur axios
Object.defineProperty(window, "location", { value: { href: "http://localhost/" }, writable: true });

afterEach(() => localStorage.clear());
```

> **`location.href` doit être une URL absolue valide, jamais `""`.** L'intercepteur XHR de `@mswjs/interceptors` (utilisé par MSW) appelle `new URL(url, location.href)` pour résoudre l'URL de la requête — et `new URL(url, base)` lève `TypeError: Invalid base URL` dès que `base` est invalide, **même si `url` est déjà absolue**. Avec `href: ""`, toute requête axios interceptée par MSW échouait silencieusement avant même d'atteindre un handler ; comme les tests existants ne vérifiaient que l'affichage d'un placeholder (jamais le contenu réellement chargé), ce bug était invisible jusqu'à l'écriture d'un test qui asserte sur des données MSW effectivement reçues (`TikActionDialog.test.tsx` → liste des intervenants).

---

## Infrastructure de mock API (MSW)

### `src/test/mocks/server.ts`

```ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
export const server = setupServer(...handlers);
```

### `src/test/mocks/handlers.ts`

Handlers HTTP déclarés pour `http://localhost:8080/api` :

| Route | Méthode | Réponse mockée |
|---|---|---|
| `/admin/users` | GET | 3 utilisateurs (lanto, admin, hoby) |
| `/admin/permission-templates` | GET | 2 modèles (Responsable atelier, Lecteur Magasin) |
| `/admin/permission-templates/:id` | GET | Modèle par id / 404 |
| `/admin/permission-templates` | POST | `{ id: 99, name: "Nouveau modèle", … }` 201 |
| `/admin/permission-templates/:id` | PUT | Modèle mis à jour 200 |
| `/admin/permission-templates/:id` | DELETE | 204 |
| `/admin/companies` | GET | HFF, FRAISE |
| `/admin/agencies` | GET | Antananarivo, Tamatave avec leurs services |
| `/admin/modules` | GET | Magasin, Atelier avec leurs menus |
| `/admin/actions` | GET | view, create, edit, delete |
| `/admin/users/:userId/permissions` | GET | 1 permission (view + edit sur Magasin) |
| `/admin/users/:userId/copy-from/:sourceId` | POST | Retourne les permissions copiées |
| `/admin/users/:userId/apply-template/:templateId` | POST | Retourne les permissions appliquées |
| `/tik/tickets/intervenants` | GET | 2 intervenants (RAKOTO Jean, RABE Marie) |

### Surcharge dans un test

Pour tester un cas d'erreur, surcharger un handler dans le test :

```ts
import { http, HttpResponse } from "msw";
import { server } from "../../../test/mocks/server";

it("gère l'erreur API", async () => {
  server.use(
    http.get("http://localhost:8080/api/admin/users", () =>
      new HttpResponse(null, { status: 500 })
    )
  );
  // … test
});
// Le handler est réinitialisé automatiquement après le test (afterEach resetHandlers)
```

---

## Helper de rendu : `renderWithProviders`

Fichier : `src/test/utils.tsx`

Enveloppe le composant à tester dans un `QueryClientProvider` configuré pour les tests :

```tsx
const testQueryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: Infinity },
  },
});

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>,
    options
  );
}
```

- `retry: false` — pas de retry automatique en cas d'erreur (les erreurs remontent immédiatement)
- `staleTime: Infinity` — pas de refetch automatique en cours de test

---

## Tests existants

### `adminApi.test.ts` — Validation des types

Fichier : `src/domains/admin/api/__tests__/adminApi.test.ts`

Vérifie que les structures TypeScript des types API sont cohérentes (tests purement statiques, aucun appel réseau) :

| Suite | Tests |
|---|---|
| `AgencyScope` | `allServices=true` avec `serviceIds` vide ; `allServices=false` avec ids |
| `UserPermission` | `scopeAll=true` vide ; `scopeAll=false` avec `agencyScopes` ; `resourceType: 'menu'` |
| `PermissionTemplate` | Nom et description ; items structurés comme `UserPermission` ; `description=null` |

### `CopyFromUserDialog.test.tsx` — 9 tests

Fichier : `src/domains/admin/components/__tests__/CopyFromUserDialog.test.tsx`

| Catégorie | Test |
|---|---|
| Rendu | Titre visible quand `open=true` |
| Rendu | Rien quand `open=false` |
| Rendu | Boutons radio Remplacer / Fusionner présents |
| Rendu | Boutons Annuler et Copier présents |
| Validation | Bouton Copier désactivé sans utilisateur sélectionné |
| Mode | Mode par défaut = Remplacer (1er radio coché) |
| Mode | Clic sur Fusionner → radio bascule |
| Interaction | Clic Annuler → `onClose` appelé |
| API | La liste des utilisateurs est chargée (`useQuery` → MSW) |
| État | Bouton "Copie en cours…" désactivé pendant `isSubmitting` |
| État | Annuler désactivé pendant `isSubmitting` |

### `ApplyTemplateDialog.test.tsx` — 9 tests

Fichier : `src/domains/admin/components/__tests__/ApplyTemplateDialog.test.tsx`

Structure symétrique à `CopyFromUserDialog` mais pour les modèles de permissions :

| Catégorie | Test |
|---|---|
| Rendu | Titre "Appliquer un modèle" visible quand `open=true` |
| Rendu | Rien quand `open=false` |
| Rendu | Boutons radio Remplacer / Fusionner |
| Rendu | Boutons Annuler et Appliquer |
| Validation | Bouton Appliquer désactivé sans modèle sélectionné |
| Mode | Mode par défaut = Remplacer |
| Mode | Bascule vers Fusionner |
| Interaction | Clic Annuler → `onClose` appelé |
| API | La liste des modèles est chargée (MSW retourne `mockTemplates`) |

### `tikApi.test.ts` — Validation des types

Fichier : `src/domains/it/api/__tests__/tikApi.test.ts`

Même approche que `adminApi.test.ts` (aucun appel réseau) appliquée aux types du module [TIK](../architecture/tik.md) : `Tik`, `TikActions`, `TikHistoriqueEntry`, `TikPayload`, `PlanifierPayload`, `CategorieNode` (arbre catégorie → sous-catégorie → autre catégorie).

### `TikActionDialog.test.tsx` — 13 tests

Fichier : `src/domains/it/components/__tests__/TikActionDialog.test.tsx`

Ce dialogue pilote les 8 actions du workflow TIK (`valider`, `refuser`, `planifier`, …) via un objet de configuration ; les tests couvrent le rendu conditionnel des champs et la validation client selon l'action sélectionnée :

| Catégorie | Test |
|---|---|
| Rendu | Rien quand `action=null` ou `ticket=null` |
| Rendu | Titre avec le numéro de ticket |
| Rendu | Libellé du bouton de confirmation selon l'action (ex : "Clôturer") |
| Champs conditionnels | Champ intervenant affiché pour `valider` |
| API | La liste des intervenants disponibles est chargée depuis MSW (`getByRole("option", …)` — vérifie le contenu réel, pas juste un placeholder) |
| Champs conditionnels | Champs date début/fin affichés pour `planifier` |
| Champs conditionnels | Pas de champ commentaire pour `planifier` |
| Champs conditionnels | Champ commentaire obligatoire affiché pour `refuser` |
| Validation | Erreur si confirmation d'un refus sans commentaire |
| Validation | Erreur si confirmation d'une planification sans dates |
| Validation | Erreur si validation sans intervenant choisi |
| Interaction | Clic Annuler → `onClose` appelé |

---

## Ajouter un test

1. Créer un fichier `*.test.ts` ou `*.test.tsx` dans un dossier `__tests__/` à côté du fichier testé.
2. Utiliser `renderWithProviders` pour les composants React.
3. Les appels HTTP sont interceptés automatiquement par MSW — aucune configuration supplémentaire.
4. Pour un cas d'erreur, surcharger le handler avec `server.use(…)` dans le test.

```tsx
import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../test/utils";
import { MonComposant } from "../MonComposant";

describe("MonComposant", () => {
  it("affiche les données chargées", async () => {
    renderWithProviders(<MonComposant />);

    await waitFor(() => {
      expect(screen.getByText("Donnée attendue")).toBeInTheDocument();
    });
  });
});
```

---

## Scripts npm

```bash
npm run test        # Mode watch — relance les tests à chaque sauvegarde
npm run test:run    # Passe unique (CI)
npm run test:ui     # Interface Vitest UI dans le navigateur
npm run coverage    # Rapport de couverture (HTML dans coverage/)
```
