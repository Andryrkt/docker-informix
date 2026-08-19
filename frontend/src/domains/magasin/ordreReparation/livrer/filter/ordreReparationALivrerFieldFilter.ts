// ordreReparationFilters.ts
import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const ordreReparationALivrerFieldsFilters: FilterField[][] = [
  // Row 1: Agencies, Service, Urgency
  [
    {
      name: "agence_emetteur",
      label: "Agence Emetteur",
      type: "select",
      placeholder: "-- Choisir une agence --",
      queryKey: "agences_emetteur",
    },
  ],
  [
    {
      name: "agence_debiteur",
      label: "Agence débiteur",
      type: "select",
      placeholder: "-- Choisir une agence --",
      queryKey: "agences_debiteur",
    },
    {
      name: "service_debiteur",
      label: "Service débiteur",
      type: "select",
      placeholder: "-- Choisir un service --",
      queryKey: "services_debiteur",
    },
    {
      name: "niveau_urgence",
      label: "Niveau d'urgence",
      type: "select",
      placeholder: "-- Choisir un niveau --",
    },
  ],

  // Row 2: DIT, Reference, Constructeur, OR, Designation
  [
    {
      name: "numero_dit",
      label: "n° DIT",
      type: "text",
      placeholder: "ex: DIT-1234",
    },
    {
      name: "reference_piece",
      label: "Référence pièce",
      type: "text",
      placeholder: "ex: REF-5678",
    },
    {
      name: "constructeur",
      label: "Constructeur",
      type: "select",
      placeholder: "-- Choisir un constructeur --",
      queryKey: "constructeurs",
      queryFn: async () => [],
    },
  ],
  [
    {
      name: "numero_or",
      label: "n° OR",
      type: "text",
      placeholder: "ex: OR-1234",
    },
    {
      name: "designation",
      label: "Désignation",
      type: "text",
      placeholder: "ex: Pièce moteur",
    },
  ],
  [
    {
      name: "etat_or",
      label: "Etat OR",
      type: "select",
      placeholder: "-- Choisir un état --",
      options: [
        { label: "COMPLETS", value: "COMPLETS" },
        { label: "EN_COURS", value: "EN_COURS" },
        { label: "SOUMIS", value: "SOUMIS" },
        { label: "VALIDE", value: "VALIDE" },
        { label: "REJETE", value: "REJETE" },
      ],
    },
    {
      name: "type_ligne",
      label: "Type ligne",
      type: "select",
      placeholder: "-- Choisir un type --",
      options: [
        { label: "PIÈCES MAGASIN", value: "PIÈCES MAGASIN" },
        { label: "MAINTENANCE", value: "MAINTENANCE" },
        { label: "PRESTATION", value: "PRESTATION" },
      ],
    },
  ], // Row 3: Etat OR, Type ligne, Date début & fin
  [
    {
      name: "date_creation_debut",
      label: "Date de création OR (début)",
      type: "date",
    },
    {
      name: "date_creation_fin",
      label: "Date de création OR (fin)",
      type: "date",
    },
  ],
];
