import { max_size_upload_file, type FieldTrait } from "@/schema/traitFields";
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

export const verificationFields: FieldTrait[] = [
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
    multiple: false,
    pattern: "^DEVIS-.+",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
] as const;

export const validationFields: FieldTrait[] = [
  {
    name: "pieceJointe",
    type: "dragfile",
    label: "Veuillez insérer le devis à valider *",
    multiple: false,
    pattern: "^ATELIER-.+",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
] as const;
