import { getAgences } from "@/domains/agence/api";
import { getServicesDebiteur } from "@/domains/service/api";

export type FilterOption = {
  label: string;
  value: string;
};
export type DitField =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "textarea";
      placeholder?: string;
      validate?: (value: string) => boolean;
    }
  | {
      name: string;
      label: string;
      type: "select";
      placeholder?: string;
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<FilterOption[]>;
      options?: FilterOption[];
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "date-range";
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
      queryFn?: () => Promise<FilterOption[]>;
      options?: FilterOption[];
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "radio";
      direction?: "horizontal" | "vertical";
      // async mode
      queryKey?: string;
      queryFn?: () => Promise<FilterOption[]>;
      // static mode
      options?: FilterOption[];

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
      queryFn?: () => Promise<FilterOption[]>;
      options?: FilterOption[];
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
    queryKey: "typeDocument",
    queryFn: () => getAgences(),
  },
  {
    name: "categorieDemande",
    label: "Catégorie demande",
    type: "select",
    queryKey: "categorieDemande",
    queryFn: () => getAgences(),
  },
  {
    name: "interneExterne",
    label: "Interne externe",
    type: "multiSelect",
    options: [
      { label: "INTERNE", value: "INTERNE" },
      { label: "EXTERNE", value: "EXTERNE" },
    ],
  },
  {
    name: "demandeDevis",
    label: "Demande de devis",
    type: "multiSelect",
    options: [
      { label: "Oui", value: "OUI" },
      { label: "Non", value: "NON" },
    ],
  },
  {
    name: "livraisonPartielle",
    label: "Livraison Partielle",
    type: "multiSelect",
    options: [
      { label: "Oui", value: "OUI" },
      { label: "Non", value: "NON" },
    ],
  },
  {
    name: "avisRecouvrement",
    label: "Avis de recouvrement",
    type: "multiSelect",
    options: [
      { label: "Oui", value: "OUI" },
      { label: "Non", value: "NON" },
    ],
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
  },

  {
    name: "serviceEmmetteur",
    label: "Service émetteur",
    type: "text",
    placeholder: "Service emetteur",
  },
];
export const interventionFields: DitField[] = [
  {
    name: "worNiveauUrgence",
    label: "Niveau d'urgence",
    type: "select",
    queryKey: "worNiveauUrgence",
    queryFn: () => getAgences(),
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
    queryFn: () => getAgences(),
  },
  {
    name: "reparationPar",
    label: "Réparation réalisé par",
    type: "select",
    queryKey: "reparationPar",
    queryFn: () => getAgences(),
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
