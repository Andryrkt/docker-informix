import type { FilterField } from "@/components/common/filter/schema/filterSchema";
import { getClientOptions } from "@/domains/client/api/clientApi";

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

export const devisFieldfilter: FilterField[][] = [
  [
    // 📄 IDENTIFIANTS
    {
      name: "numero_devis",
      label: "Numéro de devis",
      type: "text",
    },
    {
      name: "code_client",
      label: "Code client",
      type: "select",
      queryKey: "clients",
      queryFn: getClientOptions,
    },

    // 🔁 RELANCE
    {
      name: "relance",
      label: "Filtrer par relance",
      type: "select",
      queryKey: "type_relance",
      queryFn: async () => FILTER_RELANCE,
    },
  ],
  [
    {
      name: "soumis_par",
      label: "Soumis par",
      type: "text",
    },
    {
      name: "creer_par",
      label: "Créer par",
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
    },
    {
      name: "service_emetteur",
      label: "Service émetteur",
      type: "select",
      queryKey: "services_emetteur",
    },
  ],
  [
    // 📅 DATES debut
    {
      name: "date_creation_debut",
      label: "Date création (début)",
      type: "date",
    },
    // DATE DE CREATION (FIN)
    {
      name: "date_creation_fin",
      label: "Date création (fin)",
      type: "date",
    },
  ],
  [
    // 📊 STATUT DEVIS
    {
      name: "statut_devis",
      label: "Statut devis",
      type: "select",
    },
    // 📍 POSITION IPS
    {
      name: "position_ips",
      label: "Position IPS",
      type: "select",
    },
  ],

  [
    // 📊 STATUT BC
    {
      name: "statut_bc",
      label: "Statut BC",
      type: "select",
    },
    //PO BC Client
    {
      name: "po_bc_client",
      label: "PO / BC Client",
      type: "text",
    },
  ],
];
