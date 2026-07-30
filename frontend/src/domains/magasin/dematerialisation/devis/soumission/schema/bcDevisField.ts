import { max_size_upload_file, type FieldTrait } from "@/schema/traitFields";

export const devisAndBcField: FieldTrait[] = [
  {
    name: "numeroDevis",
    type: "text",
    label: "Numéro devis *",
    readOnly: true,
  },
  {
    name: "numeroBc",
    type: "text",
    label: "Numéro BC client *",
  },
  {
    name: "dateBc",
    type: "date",
    label: "Date BC *",
  },
  {
    name: "montantBc",
    type: "text",
    label: "Montant BC *",
  },
];
export const devisBcPieceJointes: FieldTrait[] = [
  {
    name: "pieceJointeBc",
    type: "dragfile",
    label: "Veuillez insérer le BC *",
    multiple: false,
    pattern: "^BC-.+",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    name: "pieceJointes",
    type: "dragfile",
    label: "Insérer les autres fichiers ici",
    multiple: true,
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
];
export const observationFields: FieldTrait[] = [
  {
    name: "observation",
    type: "textarea",
    label: "Observation",
  },
];
