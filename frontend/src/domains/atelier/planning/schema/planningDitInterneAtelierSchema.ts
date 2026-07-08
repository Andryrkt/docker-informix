export interface DayDetail {
  date: string; // "YYYY-MM-DD"
  heureMatin: number; // hours in the morning
  heureMidi: number; // hours in the afternoon
  total: number; // matin + apresmidi (optional, computed)
  isCheckedMatin: boolean;
  isCheckedMidi: boolean;
}
export interface PlanningDitInterneAtelier {
  id: string;
  agence: string;
  section: string;
  intitule: string;
  or: string; // N° OR
  itv: string; // Intervalle
  ressource: string;
  nbJours: number; // total number of days (base 8h)
  totalHeures: number; // sum of all day hours
  jours: DayDetail[];
}
