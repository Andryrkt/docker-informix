import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const dossierDitFieldFilter: FilterField[][] = [
  [
    // 🔢 IDENTIFIANTS
    {
      name: "numero_dit",
      label: "N° DIT",
      type: "text",
      placeholder: "Ex: DIT26068693",
      validate: (value) => value.length <= 11,
    },
    // 🌐 INTERNE / EXTERNE
  ],
  [
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
  [
    {
      name: "numero_parc",
      label: "N° Parc",
      type: "text",
    },
    {
      name: "numero_or",
      label: "N° OR",
      type: "number",
      validate: (value) => /^\d{0,8}$/.test(value),
    },
    {
      name: "numero_devis",
      label: "N° Devis Rattaché",
      type: "text",
    },
  ],

  [
    {
      name: "designation",
      label: "Désignation",
      type: "text",
    },
    {
      name: "id_materiel",
      label: "Id Matériel",
      type: "text",
    },
    {
      name: "numero_serie",
      label: "N° Série",
      type: "text",
    },
  ],
  [
    {
      name: "date_fin_demande",
      label: "Date fin demande",
      type: "date",
    },
    {
      name: "date_debut_demande",
      label: "Date début demande",
      type: "date",
    },
  ],
];
