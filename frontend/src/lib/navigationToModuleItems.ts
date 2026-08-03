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
  faComputer,
  faQuestionCircle,
  faHandsHelping,
  faBriefcase,
  faFolder,
  faDolly,
  faTools,
  faAddressBook,
  faChartGantt,
  faDashboard,
  faCalendarDay,
  faTable,
  faCalendarDays,
  faTruckLoading,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import type {
  AppModule,
  Menu,
  ModuleModal,
  SousMenu,
} from "@/domains/home/schema/moduleItems";
import type {
  MenuItem,
  NavigationData,
} from "@/domains/authentification/schema/navigationSchema";
// import { AppModule, ModuleModal, Menu, SousMenu } from "../types/moduleItems"; // adapte le chemin

/**
 * Mapping des noms de modules vers leurs icônes principales
 */
const moduleIconMap: Record<string, IconDefinition> = {
  Documentation: faBook,
  Magasin: faDolly,
  Atelier: faTools,
  "Support Informatique": faComputer,
  IT: faComputer,
  // Ajoute ici d'autres modules si nécessaire
};

/**
 * Mapping des noms de sections (menus parent) vers leurs icônes
 */
const sectionIconMap: Record<string, IconDefinition> = {
  Contrat: faFile,
  OR: faWarehouse,
  Dematerialisation: faCloudUpload,
  "Demande d'intervention": faBriefcase,
  PLANNING: faCalendarDays,
  "Demande support informatique": faQuestionCircle,
  Tickets: faListCheck,
  // Ajoute d'autres sections si nécessaire
};

/**
 * Mapping des noms d'items (labels) vers leurs icônes
 */
const itemIconMap: Record<string, IconDefinition> = {
  "Nouveau contrat": faCirclePlus,
  Consultation: faSearch,
  Annuaire: faAddressBook,
  "Planning analytique HFF": faList,
  "Document interne": faFolderTree,
  "Liste à traiter": faListCheck,
  "Liste à livrer": faTruckLoading,
  Devis: faList,
  "Planning de commande Magasin": faCalendar,
  "Soumission commandes fournisseur": faList,
  "Nouvelle demande": faCirclePlus,
  "Dossier DIT": faFolder,
  "Matrice de responsabilité": faTable,
  "Planning detailé": faCalendarDay,
  "Planning interne Atelier": faListCheck,
  Planning: faCalendar,
  "Glossaire OR": faBook,
  "Formulaire de demande de support": faHandsHelping,
  "Suivi des tickets": faListCheck,
  "Diagramme de Gantt": faChartGantt,
  "Tableau de bord": faDashboard,
  // Ajoute d'autres items si besoin
};

/**
 * Mapping optionnel pour les descriptions des modules
 * (car l'API n'en fournit pas)
 */
const moduleDescriptionMap: Record<string, string> = {
  Atelier: "This is description of Atelier that should give from backend",
  IT: "This is description of IT that should give from backend",
  // Magasin: "This is description of Magasin that should give from backend", // commenté dans l'original
};

/**
 * Icône par défaut
 */
const defaultIcon: IconDefinition = faFile;

/**
 * Récupère l'icône d'un item à partir de son label
 */
function getItemIcon(label: string): IconDefinition {
  return itemIconMap[label] || defaultIcon;
}

/**
 * Récupère l'icône d'une section à partir de son titre
 */
function getSectionIcon(title: string): IconDefinition {
  return sectionIconMap[title] || defaultIcon;
}

/**
 * Récupère l'icône d'un module à partir de son nom
 */
function getModuleIcon(name: string): IconDefinition {
  return moduleIconMap[name] || defaultIcon;
}

/**
 * Récupère la description d'un module, si définie
 */
function getModuleDescription(name: string): string | undefined {
  return moduleDescriptionMap[name];
}

/**
 * Parcourt récursivement un menu pour récupérer toutes les feuilles (sans enfants)
 * avec leur chemin complet (route)
 */
function collectLeafItems(menu: MenuItem): MenuItem[] {
  let leaves: MenuItem[] = [];
  if (menu["sous-menu"] && menu["sous-menu"].length > 0) {
    for (const sub of menu["sous-menu"]) {
      leaves = leaves.concat(collectLeafItems(sub));
    }
  } else {
    // Si l'élément a une route, on le garde
    if (menu.route) {
      leaves.push(menu);
    }
  }
  return leaves;
}
type NavigationMenu = NavigationData["modules"][number]["menu"][number];

function mapSousMenu(menu: NavigationMenu): SousMenu {
  return {
    titreSousMenu: menu.nom,
    icon: getItemIcon(menu.nom),
    lien: menu.route ?? undefined,
    sousMenu:
      menu["sous-menu"]?.length > 0
        ? menu["sous-menu"].map(mapSousMenu)
        : undefined,
  };
}
/**
 * Fonction principale : transforme les données de navigation en AppModule[]
 * prêt à remplacer le tableau statique `moduleItems`.
 */
export function navigationToModuleItems(data: NavigationData): AppModule[] {
  const modules: AppModule[] = [];
  for (const apiModule of data.modules) {
    const moduleName = apiModule.nom;
    const moduleIcon = getModuleIcon(moduleName);

    // Création du modal
    const modal: ModuleModal = {
      titre: moduleName,
      icon: moduleIcon,
      Menu: [],
      sousMenu: [],
    };

    // Parcourir les menus de premier niveau (ceux avec parent = null)
    // Dans l'API, tous les menus retournés sont de premier niveau (car on les filtre déjà)
    const topMenus = apiModule.menu;

    for (const menu of topMenus) {
      const hasChildren = menu["sous-menu"] && menu["sous-menu"].length > 0;

      if (hasChildren) {
        modal.Menu!.push({
          titreMenu: menu.nom,
          icon: getSectionIcon(menu.nom),
          sousMenu: menu["sous-menu"].map(mapSousMenu),
        });
      } else {
        modal.sousMenu!.push(mapSousMenu(menu));
      }
    }

    // Créer l'objet AppModule
    modules.push({
      nomModule: moduleName,
      icon: moduleIcon,
      moduleModal: modal,
    });
  }

  return modules;
}
