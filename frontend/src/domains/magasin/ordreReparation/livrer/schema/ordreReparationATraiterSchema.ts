import type { Materiel } from "@/domains/materiel/schema/materielSchema";

// Define a strict type for urgency levels (similar to your "etat" enum)
export type NiveauUrgence = "P1" | "P2" | "P3" | "P4" | "P5" | null;

export interface OrAtraiterlignes {
  numeroLigne: number | null;
  constructeur: string | null;
  reference: string | null;
  designation: string | null;
  quantiteDemander: number;
  utilisateur: string | null;
}

export interface OrdreReparationATraiter {
  numeroDit: string; // N° DIT (required)
  numeroOr: string; // N° OR (required)
  datePlanning: string | null; // Date planning (ISO string YYYY-MM-DD)
  niveauUrgence: NiveauUrgence; // Niv. d'urg
  dateOr: string | null; // Date OR (ISO string YYYY-MM-DD)
  agenceEmetteur: string; // Agence Emetteur (required)
  serviceEmetteur: string | null; // Service Emetteur
  agenceDebiteur: string; // Agence débiteur (required)
  serviceDebiteur: string | null; // Service débiteur
  numeroItv: string | null;
  materiel?: Materiel | null;
  lignes: OrAtraiterlignes[];
}
