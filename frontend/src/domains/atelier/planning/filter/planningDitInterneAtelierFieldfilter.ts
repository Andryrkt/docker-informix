import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const planningDitInterneAtelierFieldfilter: FilterField[][] = [
  // Colonne 1
  [
    {
      name: "agent_travaux",
      label: "Agent travaux",
      type: "select",
      queryKey: "agent-travaux",
      queryFn: async () => [],
    },
    {
      name: "agent_debiteur",
      label: "Agent débiteur",
      type: "select",
      queryKey: "agent-debiteur",
      queryFn: async () => [],
    },
  ],

  // Colonne 2
  [
    {
      name: "num_semaine",
      label: "Numéro de semaine de l'anneé actuel",
      type: "select",
    },
    {
      name: "service_debiteur",
      label: "Service debiteur",
      type: "multichoice",
      options: [],
    },
  ],

  // Colonne 3
  [
    {
      name: "date_debut_demande",
      label: "Date début demande",
      type: "date",
    },
    {
      name: "date_fin_demande",
      label: "Date fin demande",
      type: "date",
    },
  ],

  // Colonne 4
  [
    {
      name: "numero_or",
      label: "N° OR",
      type: "number",
      validate: (value) => /^\d{0,8}$/.test(value),
    },
    {
      name: "ressource",
      label: "Ressource",
      type: "select",
      queryKey: "ressource",
      queryFn: async () => [],
    },
  ],

  // Colonne 5
  [
    {
      name: "section_affectee",
      label: "Section affectée",
      type: "select",
      queryKey: "section_affectee",
      queryFn: async () => [],
    },
  ],
];
