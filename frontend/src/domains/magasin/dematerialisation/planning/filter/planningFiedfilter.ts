import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const planningFieldsFilter: FilterField[] = [
  // 🏢 AGENCE
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
  // 🏢 Service
  {
    name: "services",
    label: "Services",
    type: "multichoice",
    options: [{ label: "Tous sélectionner", value: "Tous sélectionner" }],
  },

  // 📦 NUMÉRO COMMANDE
  {
    name: "numero_commande",
    label: "N° Commande",
    type: "text",
  },
  // 📦 Avec back order
  {
    name: "is_with_back_order",
    label: "Commande avec Back Order",
    type: "boolean",
  },

  // 📦 BC non valider DW
  {
    name: "is_bc_non_valider_dw",
    label: "BC non valider DW",
    type: "boolean",
  },

  // 📄 N° DEVIS
  {
    name: "numero_devis",
    label: "N° Devis",
    type: "text",
  },
  // 👤 CLIENT
  {
    name: "client",
    label: "Client",
    type: "text", // upgrade possible en autocomplete
  },
  // 👨‍💼 COMMERCIAL
  {
    name: "commercial",
    label: "Commercial",
    type: "text", // upgrade possible en select/autocomplete
  },
  // 📅 PÉRIODE
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
  // 📦 PO CLIENT
  {
    name: "po_client",
    label: "PO Client",
    type: "text",
  },
];
