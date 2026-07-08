import { getAgences } from "@/domains/agence/api";
import { getNiveauUrgence } from "@/domains/niveauUrgence/api";
import {
  getReparationTypes,
  reparationRealiseParOptions,
} from "@/domains/reparation/api";
import { getServicesDebiteur } from "@/domains/service/api";
import type { FieldTrait, SelectOption } from "@/schema/traitFields";

export const interneExterneOptions: SelectOption[] = [
  { label: "INTERNE", value: "INTERNE" },
  { label: "EXTERNE", value: "EXTERNE" },
];

export const yesNoOptions: SelectOption[] = [
  { label: "Oui", value: "OUI" },
  { label: "Non", value: "NON" },
];

// back
//  Niveau d'urgence
// reparation realisation

//
export const typeDocumentOptions: SelectOption[] = [
  { label: "Autres", value: "Autres" },
  { label: "Maintenance curative", value: "Maintenance curative" },
  { label: "Maintenance préventive", value: "Maintenance préventive" },
  { label: "Préparation vente", value: "Préparation vente" },
];

//
export const categorieDemandeOptions: SelectOption[] = [
  { label: "AUTRES", value: "AUTRES" },
  { label: "LANCEMENT SAV", value: "LANCEMENT SAV" },
  { label: "FOURNITURES PIECES", value: "FOURNITURES PIECES" },
  { label: "GARANTIE", value: "GARANTIE" },
  { label: "RECEPTION", value: "RECEPTION" },
  { label: "ENTRETIENT", value: "ENTRETIENT" },
  { label: "REPARATION", value: "REPARATION" },
];

export const demandeFields: FieldTrait[] = [
  {
    name: "object",
    label: "Objet",
    type: "text",
    placeholder: "Objet de la demande",
  },
  {
    name: "details",
    label: "Détails",
    type: "textarea",
    placeholder: "Détail de la demande",
  },
];

export const traitFields: FieldTrait[] = [
  {
    name: "typeDocument",
    label: "Type document",
    type: "select",
    options: typeDocumentOptions,
  },
  {
    name: "categorieDemande",
    label: "Catégorie demande",
    type: "select",
    queryKey: "categorieDemande",
    options: categorieDemandeOptions,
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
    queryFn: () => getAgences(),
  },
  {
    name: "serviceDebiteur",
    label: "Service débiteur",
    type: "select",
    placeholder: "Sélectionner un service",
    queryKey: "services-debiteur",
    queryFn: () => getServicesDebiteur(),
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
    queryFn: () => getNiveauUrgence(),
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
    queryKey: "typeReparation",
    queryFn: () => getReparationTypes(),
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
    type: "select",
  },
  {
    name: "nomClient",
    label: "Nom du client (*EXTERNE)",
    type: "select",
  },
  {
    name: "telephoneClient",
    label: "N° téléphone (*EXTERNE)",
    type: "text",
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
  },
  {
    name: "pieceJoint1",
    label: "Pièce jointe 1",
    type: "file",
  },
  {
    name: "pieceJoint2",
    label: "Pièce jointe 2",
    type: "file",
  },
];
export const infoMaterielFields: FieldTrait[] = [
  {
    name: "idMateriel",
    label: "Id materiel",
    type: "select",
  },
  {
    name: "numParc",
    label: "Numéro de parc",
    type: "select",
  },
  {
    name: "numSerie",
    label: "Numéro de série",
    type: "select",
  },
];
