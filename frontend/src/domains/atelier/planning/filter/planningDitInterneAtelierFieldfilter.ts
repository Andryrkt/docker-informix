import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const planningDitInterneAtelierFieldfilter: FilterField[][] = [
  // Colonne 1
  [
    {
      name: "agent_travaux",
      label: "Agent travaux",
      type: "select",
      queryKey: "agent-travaux",
    },
    {
      name: "agence_debiteur",
      label: "Agence débiteur",
      type: "select",
      queryKey: "agences",
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
    },
  ],

  // Colonne 5
  [
    {
      name: "section_affectee",
      label: "Section affectée",
      type: "select",
      queryKey: "section_affectee",
    },
  ],
];
