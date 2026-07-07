export interface Materiel {
  marque: string;
  modele: string;
  id: string; // ID du matériel
  numSerie: string;
  numParc: string;
  casier: string;
  intituleTravaux: string; // Intitulé des travaux
  numeroORItv: string; // N° OR-Itv
  datePlanning: string; // Date planning (format ISO ou string)
  cst: string;
  ref: string;
  designation: string;
}

export interface OrdreReparation {
  qteCde: number;
  qteAll: number;
  qteReliq: number;
  qteLiv: number;
  statut: string;
  dateStatut: string;
  ctrMarque: string; // Ctr Marque
  cdeFrn: string; // Cde frn
  statutCtrmrq: string; // Statut ctrmrq
}

export interface CessionInterStock {
  numCIS: string;
  qteCde: number;
  qteAll: number;
  qteRel: number;
  qteLiv: number;
  statut: string;
  dateStatut: string;
}

export interface PlanningDitDetail {
  agence: string;
  service: string;
  materiels: Materiel[]; // tableau de matériels
  ordresReparation: OrdreReparation[]; // tableau d'ordres
  cessionsInterStock: CessionInterStock[]; // tableau de cessions
  etaIvato: string; // ETA Ivato (par ex. "OK", "En cours")
  etatMagasin: string; // État magasin
  message: string; // Message
}
