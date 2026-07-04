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

export const pieceJointesFields: FieldTrait[] = [
  {
    name: "pieceJointes",
    type: "dragfile",
    label: "Veuillez insérer la facture à valider *",
    multiple: true,
    maxFiles: 4,
    // pattern: "^Facture.+\\.pdf$",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
    ocrValidation: {
      targetWords: ["pamplemousse", "hajaina"], // au lieu de "pamplemousse"
      minOccurrences: 1, // au lieu de 4
      maxNormalizedDistance: 0.25, // plus strict que 0.3
    },
  },
] as const;
