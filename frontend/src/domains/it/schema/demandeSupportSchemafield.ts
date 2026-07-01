import { getAgences } from "@/domains/agence/api";
import { getCategories } from "@/domains/categorie/api";
import { getServicesDebiteur } from "@/domains/service/api";

export type SupportField =
  | {
      name: string;
      label: string;
      type: "text" | "number" | "textarea";
      placeholder?: string;
    }
  | {
      name: string;
      label: string;
      type: "select";
      placeholder?: string;
      queryKey: string;
      queryFn: () => Promise<{ id: number; label: string; value: string }[]>;
      enabled?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "date";
    }
  | {
      name: string;
      label: string;
      type: "file";
      placeholder?: string;
      multiple?: boolean;
    };


export const demandeFields: SupportField[] = [
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
    placeholder: "Décrivez votre demande",
  },
];

export const agenceServiceFields: SupportField[] = [
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

export const dateCategorieFields: SupportField[] = [
  {
    name: "categorie",
    label: "Catégorie",
    type: "select",
    placeholder: "Sélectionner une catégorie",
    queryKey: "categories",
    queryFn: getCategories,
  },
  {
    name: "dateFinSouhaite",
    label: "Date de fin souhaitée",
    type: "date",
  },
];

export const parcSocieteFields: SupportField[] = [
  {
    name: "parcInformatique",
    label: "Parc informatique",
    type: "text",
    placeholder: "Décrire le parc informatique",
  },
  {
    name: "codeSociete",
    label: "Code société",
    type: "text",
    placeholder: "Entrer le code société",
  },
];
export const pieceJointeFields: SupportField[] = [
  {
    name: "pieceJointes",
    label: "Pièces jointes",
    type: "file",
    placeholder: "Importer un ou plusieurs fichiers",
    multiple: true,
  },
];
