import { max_size_upload_file, type FieldTrait } from "@/schema/traitFields";

export const bonCommandeFields: FieldTrait[] = [
  {
    name: "numeroBonCommande",
    type: "text",
    label: "N° bon de commande",
  },
  {
    name: "dateBonCommande",
    type: "date",
    label: "Date bon de commande",
  },
];
export const clientFields: FieldTrait[] = [
  {
    name: "client",
    type: "text",
    label: "Client *",
  },
  {
    name: "emailClient",
    type: "text",
    label: "Email client",
  },
];
export const devisFields: FieldTrait[] = [
  {
    name: "numeroDevis",
    type: "text",
    label: "N° devis",
    readOnly: true,
  },
  {
    name: "statutDevis",
    type: "text",
    label: "Statut devis",
    readOnly: true,
  },
  {
    name: "date",
    type: "date",
    label: "Date",
    readOnly: true,
  },
  {
    name: "dateDevis",
    type: "date",
    label: "Date de soumission du devis",
    readOnly: true,
  },
  {
    name: "montantDevis",
    type: "text",
    label: "Montant devis",
    readOnly: true,
  },
  {
    name: "numeroDit",
    type: "text",
    label: "N° DIT",
    readOnly: true,
  },
];

export const detailsFields: FieldTrait[] = [
  {
    name: "description",
    type: "textarea",
    label: "Description du bon de commande",
  },
];
export const pieceJointeFields: FieldTrait[] = [
  {
    name: "pieceJointe",
    type: "dragfile",
    label: "Veuillez insérer le devis à valider *",
    multiple: false,
    pattern: "^BC-.+",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
];
