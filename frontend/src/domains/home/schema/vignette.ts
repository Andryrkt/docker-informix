import {
  Book,
  Calculator,
  Users,
  Wrench,
  Warehouse,
  ShoppingCart,
  PackagePlus,
  FileText,
} from "lucide-react";

export type VignetteKey =
  | "documentation"
  | "compta"
  | "rh"
  | "materiel"
  | "atelier"
  | "magasin"
  | "appro"
  | "pol";

export type VignetteConfig = {
  key: VignetteKey;
  title: string;
  //   icon : React.ReactNode;
  description?: string;
};

export const VIGNETTES: VignetteConfig[] = [
  { key: "documentation", title: "Documentation" },
  { key: "compta", title: "Comptabilité" },
  { key: "rh", title: "Ressources Humaines" },
  { key: "materiel", title: "Matériel" },
  { key: "atelier", title: "Atelier" },
  { key: "magasin", title: "Magasin" },
  { key: "appro", title: "Approvisionnement" },
  { key: "pol", title: "POL" },
];
