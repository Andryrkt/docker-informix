// ordreReparationFilters.ts
import type { FilterField } from "@/components/common/filter/schema/filterSchema";

export const ordreReparationATraiterFieldsFilters: FilterField[][] = [
  [
    {
      name: "agence_emetteur",
      label: "Agence Emetteur",
      type: "select",
      placeholder: "-- Choisir une agence --",
      queryKey: "agences_emetteur",
      queryFn: async () => [],
    },
  ],
  [
    {
      name: "agence_debiteur",
      label: "Agence débiteur",
      type: "select",
      placeholder: "-- Choisir une agence --",
      queryKey: "agences_debiteur",
      queryFn: async () => [],
    },
    {
      name: "service_debiteur",
      label: "Service débiteur",
      type: "select",
      placeholder: "-- Choisir un service --",
      queryKey: "services_debiteur",
      queryFn: async () => [],
    },
  ],
  [
    {
      name: "constructeur",
      label: "Constructeur",
      type: "select",
      placeholder: "-- Choisir un constructeur --",
      options: [],
    },
    {
      name: "niveau_urgence",
      label: "Niveau d'urgence",
      type: "select",
      placeholder: "-- Choisir un niveau --",
      options: [],
    },
  ],

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
      name: "piece",
      label: "Pièce",
      type: "select",
      placeholder: "-- Choisir une pièce --",
      queryKey: "pieces",
      queryFn: async () => [],
    },
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
