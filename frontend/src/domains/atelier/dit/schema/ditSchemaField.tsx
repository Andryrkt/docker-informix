import { getAgences } from "@/domains/agence/api";
import { getNiveauUrgences } from "@/domains/niveauUrgence/niveauUrgenceApi";
import {
  reparationTypesOptions,
  reparationRealiseParOptions,
} from "@/domains/reparation/api";
import { getServicesDebiteur } from "@/domains/service/api";
import { fetchCategoriesDemande, fetchTypesDocument } from "../api/ditApi";
import type { FieldTrait, SelectOption } from "@/schema/traitFields";
import type { Materiel } from "@/domains/materiel/schema/materielSchema";
import type { Client } from "@/domains/client/schema/clientSchema";

const toSelectOptions = (
  items: { code: string; label: string }[],
): SelectOption[] => items.map((i) => ({ label: i.label, value: i.code }));

export const interneExterneOptions: SelectOption[] = [
  { label: "INTERNE", value: "INTERNE" },
  { label: "EXTERNE", value: "EXTERNE" },
];

export const yesNoOptions: SelectOption[] = [
  { label: "Oui", value: "OUI" },
  { label: "Non", value: "NON" },
];

export const demandeFields: FieldTrait[] = [
  {
    name: "objet",
    label: "Objet",
    type: "text",
    placeholder: "Objet de la demande",
    validate: (value) => value.length <= 86,
  },
  {
    name: "details",
    label: "Détails",
    type: "textarea",
    placeholder: "Détail de la demande",
    maxLength: 1800,
    newlinePenalty: 130,
  },
];

export const traitFields: FieldTrait[] = [
  {
    name: "typeDocument",
    label: "Type document",
    type: "select",
    queryKey: "typeDocument",
    queryFn: () => fetchTypesDocument().then(toSelectOptions),
  },
  {
    name: "categorieDemande",
    label: "Catégorie demande",
    type: "select",
    queryKey: "categorieDemande",
    queryFn: () => fetchCategoriesDemande().then(toSelectOptions),
  },
  {
    name: "interneExterne",
    label: "Interne externe",
    type: "multiSelect",
    options: interneExterneOptions,
  },
  {
    name: "demandeDevis",
    label: "Demande de devis",
    type: "multiSelect",
    options: yesNoOptions,
  },
  {
    name: "livraisonPartielle",
    label: "Livraison Partielle",
    type: "multiSelect",
    options: yesNoOptions,
  },
  {
    name: "avisRecouvrement",
    label: "Avis de recouvrement",
    type: "multiSelect",
    options: yesNoOptions,
  },
];

