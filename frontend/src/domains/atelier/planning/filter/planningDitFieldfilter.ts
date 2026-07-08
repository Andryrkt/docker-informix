import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const planningDitFieldfilter: FilterField[][] = [
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
    {
      name: "interne_externe",
      label: "Interne - Externe",
      type: "select",
      queryKey: "interne_externe",
      queryFn: async () => [
        { label: "Interne", value: "INTERNE" },
        { label: "Externe", value: "EXTERNE" },
      ],
    },
  ],

  // Colonne 2
  [
    {
      name: "service_debiteur",
      label: "Service debiteur",
      type: "multichoice",
      options: [],
    },
    {
      name: "section_affectee",
      label: "Section affectée",
      type: "select",
      queryKey: "section_affectee",
      queryFn: async () => [],
    },
  ],

  // Colonne 3
  [
    {
      name: "niveau_urgence",
      label: "Niveau d'urgence",
      type: "select",
      queryKey: "niveau_urgence",
      queryFn: async () => [],
    },
    {
      name: "type_ligne",
      label: "Type de ligne",
      type: "select",
      queryKey: "type_ligne",
      queryFn: async () => [],
    },
    {
      name: "id_materiel",
      label: "Id Matériel",
      type: "text",
    },
    {
      name: "casier",
      label: "Casier",
      type: "text",
    },
  ],

  // Colonne 4
  [
    {
      name: "facturation",
      label: "Facturation",
      type: "select",
      queryKey: "facturation",
      queryFn: async () => [],
    },
    {
      name: "numero_or",
      label: "N° OR",
      type: "number",
      validate: (value) => /^\d{0,8}$/.test(value),
    },
    {
      name: "type_document",
      label: "Type de document",
      type: "select",
      queryKey: "type_document",
      queryFn: async () => [],
    },
    {
      name: "dit_avec_back_order",
      label: "DIT avec Back Order",
      type: "boolean",
      variant: "checkbox",
      hideLabel: false,
      placeholder: "DIT avec Back Order",
    },
    {
      name: "dit_non_valider_dw",
      label: "Dit non valider DW",
      type: "boolean",
      variant: "checkbox",
      hideLabel: true,
      placeholder: "Dit non valider DW",
    },
  ],

  // Colonne 5
  [
    {
      name: "planification",
      label: "Planification",
      type: "select",
      options: [
        {
          label: "PLANIFIE",
          value: "planifie",
        },
        {
          label: "NON PLANIFIE",
          value: "non_planifie",
        },
      ],
    },
    {
      name: "numero_serie",
      label: "N° Série",
      type: "text",
    },
    {
      name: "numero_parc",
      label: "N° parc",
      type: "text",
    },
    {
      name: "realise_par",
      label: "Réalisé par",
      type: "select",
      queryKey: "realise_par",
      queryFn: async () => [],
    },
  ],

  // Colonne 6
  [
    {
      name: "periode",
      label: "Période",
      type: "select",
      options: [
        {
          label: "3 mois suivant",
          value: "3_mois_suivant",
        },
        {
          label: "6 mois suivant",
          value: "6_mois_suivant",
        },
        {
          label: "12 mois suivant",
          value: "12_mois_suivant",
        },
        {
          label: "12 mois precedent",
          value: "12_mois_precedent",
        },
        {
          label: "Année en cours",
          value: "annee_en_cours",
        },
        {
          label: "Année suivante",
          value: "annee_suivante",
        },
        {
          label: "Année precedente",
          value: "annee_precedente",
        },
      ],
    },
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
];
