import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  ShoppingCart,
  Layers,
  StoreIcon,
  Calendar,
  CloudUpload,
  Warehouse,
  ListChecks,
  List,
  FileSpreadsheet,
  Computer,
  HelpCircle,
  HandHelping,
  Book,
  Search,
  CirclePlus,
  Contact,
  FolderTree,
  ListTree,
  Wrench,
  BriefcaseBusiness,
  Folders,
  Grid3x3,
} from "lucide-react";
import type { ModalData } from "../components/VignetteModal";
export const vignetteMock = [
  {
    title: "Documentation",
    icon: Book,
    modal: {
      title: "Documentation",
      icon: Book,
      sections: [
        {
          title: "Contrat",
          icon: FileText,
          items: [
            {
              label: "Nouveau contrat",
              icon: CirclePlus,
              link: "/documentation/contrats/nouveau-contrat",
            },
            {
              label: "Consultation",
              icon: Search,
              link: "/documentation/contrats/liste",
            },
          ],
        },
      ],
      items: [
        { label: "Annuaire", icon: Contact, link: "/sso/annuaire" },
        {
          label: "Planning analytique HFF",
          icon: ListTree,
          link: "/documentation/planning-analytique-HFF",
        },
        {
          label: "Document interne",
          icon: FolderTree,
          link: "/documentation/documentation-interne",
        },
      ],
    },
  },
  {
    title: "Magasin",
    icon: StoreIcon,
    modal: {
      title: "Magasin",
      description:
        "This is desctiption of Magasin that should give from backend",
      icon: StoreIcon,
      sections: [
        {
          title: "OR",
          icon: Warehouse,
          items: [
            { label: "Liste à traiter", icon: ListChecks },
            { label: "Liste à livrer", icon: ListChecks },
          ],
        },
        {
          title: "Dematerialisation",
          icon: CloudUpload,
          items: [
            {
              label: "Devis",
              link: "/magasin/dematerialisation/liste-devis-neg",
              icon: List,
            },
            {
              label: "Planning de commande Magasin",
              icon: Calendar,
              link: "/magasin/dematerialisation/planning-commande",
            },
          ],
        },
        {
          title: "CIS",
          icon: FileText,
          items: [
            { label: "Liste à traiter", icon: List },
            { label: "Liste à traiter", icon: FileSpreadsheet },
          ],
        },
        {
          title: "Inventaire",
          icon: List,
          items: [
            { label: "Liste des inventaires", icon: List },
            { label: "Inventaire détaillé", icon: ListChecks },
          ],
        },
      ],
    },
  },
  {
    title: "Atelier",
    icon: Wrench,
    modal: {
      title: "Atelier",
      description:
        "This is desctiption of Atelier that should give from backend",
      icon: Wrench,
      sections: [
        {
          title: "Demande d'intervention",
          icon: BriefcaseBusiness,
          items: [
            {
              label: "Nouvelle demande",
              icon: CirclePlus,
              link: "/atelier/demande-intervention/new",
            },
            {
              label: "Consultation",
              icon: Search,
              link: "/atelier/demande-intervention/dit-list",
            },
            {
              label: "Dossier DIT",
              icon: Folders,
              link: "/atelier/demande-intervention/dossier-list",
            },
            { label: "Matrice de responsabilité", icon: Grid3x3 },
          ],
        },
      ],
      items: [
        {
          label: "Glossaire OR",
          icon: ListChecks,
          link: "/atelier/demande-intervention/glossaire-or",
        },
        {
          label: "Planning detailé",
          icon: ListChecks,
          link: "/atelier/demande-intervention/planning-detaille",
        },
        {
          label: "Planning interne Atelier",
          icon: ListChecks,
          link: "/atelier/demande-intervention/planning-interne-atelier",
        },
        {
          label: "Planning",
          icon: ListChecks,
          link: "/atelier/demande-intervention/planning-list",
        },
      ],
    },
  },
  {
    title: "IT",
    icon: Computer,
    modal: {
      title: "Support IT",
      description: "This is desctiption of IT that should give from backend",
      icon: Computer,
      sections: [
        {
          title: "Demande support informatique",
          icon: HelpCircle,
          items: [
            {
              label: "Formulaire de demande de support",
              icon: HandHelping,
              link: "/it/demande-support-informatique",
            },
          ],
        },
      ],
    },
  },
];
