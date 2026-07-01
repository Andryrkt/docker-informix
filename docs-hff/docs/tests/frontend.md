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
Object.defineProperty(window, "location", { value: { href: "" }, writable: true });

afterEach(() => localStorage.clear());
```

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
