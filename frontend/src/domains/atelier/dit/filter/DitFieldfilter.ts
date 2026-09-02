import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const ditFieldFilters: FilterField[][] = [
  // ========== COLUMN 1 ==========
  [
    {
      name: "statut",
      label: "Statut",
      type: "select",
      queryKey: "statut_dit",
      // queryFn will be added in component if needed
    },
    {
      name: "type_document",
      label: "Type de document",
      type: "select",
      queryKey: "type_document",
      // queryFn in component
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
      // queryFn in component
    },
    {
      name: "numero_devis",
      label: "N° devis",
      type: "text",
    },
  ],

  // ========== COLUMN 2 ==========
  [
    {
      name: "niveau_urgence",
      label: "Niveau d'urgence",
      queryKey: "worNiveauUrgence",
      type: "select",
      // queryFn in component
    },
    {
      name: "interne_externe",
      label: "Interne - Externe",
      type: "select",
      queryKey: "interne_externe",
      queryFn: async () => [
        // ✅ static, can stay here
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
    {
      name: "section_affectee",
      label: "Section affectée",
      type: "select",
      queryKey: "section_affectee",
      // queryFn in component
    },
    {
      name: "dit_sans_or",
      label: "DIT sans OR",
      type: "boolean",
      variant: "checkbox",
      hideLabel: true,
      placeholder: "DIT sans OR",
    },
  ],

  // ========== COLUMN 3 ==========
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
    {
      name: "statut_or",
      label: "Statut OR",
      type: "select",
      queryKey: "statut_or",
      // queryFn in component
    },
    {
      name: "Dit",
      label: "Section support1",
      type: "select",
      queryKey: "section_support1",
      // queryFn in component
    },
  ],

  // ========== COLUMN 4 ==========
  [
    {
      name: "agence_emetteur",
      label: "Agence émetteur",
      type: "select",
      queryKey: "agences",
      // queryFn overridden in component
    },
    {
      name: "service_emetteur",
      label: "Service émetteur",
      type: "select",
      queryKey: "services_emetteur",
      // queryFn overridden in component
    },
    {
      name: "categorie_demande",
      label: "Catégorie de demande",
      type: "select",
      queryKey: "categories_demande",
      // queryFn in component
    },
    {
      name: "section_support2",
      label: "Section support2",
      type: "select",
      queryKey: "section_support2",
      // queryFn in component
    },
  ],

  // ========== COLUMN 5 ==========
  [
    {
      name: "agence_debiteur",
      label: "Agence débiteur",
      type: "select",
      queryKey: "agences",
      // queryFn overridden in component
    },
    {
      name: "service_debiteur",
      label: "Service débiteur",
      type: "select",
      queryKey: "services_debiteur",
      // queryFn overridden in component
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
      // queryFn in component
    },
  ],

  // ========== COLUMN 6 ==========
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
      // queryFn in component
    },
  ],
];
