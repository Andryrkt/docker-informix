import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

// Démarrer le serveur MSW avant tous les tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Réinitialiser les handlers après chaque test (évite les fuites entre tests)
afterEach(() => server.resetHandlers());

// Fermer le serveur après tous les tests
afterAll(() => server.close());

// Neutraliser window.location.href = "/login" de l'intercepteur axios.
// href doit rester une URL absolue valide : MSW (@mswjs/interceptors) l'utilise
// comme base pour résoudre les URLs des requêtes XHR, même quand ces URLs sont
// déjà absolues — une chaîne vide fait échouer new URL(url, base) avant même
// que l'URL de la requête ne soit examinée.
Object.defineProperty(window, "location", {
  value: { href: "http://localhost/" },
  writable: true,
});

// Nettoyer localStorage entre chaque test
afterEach(() => localStorage.clear());
