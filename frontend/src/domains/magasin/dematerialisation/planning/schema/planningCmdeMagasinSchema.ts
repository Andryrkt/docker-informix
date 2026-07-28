export interface ValeurMensuelleEntry {
  value: number;
  etat: "Valide" | "En attente" | "Rejeté" | null;
}

export interface ValeurMensuelle {
  date: string;
  entries: ValeurMensuelleEntry[];
}

export interface PlanningCmdeMagasin {
  COMMERCIAUX: string;
  AGENCE: string;
  SERVICE: string;
  CODE_CLIENT: string;
  NOM_CLIENT: string;
  MOIS: ValeurMensuelle[];
}
