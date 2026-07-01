import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./mocks/server";

// Démarrer le serveur MSW avant tous les tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Réinitialiser les handlers après chaque test (évite les fuites entre tests)
afterEach(() => server.resetHandlers());

// Fermer le serveur après tous les tests
afterAll(() => server.close());

// Neutraliser window.location.href = "/login" de l'intercepteur axios
Object.defineProperty(window, "location", {
  value: { href: "" },
  writable: true,
});

// Nettoyer localStorage entre chaque test
afterEach(() => localStorage.clear());
