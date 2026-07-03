import { max_size_upload_file, type FieldTrait } from "@/schema/traitFields";

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

export const pieceJointeFields: FieldTrait[] = [
  {
    name: "pieceJointe1",
    type: "dragfile",
    label: "Veuillez insérer l'OR à valider *",
    multiple: false,
    pattern: "^Ordre de réparation.+\\.pdf$",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    name: "pieceJointe2",
    type: "dragfile",
    label: "Veuillez insérer le devis à fusionner avec l'OR",
    multiple: false,
    pattern: "^DEVIS.+\\.pdf$",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    name: "pieceJointe3",
    type: "dragfile",
    label:
      "Veuillez insérer le BC ou autre document à fusionner avec l'OR (si existant)",
    multiple: false,
    pattern: "^BC.+\\.pdf$",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    name: "pieceJointe4",
    type: "dragfile",
    label: "Veuillez insérer le document à fusionner avec l'OR (si existant)",
    multiple: true,
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
] as const;

export const observationFields: FieldTrait[] = [
  {
    name: "observation",
    type: "textarea",
    label: "Observation",
  },
];
