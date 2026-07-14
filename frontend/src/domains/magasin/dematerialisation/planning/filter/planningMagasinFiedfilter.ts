import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const planningFieldsFilter: FilterField[][] = [
  [
    {
      name: "agence",
      label: "Agence",
      type: "select",
      placeholder: "-- Choisir une agence --",
      queryKey: "agences",
      queryFn: async () => [
        { label: "Antananarivo", value: "ANT" },
        { label: "Toamasina", value: "TMS" },
        { label: "Fianarantsoa", value: "FIAN" },
      ],
    },
    {
      name: "services",
      label: "Services",
      type: "multichoice",
      options: [{ label: "Tous sélectionner", value: "Tous sélectionner" }],
    },
  ],
  [
    {
      name: "numero_commande",
      label: "N° Commande",
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

    {
      name: "numero_devis",
      label: "N° Devis",
      type: "text",
    },
    {
      name: "client",
      label: "Client",
      type: "text", // upgrade possible en autocomplete
    },
    {
      name: "commercial",
      label: "Commercial",
      type: "text", // upgrade possible en select/autocomplete
    },

    {
      name: "po_client",
      label: "PO Client",
      type: "text",
    },
  ],
  [
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
];
