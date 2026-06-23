import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const ditFieldFilter: FilterField[] = [
  // 📊 STATUT
  {
    name: "statut",
    label: "Statut",
    type: "select",
    queryKey: "statut_dit",
    queryFn: async () => [],
  },

  // 🚨 URGENCE
  {
    name: "niveau_urgence",
    label: "Niveau d'urgence",
    type: "select",
    queryKey: "niveau_urgence",
    queryFn: async () => [],
  },
  // 📅 DATES
  {
    name: "date_debut_demande",
    label: "Date début demande",
    type: "date",
  },
  // ==========================
  // SECTION SUPPORT 1
  // ==========================
  {
    name: "agence_emetteur",
    label: "Agence émetteur",
    type: "select",
    queryKey: "agences",
    queryFn: async () => [],
  },
  // ==========================
  // SECTION SUPPORT 2
  // ==========================
  {
    name: "agence_debiteur",
    label: "Agence débiteur",
    type: "select",
    queryKey: "agences_debiteur",
    queryFn: async () => [],
  },

  {
    name: "id_materiel",
    label: "Id Matériel",
    type: "text",
  },
  // 📄 TYPE DOCUMENT
  {
    name: "type_document",
    label: "Type de document",
    type: "select",
    queryKey: "type_document",
    queryFn: async () => [],
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
    name: "date_fin_demande",
    label: "Date fin demande",
    type: "date",
  },
  {
    name: "service_emetteur",
    label: "Service émetteur",
    type: "select",
    queryKey: "services_emetteur",
    queryFn: async () => [],
  },
  {
    name: "service_debiteur",
    label: "Service débiteur",
    type: "select",
    queryKey: "services_debiteur",
    queryFn: async () => [],
  },
  {
    name: "numero_parc",
    label: "N° Parc",
    type: "text",
  },
  // 🔢 IDENTIFIANTS
  {
    name: "numero_dit",
    label: "N° DIT",
    type: "text",
    placeholder: "Ex: DIT26068693",
    validate: (value) => value.length <= 11,
  },
  {
    name: "numero_or",
    label: "N° OR",
    type: "number",
    validate: (value) => /^\d{0,8}$/.test(value),
  },
  // 📊 STATUT OR
  {
    name: "statut_or",
    label: "Statut OR",
    type: "select",
    queryKey: "statut_or",
    queryFn: async () => [],
  },
  {
    name: "categorie_demande",
    label: "Catégorie de demande",
    type: "select",
    queryKey: "categories_demande",
    queryFn: async () => [],
  },
  {
    name: "utilisateur",
    label: "Utilisateur",
    type: "select",
    queryKey: "utilisateur",
    queryFn: async () => [],
  },
  {
    name: "numero_serie",
    label: "N° Série",
    type: "text",
  },
  // 👤 UTILISATEURS
  {
    name: "realise_par",
    label: "Réalisé par",
    type: "select",
    queryKey: "realise_par",
    queryFn: async () => [],
  },

  // 🏢 SECTION AFFECTÉE
  {
    name: "section_affectee",
    label: "Section affectée",
    type: "select",
    queryKey: "section_affectee",
    queryFn: async () => [],
  },
  // 🏢 SECTION support
  {
    name: "section_support1",
    label: "Section support1",
    type: "select",
    queryKey: "section_support1",
    queryFn: async () => [],
  },
  {
    name: "section_support2",
    label: "Section support2",
    type: "select",
    queryKey: "section_support2",
    queryFn: async () => [],
  },
  {
    name: "section_support3",
    label: "Section support3",
    type: "select",
    queryKey: "section_support3",
    queryFn: async () => [],
  },

  // 🧾 FACTURE
  {
    name: "statut_facture",
    label: "Statut facture",
    type: "select",
    queryKey: "statut_facture",
    queryFn: async () => [],
  },

  {
    name: "numero_devis",
    label: "N° devis",
    type: "text",
  },

  // ✅ DIT SANS OR
  {
    name: "dit_sans_or",
    label: "DIT sans OR",
    type: "boolean",
  },
];
