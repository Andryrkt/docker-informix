import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const POSITION_IPS = [
  { label: "AC", value: "AC" },
  { label: "DE", value: "DE" },
  { label: "RE", value: "RE" },
  { label: "TR", value: "TR" },
];
export const FILTER_RELANCE = [
  { label: "À relancer", value: "A_RELANCER" },
  { label: "3 relances terminées (Non stoppé)", value: "3_RELANCES_OK" },
  { label: "3 relances terminées (Stoppé)", value: "3_RELANCES_STOP" },
  { label: "Stoppé avant R1", value: "STOP_AVANT_R1" },
  { label: "Stoppé R1", value: "STOP_R1" },
  { label: "Stoppé R2", value: "STOP_R2" },
  { label: "Relance 1 en cours", value: "R1_EN_COURS" },
  { label: "Relance 2 en cours", value: "R2_EN_COURS" },
  { label: "Relance 3 en cours", value: "R3_EN_COURS" },
];
export const SERVICES = [
  { label: "300 - PARTS", value: "300" },
  { label: "305 - HOSE CENTER", value: "305" },
  { label: "310 - PARTS MACHINE", value: "310" },
  { label: "330 - PARTS GENSET", value: "330" },
  { label: "335 - PARTS AGRI", value: "335" },
  { label: "360 - PARTS UPS", value: "360" },
  { label: "380 - PARTS TRUCKS & BUSES", value: "380" },
];
export const STATUT_DEVIS = [
  { label: "Prix à confirmer", value: "Prix à confirmer" },
  {
    label: "Prix validé - devis à envoyer au client",
    value: "Prix validé - devis à envoyer au client",
  },
  {
    label: "Prix validé - devis à soumettre",
    value: "Prix validé - devis à soumettre",
  },
  {
    label: "Prix modifié - devis à envoyer au client",
    value: "Prix modifié - devis à envoyer au client",
  },
  {
    label: "Prix modifié - devis à soumettre",
    value: "Prix modifié - devis à soumettre",
  },
  { label: "Demande refusée par le PM", value: "Demande refusée par le PM" },
  { label: "A valider chef d'agence", value: "A valider chef d'agence" },
  {
    label: "Validé - à envoyer au client",
    value: "Validé - à envoyer au client",
  },
  { label: "Envoyé au client", value: "Envoyé au client" },
  { label: "Cloturé - A modifier", value: "Cloturé - A modifier" },
  { label: "A traiter", value: "A traiter" },
];
export const STATUT_BC = [
  { label: "Soumis à validation", value: "Soumis à validation" },
  { label: "En attente bc", value: "En attente bc" },
  { label: "Validé", value: "Validé" },
  { label: "A valider PM", value: "A valider PM" },
];
export const devisFieldfilter: FilterField[][] = [
  [
    // 📄 IDENTIFIANTS
    {
      name: "numero_devis",
      label: "Numéro de devis",
      type: "text",
    },

    {
      name: "soumis_par",
      label: "Soumis par",
      type: "text",
    },
  ],
  [
    // 📄 IDENTIFIANTS

    // Agent emetteur
    {
      name: "agence_emetteur",
      label: "Agence émetteur",
      type: "select",
      queryKey: "agences",
      queryFn: async () => [
        { label: "Antananarivo", value: "ANT" },
        { label: "Toamasina", value: "TMS" },
        { label: "Fianarantsoa", value: "FIAN" },
      ],
    },
    // 📅 DATES debut
    {
      name: "date_creation_debut",
      label: "Date création (début)",
      type: "date",
    },
    // 📊 STATUT DEVIS
    {
      name: "statut_devis",
      label: "Statut devis",
      type: "select",
      queryKey: "statut_devis",
      queryFn: async () => STATUT_DEVIS,
    },
    // 📊 STATUT BC
    {
      name: "statut_bc",
      label: "Statut BC",
      type: "select",
      queryKey: "statut_bc",
      queryFn: async () => STATUT_BC,
    },

    // 👤 CLIENT AUTOCOMPLETE (IMPORTANT)
    {
      name: "code_client",
      label: "Code client",
      type: "select", // tu peux upgrader en autocomplete plus tard
      placeholder: "Code client...",
      queryKey: "statut_bc",
      queryFn: async () => STATUT_BC,
    },
    // 👤 Creer par AUTOCOMPLETE (IMPORTANT)
    {
      name: "creer_par",
      label: "Créer par",
      type: "text", // tu peux upgrader en autocomplete plus tard
      placeholder: "Tapez créer par...",
    },

    // 🧠 SERVICE EMETTEUR(remplace agence SCOMAT rule)
    {
      name: "service_emetteur",
      label: "Service émetteur",
      type: "select",
      queryKey: "services",
      queryFn: async () => SERVICES,
    },
    // DATE DE CREATION (FIN)
    {
      name: "date_creation_fin",
      label: "Date création (fin)",
      type: "date",
    },
    // 📍 POSITION IPS
    {
      name: "position_ips",
      label: "Position IPS",
      type: "select",
      queryKey: "position_ips",
      queryFn: async () => POSITION_IPS,
    },
    //PO BC Client
    {
      name: "po_bc_client",
      label: "PO / BC Client",
      type: "text",
    },

    // 🔁 RELANCE
    {
      name: "relance",
      label: "Filtrer par relance",
      type: "select",
      queryKey: "relance",
      queryFn: async () => FILTER_RELANCE,
    },
  ],
];
