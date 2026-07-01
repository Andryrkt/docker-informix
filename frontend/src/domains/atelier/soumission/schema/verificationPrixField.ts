import type { FieldTrait } from "@/schema/traitFields";
import { TACHE_PARTS_MANAGER_OPTIONS } from "../constant/soumissionConstants";

export const ditFields: FieldTrait[] = [
  {
    name: "numeroDit",
    type: "text",
    label: "Numéro DIT",
    readOnly: true,
  },
  {
    name: "numeroDevis",
    type: "text",
    label: "Numéro devis *",
    readOnly: true,
  },
];
export const verificationPrixFields: FieldTrait[] = [
  {
    name: "tachePartsManager",
    type: "radio",
    label: "Tâche à faire par le Parts Manager *",
    options: TACHE_PARTS_MANAGER_OPTIONS,
  },
  {
    name: "pieceJointe",
    type: "dragfile",
    label: "Veuillez insérer le devis à valider *",
  },
] as const;
