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
} from "lucide-react";
export const vignetteMock = [
  // {
  //   title: "Devis",
  //   icon: ShoppingCart,
  //   modal: {
  //     title: "Devis",
  //     description: "This is desctiption of devis that should give from backend",
  //     icon: ShoppingCart,
  //     sections: [
  //       {
  //         title: "Devis 1",
  //         icon: FileText,
  //         items: [
  //           { label: "Add devis 1", icon: Plus },
  //           { label: "Update devis 1", icon: Pencil },
  //         ],
  //       },
  //     ],
  //   },
  // },
  // {
  //   title: "Approvisionnement",
  //   icon: Layers,
  //   modal: {
  //     title: "Approvisionnement",
  //     description:
  //       "This is desctiption of approvisionnement that should give from backend",
  //     icon: ShoppingCart,
  //     sections: [
  //       {
  //         title: "Appro 1",
  //         icon: FileText,
  //         items: [
  //           { label: "Add appros 1", icon: Plus, link: "#url" },
  //           { label: "Update appro 2", icon: Pencil },
  //         ],
  //       },
  //       {
  //         title: "Appro 2",
  //         icon: FileText,
  //         items: [
  //           { label: "Add appro 2", icon: Plus },
  //           { label: "Update apro 2", icon: Pencil },
  //           { label: "Delete appro 3", icon: Trash2 },
  //         ],
  //       },
  //     ],
  //   },
  // },
  {
    title: "Documentation",
    icon: Book,
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
              link: "magasin/dematerialisation/liste-devis-neg",
              icon: List,
            },
            {
              label: "Planning de commande Magasin",
              icon: Calendar,
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
              link: "magasin/dematerialisation/liste-devis-neg",
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
