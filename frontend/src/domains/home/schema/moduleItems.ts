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

export type SousMenu = {
  titreSousMenu: string;
  icon: IconDefinition;
  lien?: string;
};

export type Menu = {
  titreMenu?: string;
  icon?: IconDefinition;
  sousMenu?: SousMenu[];
  lien?: string;
};

export type ModuleModal = {
  titre?: string;
  description?: string;
  icon?: IconDefinition;

  // Menu avec plusieur sous_menus
  Menu?: Menu[];

  // Ou Direct sous_menu donc sans menu
  sousMenu?: SousMenu[];
};

export type AppModule = {
  id?: string;
  nomModule?: string;
  icon?: IconDefinition;
  moduleModal?: ModuleModal;
};

export const moduleItems: AppModule[] = [
  {
    nomModule: "Documentation",
    icon: faBook,
    moduleModal: {
      titre: "Documentation",
      icon: faBook,
      Menu: [
        {
          titreMenu: "Contrat",
          icon: faFile,
          sousMenu: [
            {
              titreSousMenu: "Nouveau contrat",
              icon: faCirclePlus,
              lien: "/documentation/contrats/nouveau-contrat",
            },
            {
              titreSousMenu: "Consultation",
              icon: faSearch,
              lien: "/documentation/contrats/liste",
            },
          ],
        },
      ],
      sousMenu: [
        {
          titreSousMenu: "Annuaire",
          icon: faAddressBook,
          lien: "/sso/annuaire",
        },
        {
          titreSousMenu: "Planning analytique HFF",
          icon: faList,
          lien: "/documentation/planning-analytique-HFF",
        },
        {
          titreSousMenu: "Document interne",
          icon: faFolderTree,
          lien: "/documentation/documentation-interne",
        },
      ],
    },
  },
  {
    nomModule: "Magasin",
    icon: faDolly,
    moduleModal: {
      titre: "Magasin",
      // description:
      //   "This is desctiption of Magasin that should give from backend",
      icon: faDolly,
      Menu: [
        {
          titreMenu: "OR",
          icon: faWarehouse,
          sousMenu: [
            {
              titreSousMenu: "Liste à traiter",
              icon: faListCheck,
              lien: "/magasin/ordre-reparation/a-traiter",
            },
            {
              titreSousMenu: "Liste à livrer",
              icon: faTruckLoading,
              lien: "/magasin/ordre-reparation/a-livrer",
            },
          ],
        },
        // {
        //   title: "CIS",
        //   icon: faFile,
        //   items: [
        //     { label: "Liste à traiter", icon: faList },
        //     { label: "Liste à traiter", icon: faFileExcel },
        //   ],
        // },
        // {
        //   title: "Inventaire",
        //   icon: faList,
        //   items: [
        //     { label: "Liste des inventaires", icon: faList },
        //     { label: "Inventaire détaillé", icon: faList },
        //   ],
        // },
        // {
        //   title: "Sortie de pieces",
        //   icon: faArrowLeft,
        //   items: [{ label: "Nouvelle demande", icon: faCirclePlus }],
        // },
        {
          titreMenu: "Dematerialisation",
          icon: faCloudUpload,
          sousMenu: [
            {
              titreSousMenu: "Devis",
              lien: "/magasin/dematerialisation/liste-devis-neg",
              icon: faList,
            },
            {
              titreSousMenu: "Planning de commande Magasin",
              icon: faCalendar,
              lien: "/magasin/dematerialisation/planning-commande-magasin",
            },
          ],
        },
        {
          sousMenu: [
            {
              titreSousMenu: "Soumission commandes fournisseur",
              icon: faList,
              lien: "/magasin/cmde-fournisseur",
            },
            // {
            //   label: "Liste des cmds non placées",
            //   icon: faList,
            //   link: "/magasin/liste-cmde-fournisseur-non-placer",
            // },
          ],
        },
      ],
    },
  },
  {
    nomModule: "Atelier",
    icon: faTools,
    moduleModal: {
      titre: "Atelier",
      description:
        "This is desctiption of Atelier that should give from backend",
      icon: faTools,
      Menu: [
        {
          titreMenu: "Demande d'intervention",
          icon: faBriefcase,
          sousMenu: [
            {
              titreSousMenu: "Nouvelle demande",
              icon: faCirclePlus,
              lien: "/atelier/demande-intervention/new",
            },
            {
              titreSousMenu: "Consultation",
              icon: faSearch,
              lien: "/atelier/demande-intervention/dit-list",
            },
            {
              titreSousMenu: "Dossier DIT",
              icon: faFolder,
              lien: "/atelier/demande-intervention/dossier-list",
            },
            { titreSousMenu: "Matrice de responsabilité", icon: faTable },
          ],
        },

        {
          titreMenu: "PLANNING",
          icon: faCalendarDays,
          sousMenu: [
            {
              titreSousMenu: "Planning detailé",
              icon: faCalendarDay,
              lien: "/atelier/demande-intervention/planning-detaille",
            },
            {
              titreSousMenu: "Planning interne Atelier",
              icon: faListCheck,
              lien: "/atelier/demande-intervention/planning-interne-atelier",
            },
            {
              titreSousMenu: "Planning",
              icon: faCalendar,
              lien: "/atelier/demande-intervention/planning-list",
            },
          ],
        },
      ],
      sousMenu: [
        {
          titreSousMenu: "Glossaire OR",
          icon: faBook,
          lien: "/atelier/demande-intervention/glossaire-or",
        },
      ],
    },
  },
  {
    nomModule: "IT",
    icon: faComputer,
    moduleModal: {
      titre: "Support IT",
      description: "This is desctiption of IT that should give from backend",
      icon: faComputer,
      Menu: [
        {
          titreMenu: "Demande support informatique",
          icon: faQuestionCircle,
          sousMenu: [
            {
              titreSousMenu: "Formulaire de demande de support",
              icon: faHandsHelping,
              lien: "/it/demande-support-informatique",
            },
          ],
        },
        {
          titreMenu: "Tickets",
          icon: faListCheck,
          sousMenu: [
            {
              titreSousMenu: "Suivi des tickets",
              icon: faListCheck,
              lien: "/it/tickets",
            },
            {
              titreSousMenu: "Diagramme de Gantt",
              icon: faChartGantt,
              lien: "/it/tickets/gantt",
            },
            {
              titreSousMenu: "Tableau de bord",
              icon: faDashboard,
              lien: "/it/tickets/dashboard",
            },
          ],
        },
      ],
    },
  },
];
