import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Crée un QueryClient configuré pour les tests :
 * - pas de retry (les erreurs échouent immédiatement)
 * - staleTime infini (pas de re-fetch automatique)
 */
function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries:   { retry: false, staleTime: Infinity },
      mutations: { retry: false },
    },
  });
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const qc = createTestQueryClient();
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

/**
 * Wrapper autour de `render` qui encapsule automatiquement
 * le composant dans tous les providers nécessaires (QueryClient, …).
 *
 * @example
 * const { getByText } = renderWithProviders(<MonComposant />)
 */
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Réexporte tout de @testing-library/react pour simplifier les imports dans les tests
export * from "@testing-library/react";
export { renderWithProviders };
