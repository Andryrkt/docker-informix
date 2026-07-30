import { TACHE_PARTS_MANAGER_OPTIONS } from "@/domains/atelier/soumission/constant/soumissionConstants";
import {
  max_size_upload_file,
  type FieldTrait,
  type SelectOption,
} from "@/schema/traitFields";

export const TACHE_VALIDATEUR: SelectOption[] = [
  { label: "Vérification prix", value: "Vérification prix" },
  { label: "Insertion remise", value: "Insertion remise" },
  {
    label: "Verification de prix et insertion remise",
    value: "Verification de prix et insertion remise",
  },
  { label: "Modification entête", value: "Modification entête" },
  { label: "Modification statut", value: "Modification statut" },
  {
    label: "Modification tarif (type AMSA/COLAS)",
    value: "Modification tarif (type AMSA/COLAS)",
  },
  {
    label: "Insertition ligne transport",
    value: "Insertition ligne transport",
  },
] as const;

const yesNoOptions: SelectOption[] = [
  {
    label: "OUI - Envoyer le devis pour vérification au Parts Manager",
    value: true,
  },
  {
    label:
      "NON - Devis autovalidé, il ne passe pas au Parts Manager pour vérification",
    value: false,
  },
];

export const devisField: FieldTrait[] = [
  {
    name: "numeroDevis",
    type: "text",
    label: "Numéro devis *",
    readOnly: true,
  },
];

export const verificationPrixDevisFields: FieldTrait[] = [
  {
    name: "validationPm",
    type: "radio",
    label: "Envoyer à validation au PM *",
    options: yesNoOptions,
  },
  {
    name: "tacheValidateur",
    type: "multichoice",
    label: "Tâche du validateur *",
    options: TACHE_VALIDATEUR,
  },
  {
    name: "observation",
    type: "textarea",
    label: "Observation",
  },
] as const;

export const pieceJointesVerificationPrixDevixFields: FieldTrait[] = [
  {
    name: "pieceJointeDevis",
    type: "dragfile",
    label: "Veuillez insérer le devis *",
    multiple: false,
    pattern: "^DEVIS-.+",
    maxSize: max_size_upload_file,
    accept: ".pdf,.doc,.docx,image/*",
  },
  {
    name: "pieceJointeExcel",
    type: "dragfile",
    label: "Veuillez insérer le fichier Excel",
    multiple: false,
    maxSize: max_size_upload_file,
    accept: ".xls,.xlsx,.csv",
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
