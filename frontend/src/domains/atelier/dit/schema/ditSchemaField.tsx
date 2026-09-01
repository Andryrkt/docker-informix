import { getAgences } from "@/domains/agence/api";
import { getNiveauUrgences } from "@/domains/niveauUrgence/niveauUrgenceApi";
import {
  reparationTypesOptions,
  reparationRealiseParOptions,
} from "@/domains/reparation/api";
import { getServicesDebiteur } from "@/domains/service/api";
import { getCategoriesDemande, getTypesDocuments } from "../api/ditApi";
import type { FieldTrait, SelectOption } from "@/schema/traitFields";
import type { Materiel } from "@/domains/materiel/schema/materielSchema";
import type { Client } from "@/domains/client/schema/clientSchema";
import i18next from "i18next";

const t = (key: string) => i18next.t(key);

const toSelectOptions = (
  items: { code: string; label: string }[],
): SelectOption[] => items.map((i) => ({ label: i.label, value: i.code }));

export const interneExterneOptions: SelectOption[] = [
  { label: "INTERNE", value: "INTERNE" },
  { label: "EXTERNE", value: "EXTERNE" },
];

const yesNoOptions: SelectOption[] = [
  { label: "Oui", value: "OUI" },
  { label: "Non", value: "NON" },
];

export const getDemandeFields = (): FieldTrait[] => [
  {
    name: "objet",
    label: "Objet",
    type: "text",
    placeholder: t("dit:objet-de-la-demande"),
    validate: (value) => value.length <= 86,
  },
  {
    name: "details",
    label: "Détails",
    type: "textarea",
    placeholder: t("dit:detail-de-la-demande"),
    maxLength: 1800,
    newlinePenalty: 130,
  },
];

export const getTraitFields = (): FieldTrait[] => [
  {
    name: "typeDocument",
    label: t("common:type-document"),
    type: "select",
    queryKey: "typeDocument",
    queryFn: () => getTypesDocuments().then(toSelectOptions),
  },
  {
    name: "categorieDemande",
    label: t("dit:categorie-demande"),
    type: "select",
    queryKey: "categorieDemande",
    queryFn: () => getCategoriesDemande().then(toSelectOptions),
  },
  {
    name: "interneExterne",
    label: t("common:interne-externe"),
    type: "multiSelect",
    options: interneExterneOptions,
  },
  {
    name: "demandeDevis",
    label: t("dit:demande-de-devis"),
    type: "multiSelect",
    options: yesNoOptions,
  },
  {
    name: "livraisonPartielle",
    label: t("dit:livraison-partielle"),
    type: "multiSelect",
    options: yesNoOptions,
  },
  {
    name: "avisRecouvrement",
    label: t("dit:avis-de-recouvrement"),
    type: "multiSelect",
    options: yesNoOptions,
  },
];

