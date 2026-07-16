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
  GanttChartSquare,
  LayoutDashboard,
  Wrench,
  BriefcaseBusiness,
  Folders,
  Grid3x3,
} from "lucide-react";

/**
 * vignetteMock — static structure with i18n keys.
 *
 * - `titleKey`: matches the top-level key in vignette.json (e.g. "documentation")
 * - All `title`, `label`, and `description` values here are i18n keys resolved
 *   at render time in the components using useTranslation("vignette").
 *
 * Key convention: "vignetteKey.title", "vignetteKey.sections.sectionKey.title",
 *                 "vignetteKey.sections.sectionKey.items.itemKey"
 */
export const vignetteMock = [
  {
    titleKey: "documentation",
    // kept for non-translated contexts; components should use tv(`${titleKey}.title`)
    title: "Documentation",
    icon: Book,
    modal: {
      titleKey: "documentation",
      title: "Documentation",
      icon: Book,
      sections: [
        {
          titleKey: "documentation.sections.contrat",
          title: "Contrat",
          icon: FileText,
          items: [
            {
              labelKey: "documentation.sections.contrat.items.nouveau-contrat",
              label: "Nouveau contrat",
              icon: CirclePlus,
              link: "/documentation/contrats/nouveau-contrat",
            },
            {
              labelKey: "documentation.sections.contrat.items.consultation",
              label: "Consultation",
              icon: Search,
              link: "/documentation/contrats/liste",
            },
          ],
        },
      ],
      items: [
        {
          labelKey: "documentation.items.annuaire",
          label: "Annuaire",
          icon: Contact,
          link: "/sso/annuaire",
        },
        {
          labelKey: "documentation.items.planning-analytique",
          label: "Planning analytique HFF",
          icon: ListTree,
          link: "/documentation/planning-analytique-HFF",
        },
        {
          labelKey: "documentation.items.document-interne",
          label: "Document interne",
          icon: FolderTree,
          link: "/documentation/documentation-interne",
        },
      ],
    },
  },
  {
    titleKey: "magasin",
    title: "Magasin",
    icon: StoreIcon,
    modal: {
      titleKey: "magasin",
      title: "Magasin",
      icon: StoreIcon,
      sections: [
        {
          titleKey: "magasin.sections.or",
          title: "OR",
          icon: Warehouse,
          items: [
            {
              labelKey: "magasin.sections.or.items.liste-traiter",
              label: "Liste à traiter",
              icon: ListChecks,
              link: "/magasin/ordre-reparation/traiter",
            },
            {
              labelKey: "magasin.sections.or.items.liste-livrer",
              label: "Liste à livrer",
              icon: ListChecks,
              link: "/magasin/ordre-reparation/livrer",
            },
          ],
        },
        {
          titleKey: "magasin.sections.dematerialisation",
          title: "Dematerialisation",
          icon: CloudUpload,
          items: [
            {
              labelKey: "magasin.sections.dematerialisation.items.devis",
              label: "Devis",
              link: "/magasin/dematerialisation/liste-devis-neg",
              icon: List,
            },
            {
              labelKey:
                "magasin.sections.dematerialisation.items.planning-commande",
              label: "Planning de commande Magasin",
              icon: Calendar,
              link: "/magasin/dematerialisation/planning-commande",
            },
          ],
        },
        {
          titleKey: "magasin.sections.cis",
          title: "CIS",
          icon: FileText,
          items: [
            {
              labelKey: "magasin.sections.cis.items.liste-traiter",
              label: "Liste à traiter",
              icon: List,
            },
            {
              labelKey: "magasin.sections.cis.items.liste-spreadsheet",
              label: "Liste à traiter",
              icon: FileSpreadsheet,
            },
          ],
        },
        {
          titleKey: "magasin.sections.inventaire",
          title: "Inventaire",
          icon: List,
          items: [
            {
              labelKey: "magasin.sections.inventaire.items.liste",
              label: "Liste des inventaires",
              icon: List,
            },
            {
              labelKey: "magasin.sections.inventaire.items.detaille",
              label: "Inventaire détaillé",
              icon: ListChecks,
            },
          ],
        },
      ],
    },
  },
  {
    titleKey: "atelier",
    title: "Atelier",
    icon: Wrench,
    modal: {
      titleKey: "atelier",
      title: "Atelier",
      icon: Wrench,
      sections: [
        {
          titleKey: "atelier.sections.demande-intervention",
          title: "Demande d'intervention",
          icon: BriefcaseBusiness,
          items: [
            {
              labelKey:
                "atelier.sections.demande-intervention.items.nouvelle-demande",
              label: "Nouvelle demande",
              icon: CirclePlus,
              link: "/atelier/demande-intervention/new",
            },
            {
              labelKey:
                "atelier.sections.demande-intervention.items.consultation",
              label: "Consultation",
              icon: Search,
              link: "/atelier/demande-intervention/dit-list",
            },
            {
              labelKey:
                "atelier.sections.demande-intervention.items.dossier-dit",
              label: "Dossier DIT",
              icon: Folders,
              link: "/atelier/demande-intervention/dossier-list",
            },
            {
              labelKey:
                "atelier.sections.demande-intervention.items.matrice-responsabilite",
              label: "Matrice de responsabilité",
              icon: Grid3x3,
            },
          ],
        },
      ],
      items: [
        {
          labelKey: "atelier.items.glossaire-or",
          label: "Glossaire OR",
          icon: ListChecks,
          link: "/atelier/demande-intervention/glossaire-or",
        },
        {
          labelKey: "atelier.items.planning-detaille",
          label: "Planning détaillé",
          icon: ListChecks,
          link: "/atelier/demande-intervention/planning-detaille",
        },
        {
          labelKey: "atelier.items.planning-interne-atelier",
          label: "Planning interne Atelier",
          icon: ListChecks,
          link: "/atelier/demande-intervention/planning-interne-atelier",
        },
        {
          labelKey: "atelier.items.planning",
          label: "Planning",
          icon: ListChecks,
          link: "/atelier/demande-intervention/planning-list",
        },
      ],
    },
  },
  {
    titleKey: "it",
    title: "IT",
    icon: Computer,
    modal: {
      titleKey: "it",
      title: "Support IT",
      icon: Computer,
      sections: [
        {
          titleKey: "it.sections.demande-support",
          title: "Demande support informatique",
          icon: HelpCircle,
          items: [
            {
              labelKey: "it.sections.demande-support.items.formulaire",
              label: "Formulaire de demande de support",
              icon: HandHelping,
              link: "/it/demande-support-informatique",
            },
          ],
        },
        {
          titleKey: "it.sections.tickets",
          title: "Tickets",
          icon: ListChecks,
          items: [
            {
              labelKey: "it.sections.tickets.items.suivi",
              label: "Suivi des tickets",
              icon: ListTree,
              link: "/it/tickets",
            },
            {
              labelKey: "it.sections.tickets.items.gantt",
              label: "Diagramme de Gantt",
              icon: GanttChartSquare,
              link: "/it/tickets/gantt",
            },
            {
              labelKey: "it.sections.tickets.items.tableau-de-bord",
              label: "Tableau de bord",
              icon: LayoutDashboard,
              link: "/it/tickets/dashboard",
            },
          ],
        },
      ],
    },
  },
];
