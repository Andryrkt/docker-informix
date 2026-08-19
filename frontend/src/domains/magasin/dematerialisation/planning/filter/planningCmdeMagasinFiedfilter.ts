import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const planningCmdeMagasinFieldsFilter: FilterField[][] = [
  [
    {
      name: "agence",
      label: "Agence",
      type: "select",
      placeholder: "-- Choisir une agence --",
      queryKey: "agences",
    },
  ],
  [
    {
      name: "services",
      label: "Services",
      type: "multichoice",
      options: [],
    },
  ],
  [
    {
      name: "numero_commande_frn",
      label: "N° Commande FRN",
      type: "text",
    },
    {
      name: "is_with_back_order",
      label: "Commande avec Back Order",
      type: "boolean",
      variant: "checkbox",
      hideLabel: true,
      placeholder: "Commande avec Back Order",
    },

    {
      name: "is_bc_non_valider_dw",
      label: "BC non valider DW",
      type: "boolean",
      variant: "checkbox",
      hideLabel: true,
      placeholder: "BC non valider DW",
    },
  ],
  [
    {
      name: "numero_bc_negoce",
      label: "N° BC Négoce",
      type: "text",
    },

    {
      name: "client",
      label: "Client",
      type: "text",
    },
  ],
  [
    {
      name: "commercial",
      label: "Commercial",
      type: "text", // upgrade possible en select/autocomplete
    },
    {
      name: "periode",
      label: "Période",
      type: "select",
      queryKey: "periode",
      queryFn: async () => [
        { label: "3 mois suivant", value: "3_months" },
        { label: "6 mois suivant", value: "6_months" },
        { label: "12 mois suivant", value: "12_months" },
      ],
    },
  ],
  [
    {
      name: "po_client",
      label: "PO Client",
      type: "text",
    },
  ],
];