export const getAgenceAndServiceFields = (): FieldTrait[] => [
  {
    name: "agenceDebiteur",
    label: t("agence-debiteur"),
    type: "select",
    queryKey: "agences",
    queryFn: async () => [],
  },
  {
    name: "serviceDebiteur",
    label: t("service-debiteur"),
    type: "select",
    placeholder: t("selectionner-un-service"),
    queryKey: "services-debiteur",
    queryFn: async () => [],
  },
  {
    name: "agenceEmetteur",
    label: t("agence-emetteur"),
    type: "text",
    placeholder: t("agence-emetteur"),
    readOnly: true,
  },

  {
    name: "serviceEmmetteur",
    label: t("service-emetteur"),
    type: "text",
    placeholder: t("service-emetteur"),
    readOnly: true,
  },
];
export const getInterventionFields = (): FieldTrait[] => [
  {
    name: "worNiveauUrgence",
    label: t("niveau-durgence"),
    type: "select",
    queryKey: "worNiveauUrgence",
    queryFn: () => getNiveauUrgences(),
  },
  {
    name: "datePrevue",
    label: t("date-prevue-travaux"),
    type: "date",
  },
];
export const getReparationFields = (): FieldTrait[] => [
  {
    name: "typeReparation",
    label: t("type-de-reparation"),
    type: "select",
    options: reparationTypesOptions,
  },
  {
    name: "reparationPar",
    label: t("reparation-realise-par"),
    type: "select",
    options: reparationRealiseParOptions,
  },
];
export const getInfoClientFields = (): FieldTrait[] => [
  {
    name: "numClient",
    label: t("dit:numero-du-client-externe"),
    type: "dynamicSelect",
    valueField: "numClient",
    labelFields: ["numClient", "nomClient"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    placeholder: t("dit:choisir-un-n-client"),
    renderOption: (item: any) => `${item.numClient} - ${item.nomClient} `,
    renderSelected: (item: any) => item.numClient,
  },
  {
    name: "nomClient",
    label: t("dit:nom-du-client-externe"),
    type: "dynamicSelect",
    valueField: "nomClient",
    labelFields: ["numClient", "nomClient"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    placeholder: t("choisir-un-nom-client"),
    // 👇 Dropdown display
    renderOption: (item: any) => `${item.numClient} - ${item.nomClient} `,
    // 👇 Selected display (only the ID)
    renderSelected: (item: any) => item.nomClient,
  },
  {
    name: "telephoneClient",
    label: t("dit:n-telephone-externe"),
    type: "text",
    validate: (value) => value.length <= 16,
  },

  {
    name: "emailClient",
    label: t("dit:e-mail-du-client-externe"),
    type: "text",
  },
  {
    name: "clientSousContrat",
    label: t("dit:client-sous-contrat"),
    type: "multiSelect",
    options: [
      { label: t("oui"), value: "OUI" },
      { label: t("non"), value: "NON" },
    ],
  },
];
export const getPiecesJointFields = (): FieldTrait[] => [
  {
    name: "pieceJoint",
    label: t("piece-jointe"),
    type: "file",
    multiple: false,
    pattern: ".*",
    maxSize: 5 * 1024 * 1024,
    accept: "*/*",
  },
  {
    name: "pieceJoint1",
    label: t("piece-jointe-1"),
    type: "file",
    multiple: false,
    pattern: ".*",
    maxSize: 5 * 1024 * 1024,
    accept: "*/*",
  },
  {
    name: "pieceJoint2",
    label: t("piece-jointe-2"),
    type: "file",
    multiple: false,
    pattern: ".*",
    maxSize: 5 * 1024 * 1024,
    accept: "*/*",
  },
];
export const getInfoMaterielFields = (): FieldTrait[] => [
  {
    name: "idMateriel",
    label: t("id-materiel"),
    type: "dynamicSelect",
    valueField: "idMateriel",
    labelFields: ["idMateriel", "numParc", "numSerie"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    // 👇 Dropdown display
    renderOption: (item: any) =>
      `ID : ${item.idMateriel} - Parc : ${item.numParc} - S/N : ${item.numSerie}`,
    // 👇 Selected display (only the ID)
    renderSelected: (item: any) => item.idMateriel,
  },
  {
    name: "numParc",
    label: t("numero-de-parc"),
    type: "dynamicSelect",
    valueField: "numParc",
    labelFields: ["idMateriel", "numParc", "numSerie"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    // placeholder: "Choisir un n° parc",
    // 👇 Dropdown display
    renderOption: (item: any) =>
      `ID : ${item.idMateriel} - Parc : ${item.numParc} - S/N : ${item.numSerie}`,
    // 👇 Selected display (only the ID)
    renderSelected: (item: any) => item.numParc,
  },
  {
    name: "numSerie",
    label: t("numero-de-serie"),
    type: "dynamicSelect",
    valueField: "numSerie",
    labelFields: ["idMateriel", "numParc", "numSerie"],
    labelSeparator: " - ",
    clearable: true,
    clearLabel: "Aucun",
    // placeholder: "Choisir un n° serie",
    // 👇 Dropdown display
    renderOption: (item: any) =>
      `ID : ${item.idMateriel} - Parc : ${item.numParc} - S/N : ${item.numSerie}`,
    // 👇 Selected display (only the ID)
    renderSelected: (item: any) => item.numSerie,
  },
];