export const agenceAndServiceFields: FieldTrait[] = [
  {
    name: "agenceDebiteur",
    label: "Agence débiteur",
    type: "select",
    queryKey: "agences",
    queryFn: async () => [],
  },
  {
    name: "serviceDebiteur",
    label: "Service débiteur",
    type: "select",
    placeholder: "Sélectionner un service",
    queryKey: "services-debiteur",
    queryFn: async () => [],
  },
  {
    name: "agenceEmetteur",
    label: "Agence émetteur",
    type: "text",
    placeholder: "Agence emetteur",
    readOnly: true,
  },

  {
    name: "serviceEmmetteur",
    label: "Service émetteur",
    type: "text",
    placeholder: "Service emetteur",
    readOnly: true,
  },
];
export const interventionFields: FieldTrait[] = [
  {
    name: "worNiveauUrgence",
    label: "Niveau d'urgence",
    type: "select",
    queryKey: "worNiveauUrgence",
    queryFn: () => getNiveauUrgences(),
  },
  {
    name: "datePrevue",
    label: "Date prévue travaux",
    type: "date",
  },
];
export const reparationFields: FieldTrait[] = [
  {
    name: "typeReparation",
    label: "Type de reparation",
    type: "select",
    options: reparationTypesOptions,
  },
  {
    name: "reparationPar",
    label: "Réparation réalisé par",
    type: "select",
    options: reparationRealiseParOptions,
  },
];
export const infoClientFields: FieldTrait[] = [
  {
    name: "numClient",
    label: "Numéro du client (*EXTERNE)",
    type: "dynamicSelect",
    valueField: "numClient",
    labelFields: ["numClient", "nomClient"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    placeholder: "Choisir un n° client",
    // 👇 Dropdown display
    renderOption: (item: Client) => `${item.numClient} - ${item.nomClient} `,
    // 👇 Selected display (only the ID)
    renderSelected: (item: Client) => item.numClient,
  },
  {
    name: "nomClient",
    label: "Nom du client (*EXTERNE)",
    type: "dynamicSelect",
    valueField: "nomClient",
    labelFields: ["numClient", "nomClient"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    placeholder: "Choisir un nom client",
    // 👇 Dropdown display
    renderOption: (item: Client) => `${item.numClient} - ${item.nomClient} `,
    // 👇 Selected display (only the ID)
    renderSelected: (item: Client) => item.nomClient,
  },
  {
    name: "telephoneClient",
    label: "N° téléphone (*EXTERNE)",
    type: "text",
    validate: (value) => value.length <= 16,
  },

  {
    name: "emailClient",
    label: "E-mail du client (*EXTERNE)",
    type: "text",
  },
  {
    name: "clientSousContrat",
    label: "Client sous contrat",
    type: "multiSelect",
    options: [
      { label: "Oui", value: "OUI" },
      { label: "Non", value: "NON" },
    ],
  },
];
export const piecesJointFields: FieldTrait[] = [
  {
    name: "pieceJoint",
    label: "Pièce jointe",
    type: "file",
    multiple: false, // ✅ Added
    pattern: ".*", // ✅ Added (matches any file)
    maxSize: 5 * 1024 * 1024, // ✅ Added (5 MB)
    accept: "*/*", // ✅ Added (all file types)
  },
  {
    name: "pieceJoint1",
    label: "Pièce jointe 1",
    type: "file",
    multiple: false,
    pattern: ".*",
    maxSize: 5 * 1024 * 1024,
    accept: "*/*",
  },
  {
    name: "pieceJoint2",
    label: "Pièce jointe 2",
    type: "file",
    multiple: false,
    pattern: ".*",
    maxSize: 5 * 1024 * 1024,
    accept: "*/*",
  },
];
export const infoMaterielFields: FieldTrait[] = [
  {
    name: "idMateriel",
    label: "Id materiel",
    type: "dynamicSelect",
    valueField: "idMateriel",
    labelFields: ["idMateriel", "numParc", "numSerie"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    placeholder: "Choisir un matériel",
    // 👇 Dropdown display
    renderOption: (item: Materiel) =>
      `ID : ${item.idMateriel} - Parc : ${item.numParc} - S/N : ${item.numSerie}`,
    // 👇 Selected display (only the ID)
    renderSelected: (item: Materiel) => item.idMateriel,
  },
  {
    name: "numParc",
    label: "Numéro de parc",
    type: "dynamicSelect",
    valueField: "numParc",
    labelFields: ["idMateriel", "numParc", "numSerie"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    // placeholder: "Choisir un n° parc",
    // 👇 Dropdown display
    renderOption: (item: Materiel) =>
      `ID : ${item.idMateriel} - Parc : ${item.numParc} - S/N : ${item.numSerie}`,
    // 👇 Selected display (only the ID)
    renderSelected: (item: Materiel) => item.numParc,
  },
  {
    name: "numSerie",
    label: "Numéro de série",
    type: "dynamicSelect",
    valueField: "numSerie",
    labelFields: ["idMateriel", "numParc", "numSerie"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    // placeholder: "Choisir un n° serie",
    // 👇 Dropdown display
    renderOption: (item: Materiel) =>
      `ID : ${item.idMateriel} - Parc : ${item.numParc} - S/N : ${item.numSerie}`,
    // 👇 Selected display (only the ID)
    renderSelected: (item: Materiel) => item.numSerie,
  },
];
