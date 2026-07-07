export interface ValeurMensuelleEntry {
  value: number;
  etat: "Valide" | "En attente" | "Rejeté" | null;
}

export interface ValeurMensuelle {
  date: string;
  entries: ValeurMensuelleEntry[];
}
export interface PlanningDit {
  agence: string;
  service: string;
  id: string;
  marque: string;
  model: string;
  numSerie: string;
  numParc: string;
  casier: string;
  mois: ValeurMensuelle[];
}
