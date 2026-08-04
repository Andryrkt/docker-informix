import axiosInstance from "@/conf/axios";
import type { NavigationData } from "../schema/navigationSchema";

const useMock = import.meta.env.VITE_USE_MOCK === "true";

export const fetchNavigation = async (
  companyId: number,
): Promise<NavigationData> => {
  // if (!useMock) {
  //   // Simulation d’un appel asynchrone
  //   await new Promise((resolve) => setTimeout(resolve, 3000));
  //   console.log(`[MOCK] Navigation pour société ${companyId}`);
  //   return navigationMockData;
  // }
  const response = await axiosInstance.get<NavigationData>("/navigation", {
    headers: {
      "X-Active-Company-ID": String(companyId),
    },
  });

  return response.data;
};

const navigationMockData: NavigationData = {
  societes: [
    { id: 1, nom: "HFF Madagascar" },
    { id: 2, nom: "HFF Maurice" },
  ],
  data_scope: {
    userAgenceId: 5,
    userServiceId: 12,
  },
  modules: [
    {
      id: 1,
      nom: "Documentation",
      menu: [
        {
          id: 10,
          nom: "Contrat",
          route: null,
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [
            {
              id: 101,
              nom: "Nouveau contrat",
              route: "/documentation/contrats/nouveau-contrat",
              actions: ["view", "create"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 102,
              nom: "Consultation",
              route: "/documentation/contrats/liste",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
          ],
        },
        {
          id: 11,
          nom: "Annuaire",
          route: "/sso/annuaire",
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [],
        },
        {
          id: 12,
          nom: "Planning analytique HFF",
          route: "/documentation/planning-analytique-HFF",
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [],
        },
        {
          id: 13,
          nom: "Document interne",
          route: "/documentation/documentation-interne",
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [],
        },
      ],
    },
    {
      id: 2,
      nom: "Magasin",
      menu: [
        {
          id: 20,
          nom: "OR",
          route: null,
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [
            {
              id: 201,
              nom: "Liste à traiter",
              route: "/magasin/ordre-reparation/a-traiter",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 202,
              nom: "Liste à livrer",
              route: "/magasin/ordre-reparation/a-livrer",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
          ],
        },
        {
          id: 21,
          nom: "Dematerialisation",
          route: null,
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [
            {
              id: 211,
              nom: "Devis",
              route: "/magasin/dematerialisation/liste-devis-neg",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 212,
              nom: "Planning de commande Magasin",
              route: "/magasin/dematerialisation/planning-commande-magasin",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
          ],
        },
        {
          id: 22,
          nom: "Soumission commandes fournisseur",
          route: "/magasin/cmde-fournisseur",
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [],
        },
      ],
    },
    {
      id: 3,
      nom: "Atelier",
      menu: [
        {
          id: 30,
          nom: "Demande d'intervention",
          route: null,
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [
            {
              id: 301,
              nom: "Nouvelle demande",
              route: "/atelier/demande-intervention/new",
              actions: ["view", "create"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 302,
              nom: "Consultation",
              route: "/atelier/demande-intervention/dit-list",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 303,
              nom: "Dossier DIT",
              route: "/atelier/demande-intervention/dossier-list",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 304,
              nom: "Matrice de responsabilité",
              route: null,
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
          ],
        },
        {
          id: 31,
          nom: "PLANNING",
          route: null,
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [
            {
              id: 311,
              nom: "Planning detailé",
              route: "/atelier/demande-intervention/planning-detaille",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 312,
              nom: "Planning interne Atelier",
              route: "/atelier/demande-intervention/planning-interne-atelier",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 313,
              nom: "Planning",
              route: "/atelier/demande-intervention/planning-list",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
          ],
        },
        {
          id: 32,
          nom: "Glossaire OR",
          route: "/atelier/demande-intervention/glossaire-or",
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [],
        },
      ],
    },
    {
      id: 4,
      nom: "IT",
      menu: [
        {
          id: 40,
          nom: "Demande support informatique",
          route: null,
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [
            {
              id: 401,
              nom: "Formulaire de demande de support",
              route: "/it/demande-support-informatique",
              actions: ["view", "create"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
          ],
        },
        {
          id: 41,
          nom: "Tickets",
          route: null,
          actions: ["view"],
          scope: { scopeAll: true, agencyScopes: [] },
          "sous-menu": [
            {
              id: 411,
              nom: "Suivi des tickets",
              route: "/it/tickets",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 412,
              nom: "Diagramme de Gantt",
              route: "/it/tickets/gantt",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
            {
              id: 413,
              nom: "Tableau de bord",
              route: "/it/tickets/dashboard",
              actions: ["view"],
              scope: { scopeAll: true, agencyScopes: [] },
              "sous-menu": [],
            },
          ],
        },
      ],
    },
  ],
};
