import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { get, set, del } from "idb-keyval";
import { queryClient } from "./lib/queryClient";
import "./i18n";

const indexedDBPersister = createAsyncStoragePersister({
  storage: {
    getItem: async (key) => await get(key),
    setItem: async (key, value) => await set(key, value),
    removeItem: async (key) => await del(key),
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: indexedDBPersister,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        // Change cette valeur à chaque changement de forme des données mises en
        // cache (ex: format des labels agence/service) pour invalider d'un coup
        // le cache IndexedDB persisté de tous les utilisateurs.
        buster: "2026-07-16-agence-service-code",
      }}
    >
      <TooltipProvider>
        <App />
        <Toaster richColors />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </StrictMode>,
);
