import {
  faBook,
  faFile,
  faCirclePlus,
  faSearch,
  faFolderTree,
  faWarehouse,
  faListCheck,
  faCloudUpload,
  faList,
  faCalendar,
  faFileExcel,
  faComputer,
  faQuestionCircle,
  faHandsHelping,
  faBriefcase,
  faFolder,
  faDolly,
  faTools,
  faAddressBook,
  faGridHorizontal,
  faChartGantt,
  faDashboard,
  faCalendarDay,
  faTable,
  type IconDefinition,
  faCalendarDays,
  faDollyFlatbed,
  faTruckLoading,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";

export type VignetteItem = {
  label: string;
  icon: IconDefinition;
  link?: string;
};

export type VignetteSection = {
  title?: string;
  icon?: IconDefinition;
  items?: VignetteItem[];
};

export type VignetteModal = {
  title?: string;
  description?: string;
  icon?: IconDefinition;
  sections?: VignetteSection[];
  items?: VignetteItem[];
};

export type VignetteCardData = {
  title?: string;
  icon?: IconDefinition;
  modal?: VignetteModal;
};

export const vignetteItems: VignetteCardData[] = [
  {
    title: "Documentation",
    icon: faBook,
    modal: {
      title: "Documentation",
      icon: faBook,
      sections: [
        {
          title: "Contrat",
          icon: faFile,
          items: [
            {
              label: "Nouveau contrat",
              icon: faCirclePlus,
              link: "/documentation/contrats/nouveau-contrat",
            },
            {
              label: "Consultation",
              icon: faSearch,
              link: "/documentation/contrats/liste",
            },
          ],
        },
      ],
      items: [
        { label: "Annuaire", icon: faAddressBook, link: "/sso/annuaire" },
        {
          label: "Planning analytique HFF",
          icon: faList,
          link: "/documentation/planning-analytique-HFF",
        },
        {
          label: "Document interne",
          icon: faFolderTree,
          link: "/documentation/documentation-interne",
        },
      ],
    },
  },
  {
    title: "Magasin",
    icon: faDolly,
    modal: {
      title: "Magasin",
      // description:
      //   "This is desctiption of Magasin that should give from backend",
      icon: faDolly,
      sections: [
        {
          title: "OR",
          icon: faWarehouse,
          items: [
            {
              label: "Liste à traiter",
              icon: faListCheck,
              link: "/magasin/ordre-reparation/a-traiter",
            },
            {
              label: "Liste à livrer",
              icon: faTruckLoading,
              link: "/magasin/ordre-reparation/a-livrer",
            },
          ],
        },
        {
          title: "CIS",
          icon: faFile,
          items: [
            { label: "Liste à traiter", icon: faList },
            { label: "Liste à traiter", icon: faFileExcel },
          ],
        },
        {
          title: "Inventaire",
          icon: faList,
          items: [
            { label: "Liste des inventaires", icon: faList },
            { label: "Inventaire détaillé", icon: faList },
          ],
        },
        {
          title: "Sortie de pieces",
          icon: faArrowLeft,
          items: [{ label: "Nouvelle demande", icon: faCirclePlus }],
        },
        {
          title: "Dematerialisation",
          icon: faCloudUpload,
          items: [
            {
              label: "Devis",
              link: "/magasin/dematerialisation/liste-devis-neg",
              icon: faList,
            },
            {
              label: "Planning de commande Magasin",
              icon: faCalendar,
              link: "/magasin/dematerialisation/planning-commande-magasin",
            },
          ],
        },
        {
          items: [
            {
              label: "Soumission commandes fournisseur",
              icon: faList,
              link: "/magasin/cmde-fournisseur",
            },
            {
              label: "Liste des cmds non placées",
              icon: faList,
              link: "/magasin/liste-cmde-fournisseur-non-placer",
            },
          ],
        },
      ],
    },
  },
  {
    title: "Atelier",
    icon: faTools,
    modal: {
      title: "Atelier",
      description:
        "This is desctiption of Atelier that should give from backend",
      icon: faTools,
      sections: [
        {
          title: "Demande d'intervention",
          icon: faBriefcase,
          items: [
            {
              label: "Nouvelle demande",
              icon: faCirclePlus,
              link: "/atelier/demande-intervention/new",
            },
            {
              label: "Consultation",
              icon: faSearch,
              link: "/atelier/demande-intervention/dit-list",
            },
            {
              label: "Dossier DIT",
              icon: faFolder,
              link: "/atelier/demande-intervention/dossier-list",
            },
            { label: "Matrice de responsabilité", icon: faTable },
          ],
        },

        {
          title: "PLANNING",
          icon: faCalendarDays,
          items: [
            {
              label: "Planning detailé",
              icon: faCalendarDay,
              link: "/atelier/demande-intervention/planning-detaille",
            },
            {
              label: "Planning interne Atelier",
              icon: faListCheck,
              link: "/atelier/demande-intervention/planning-interne-atelier",
            },
            {
              label: "Planning",
              icon: faCalendar,
              link: "/atelier/demande-intervention/planning-list",
            },
          ],
        },
      ],
      items: [
        {
          label: "Glossaire OR",
          icon: faBook,
          link: "/atelier/demande-intervention/glossaire-or",
        },
      ],
    },
  },
  {
    title: "IT",
    icon: faComputer,
    modal: {
      title: "Support IT",
      description: "This is desctiption of IT that should give from backend",
      icon: faComputer,
      sections: [
        {
          title: "Demande support informatique",
          icon: faQuestionCircle,
          items: [
            {
              label: "Formulaire de demande de support",
              icon: faHandsHelping,
              link: "/it/demande-support-informatique",
            },
          ],
        },
        {
          title: "Tickets",
          icon: faListCheck,
          items: [
            {
              label: "Suivi des tickets",
              icon: faListCheck,
              link: "/it/tickets",
            },
            {
              label: "Diagramme de Gantt",
              icon: faChartGantt,
              link: "/it/tickets/gantt",
            },
            {
              label: "Tableau de bord",
              icon: faDashboard,
              link: "/it/tickets/dashboard",
            },
          ],
        },
      ],
    },
  },
];
