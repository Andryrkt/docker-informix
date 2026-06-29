import { getAgences } from "@/domains/agence/api";
import { getNiveauUrgence } from "@/domains/niveauUrgence/api";
import {
  getReparationTypes,
  reparationRealiseParOptions,
} from "@/domains/reparation/api";
import { getServicesDebiteur } from "@/domains/service/api";

export type SelectOption = {
  label: string;
  value: string;
};

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

export type DitField =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "textarea";
      placeholder?: string;
      validate?: (value: string) => boolean;
      readOnly?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "select";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      options?: SelectOption[];
      enabled?: boolean;
      readOnly?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "date-range";
      readOnly?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "file";
    }
  | {
      name: string;
      label: string;
      type: "date";
    }
  | {
      name: string;
      label: string;
      type: "multichoice";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      options?: SelectOption[];
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "radio";
      direction?: "horizontal" | "vertical";
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      // static mode
      options?: SelectOption[];

      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "boolean";
      variant?: "switch" | "checkbox" | "radio";
      trueLabel?: string;
      falseLabel?: string;
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "file";
      placeholder?: string;
      multiple?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "multiSelect";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<SelectOption[]>;
      options?: SelectOption[];
      enabled?: boolean;
    };

export const demandeFields: DitField[] = [
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
export const traitFields: DitField[] = [
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

export const agenceServiceFields: DitField[] = [
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
export const interventionFields: DitField[] = [
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
export const reparationFields: DitField[] = [
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
export const infoClientFields: DitField[] = [
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
export const piecesJointFields: DitField[] = [
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
export const infoMaterielFields: DitField[] = [
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
