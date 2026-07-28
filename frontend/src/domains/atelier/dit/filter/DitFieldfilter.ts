import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const ditFieldFilters: FilterField[][] = [
  [
    {
      name: "statut",
      label: "Statut",
      type: "select",
      queryKey: "statut_dit",
      queryFn: async () => [],
    },
    {
      name: "type_document",
      label: "Type de document",
      type: "select",
      queryKey: "type_document",
      queryFn: async () => [],
    },
    {
      name: "numero_dit",
      label: "N° DIT",
      type: "text",
      placeholder: "Ex: DIT26068693",
      validate: (value) => value.length <= 11,
    },
    {
      name: "realise_par",
      label: "Réalisé par",
      type: "select",
      queryFn: async () => [],
    },
    {
      name: "numero_devis",
      label: "N° devis",
      type: "text",
    },
  ],
  [
    // 🚨 URGENCE
    {
      name: "niveau_urgence",
      label: "Niveau d'urgence",
      queryKey: "worNiveauUrgence",
      type: "select",
    },
    // 🌐 INTERNE / EXTERNE
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
    {
      name: "numero_or",
      label: "N° OR",
      type: "number",
      validate: (value) => /^\d{0,8}$/.test(value),
    },
    // 🏢 SECTION AFFECTÉE
    {
      name: "section_affectee",
      label: "Section affectée",
      type: "select",
      queryKey: "section_affectee",
    },
    // ✅ DIT SANS OR
    {
      name: "dit_sans_or",
      label: "DIT sans OR",
      type: "boolean",
      variant: "checkbox",
      hideLabel: true,
      placeholder: "DIT sans OR",
    },
  ],

  [
    // 📅 DATES
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
    // 📊 STATUT OR
    {
      name: "statut_or",
      label: "Statut OR",
      type: "select",
      queryKey: "statut_or",
    },
    // 🏢 SECTION support
    {
      name: "section_support1",
      label: "Section support1",
      type: "select",
      queryKey: "section_support1",
    },
  ],

  // Col 4
  [
    {
      name: "agence_emetteur",
      label: "Agence émetteur",
      type: "select",
      queryKey: "agences",
    },
    {
      name: "service_emetteur",
      label: "Service émetteur",
      type: "select",
      queryKey: "services_emetteur",
    },
    {
      name: "categorie_demande",
      label: "Catégorie de demande",
      type: "select",
      queryKey: "categories_demande",
    },

    {
      name: "section_support2",
      label: "Section support2",
      type: "select",
      queryKey: "section_support2",
    },
  ],

  // Col 5
  [
    {
      name: "agence_debiteur",
      label: "Agence débiteur",
      type: "select",
      queryKey: "agences_debiteur",
    },
    {
      name: "service_debiteur",
      label: "Service débiteur",
      type: "select",
      queryKey: "services_debiteur",
    },
    {
      name: "utilisateur",
      label: "Utilisateur",
      type: "text",
    },
    {
      name: "section_support3",
      label: "Section support3",
      type: "select",
      queryKey: "section_support3",
    },
  ],
  [
    {
      name: "id_materiel",
      label: "Id Matériel",
      type: "text",
    },

    {
      name: "numero_parc",
      label: "N° Parc",
      type: "text",
    },

    {
      name: "numero_serie",
      label: "N° Série",
      type: "text",
    },

    {
      name: "statut_facture",
      label: "Statut facture",
      type: "select",
      queryKey: "statut_facture",
      queryFn: async () => [],
    },
  ],
];
