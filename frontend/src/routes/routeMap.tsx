// src/router/routeMap.tsx

import type { ComponentType } from "react";
import { Outlet } from "react-router-dom";
import type { RouteObject } from "react-router-dom";

/* =========================================================
 * HOME
 * ======================================================= */

import HomePage from "@/domains/home/page/HomePage";

/* =========================================================
 * MAGASIN
 * ======================================================= */

import DevisNegList from "@/domains/magasin/dematerialisation/devis/pages/DevisNegList";
import PlanningMagasinList from "@/domains/magasin/dematerialisation/planning/pages/PlanningCmdeMagasinList";

import VerificationPrixDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/VerificationPrixDevisSoumission";
import ValidationDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/ValidationDevisSoumission";
import BonCommandeDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/BonCommandeDevisSoumission";

import OrdreReparationALivrerList from "@/domains/magasin/ordreReparation/livrer/pages/OrdreReparationALivrerList";
import OrdreReparationATraiterList from "@/domains/magasin/ordreReparation/livrer/pages/OrdreReparationATraiterList";

/* =========================================================
 * ATELIER - DIT
 * ======================================================= */

import DitList from "@/domains/atelier/dit/pages/DitList";
import DitCreation from "@/domains/atelier/dit/pages/DitCreation";
import DitDuplication from "@/domains/atelier/dit/pages/DitDuplication";
import DitDetails from "@/domains/atelier/dit/pages/DitDetails";

/* =========================================================
 * ATELIER - SOUMISSION
 * ======================================================= */

import VerificationPrixSoumission from "@/domains/atelier/soumission/pages/VerificationPrixSoumission";
import ValidationAtelierSoumission from "@/domains/atelier/soumission/pages/ValidationAtelierSoumission";
import BonCommandeSoumission from "@/domains/atelier/soumission/pages/BonCommandeSoumission";
import OrSoummission from "@/domains/atelier/soumission/pages/OrdreReparationSoummission";
import RapportInterventionSoumission from "@/domains/atelier/soumission/pages/RapportInterventionSoumission";
import FactureSoummission from "@/domains/atelier/soumission/pages/FactureSoummission";

/* =========================================================
 * ATELIER - DOSSIER
 * ======================================================= */

import DossierDitDetails from "@/domains/atelier/dossierDit/pages/DossierDitDetails";
import DossierDitList from "@/domains/atelier/dossierDit/pages/DossierDitList";

/* =========================================================
 * ATELIER - PLANNING
 * ======================================================= */

import PlanningDitList from "@/domains/atelier/planning/pages/PlanningDitList";
import PlanningDitListDetaille from "@/domains/atelier/planning/pages/PlanningDitListDetaille";
import PlanningDitInterneAtelierList from "@/domains/atelier/planning/pages/PlanningDitInterneAtelierList";

/* =========================================================
 * IT
 * ======================================================= */

import DemandeSupportIT from "@/domains/it/page/DemandeSupportIT";
import TikListPage from "@/domains/it/page/TikListPage";
import TikDetailPage from "@/domains/it/page/TikDetailPage";
import TikGanttPage from "@/domains/it/page/TikGanttPage";
import TikDashboardPage from "@/domains/it/page/TikDashboardPage";

/* =========================================================
 * ADMIN
 * ======================================================= */

import SocietesPage from "@/domains/admin/pages/SocietesPage";
import AgencesPage from "@/domains/admin/pages/AgencesPage";
import ServicesPage from "@/domains/admin/pages/ServicesPage";
import CentresPage from "@/domains/admin/pages/CentresPage";
import PersonnelPage from "@/domains/admin/pages/PersonnelPage";
import UtilisateursPage from "@/domains/admin/pages/UtilisateursPage";
import UserPermissionsPage from "@/domains/admin/pages/UserPermissionsPage";
import ActionsPage from "@/domains/admin/pages/ActionsPage";
import ModelePermissionsPage from "@/domains/admin/pages/ModelePermissionsPage";
import AuditNavigationPage from "@/domains/admin/pages/AuditNavigationPage";
import AuditOperationPage from "@/domains/admin/pages/AuditOperationPage";

/* =========================================================
 * LOADERS
 * ======================================================= */

import { verificationDitLoader } from "./guards/verificationDitLoader";
import { verificationDevisLoader } from "./guards/verificationDevisLoader";

/* =========================================================
 * ACTIONS
 * ======================================================= */

export type ModuleAction =
  | "view"
  | "export"
  | "print"
  | "create"
  | "edit"
  | "delete"
  | "validate"
  | "approve"
  | "duplicate"
  | "archive"
  | "import"
  | "manage_users"
  | "manage_permissions";

/* =========================================================
 * ROUTE CONFIG
 * ======================================================= */

export interface RouteConfig {
  component: ComponentType<any>;
  loader?: (args: any) => any;
}

/* =========================================================
 * INTERNAL ROUTE CONFIG
 * ======================================================= */

export interface InternalRouteConfig {
  /**
   * Route relative au module parent.
   *
   * Exemple :
   *
   * parent:
   * /atelier/demande-intervention
   *
   * path:
   * details/:numeroDemandeIntervention
   *
   * donne:
   * /atelier/demande-intervention/details/:numeroDemandeIntervention
   */
  path?: string;

  /**
   * Pour la page principale du module.
   *
   * Exemple :
   * index: true => /atelier/demande-intervention
   */
  index?: boolean;

  component: ComponentType<any>;

  /**
   * Action nécessaire pour accéder à cette route.
   */
  action?: ModuleAction;

  /**
   * Loader éventuel.
   */
  loader?: (args: any) => any;

  /**
   * Titre utilisé par le header/breadcrumb.
   */
  title?: string;
}

/* =========================================================
 * MODULE OUTLET
 * ======================================================= */

/**
 * Layout technique utilisé pour les modules qui possèdent
 * plusieurs routes internes.
 *
 * Exemple :
 *
 * /atelier/demande-intervention
 *     ├── index
 *     ├── new
 *     ├── details/:numero...
 *     └── ...
 *
 * Les pages enfants seront rendues via <Outlet />.
 */
function ModuleOutlet() {
  return <Outlet />;
}

/* =========================================================
 * ROOT ROUTES
 *
 * Ces routes restent associées au menu/backend.
 *
 * IMPORTANT :
 * Pour un module qui possède des routes imbriquées,
 * on utilise ici le chemin racine du module.
 * ======================================================= */

const routeMap: Record<string, RouteConfig> = {
  /* =======================================================
   * HOME
   * ===================================================== */

  "/": {
    component: HomePage,
  },

  /* =======================================================
   * MAGASIN
   * ===================================================== */

  "/magasin/dematerialisation/liste-devis-neg": {
    component: DevisNegList,
  },

  "/magasin/dematerialisation/planning-commande-magasin": {
    component: PlanningMagasinList,
  },

  "/magasin/dematerialisation/soumission-devis-neg-verification-de-prix/VP/:numeroDevis":
    {
      component: VerificationPrixDevisSoumission,
    },

  "/magasin/dematerialisation/soumission-devis-neg-validation-devis/VD/:numeroDevis":
    {
      component: ValidationDevisSoumission,
      loader: verificationDevisLoader("validation-devis"),
    },

  "/magasin/dematerialisation/soumission-bc-neg/:numeroDevis": {
    component: BonCommandeDevisSoumission,
    loader: verificationDevisLoader("validation-devis"),
  },

  "/magasin/ordre-reparation/a-livrer": {
    component: OrdreReparationALivrerList,
  },

  "/magasin/ordre-reparation/a-traiter": {
    component: OrdreReparationATraiterList,
  },

  "/magasin/cmde-fournisseur": {
    component: OrdreReparationATraiterList,
  },

  /* =======================================================
   * ATELIER - MODULE DIT
   *
   * IMPORTANT :
   * Cette route devient le parent des routes DIT.
   * ===================================================== */

  "/atelier/demande-intervention": {
    component: ModuleOutlet,
  },

  /* =======================================================
   * ATELIER - ROUTES EXISTANTES / NON IMBRIQUEES
   *
   * Tu peux les garder temporairement si certaines sont
   * encore utilisées ailleurs.
   * ===================================================== */

  "/atelier/demande-intervention/dit-list": {
    component: DitList,
  },

  "/atelier/demande-intervention/new": {
    component: DitCreation,
  },

  "/atelier/demande-intervention/duplication/:numeroDemandeIntervention": {
    component: DitDuplication,
  },

  "/atelier/demande-intervention/details/:numeroDemandeIntervention": {
    component: DitDetails,
  },

  "/atelier/demande-intervention/verification-prix/:numeroDemandeIntervention":
    {
      component: VerificationPrixSoumission,
      loader: verificationDitLoader("verification-prix"),
    },

  "/atelier/demande-intervention/validation-atelier/:numeroDemandeIntervention":
    {
      component: ValidationAtelierSoumission,
      loader: verificationDitLoader("validation-atelier"),
    },

  "/atelier/demande-intervention/bon-commande/:numeroDemandeIntervention": {
    component: BonCommandeSoumission,
    loader: verificationDitLoader("bon-commande"),
  },

  "/atelier/demande-intervention/ordre-reparation/:numeroDemandeIntervention": {
    component: OrSoummission,
    loader: verificationDitLoader("ordre-reparation"),
  },

  "/atelier/demande-intervention/rapport-intervention/:numeroDemandeIntervention":
    {
      component: RapportInterventionSoumission,
      loader: verificationDitLoader("rapport-intervention"),
    },

  "/atelier/demande-intervention/facture/:numeroDemandeIntervention": {
    component: FactureSoummission,
    loader: verificationDitLoader("facture"),
  },

  "/atelier/demande-intervention/dossier/:numeroDemandeIntervention": {
    component: DossierDitDetails,
  },

  "/atelier/demande-intervention/dossier-list": {
    component: DossierDitList,
  },

  "/atelier/demande-intervention/planning-list": {
    component: PlanningDitList,
  },

  "/atelier/demande-intervention/planning-detaille": {
    component: PlanningDitListDetaille,
  },

  "/atelier/demande-intervention/planning-interne-atelier": {
    component: PlanningDitInterneAtelierList,
  },

  /* =======================================================
   * IT
   * ===================================================== */

  "/it/demande-support-informatique": {
    component: DemandeSupportIT,
  },

  "/it/tickets": {
    component: TikListPage,
  },

  "/it/tickets/gantt": {
    component: TikGanttPage,
  },

  "/it/tickets/dashboard": {
    component: TikDashboardPage,
  },

  "/it/tickets/:id": {
    component: TikDetailPage,
  },
};

/* =========================================================
 * INTERNAL ROUTES
 *
 * Ces routes ne sont pas obligées d'être présentes dans
 * le menu backend.
 *
 * Elles sont attachées automatiquement au module parent.
 * ======================================================= */

export const internalRouteMap: Record<string, InternalRouteConfig[]> = {
  /* =======================================================
   * DIT
   * ===================================================== */

  "/atelier/demande-intervention": [
    /**
     * /atelier/demande-intervention
     *
     * Action: view
     */
    {
      index: true,
      component: DitList,
      action: "view",
      title: "Demandes d'intervention",
    },

    /**
     * /atelier/demande-intervention/new
     *
     * Action: create
     */
    {
      path: "new",
      component: DitCreation,
      action: "create",
      title: "Nouvelle demande d'intervention",
    },

    /**
     * /atelier/demande-intervention/details/:numero...
     *
     * Action: view
     */
    {
      path: "details/:numeroDemandeIntervention",
      component: DitDetails,
      action: "view",
      title: "Détail de la demande d'intervention",
    },

    /**
     * Si tu crées plus tard un vrai écran de modification :
     *
     * /atelier/demande-intervention/edit/:numero...
     *
     * Action: edit
     *
     * Tu peux remplacer DitCreation par ton composant
     * d'édition.
     */
    {
      path: "edit/:numeroDemandeIntervention",
      component: DitCreation,
      action: "edit",
      title: "Modifier la demande d'intervention",
    },

    /**
     * /atelier/demande-intervention/duplication/:numero...
     *
     * Action: duplicate
     */
    {
      path: "duplication/:numeroDemandeIntervention",
      component: DitDuplication,
      action: "duplicate",
      title: "Dupliquer la demande d'intervention",
    },

    /**
     * /atelier/demande-intervention/verification-prix/:numero...
     *
     * Action: view
     *
     * Tu peux changer cette action en "validate" si chez toi
     * la validation des prix correspond à cette permission.
     */
    {
      path: "verification-prix/:numeroDemandeIntervention",
      component: VerificationPrixSoumission,
      action: "view",
      loader: verificationDitLoader("verification-prix"),
      title: "Vérification des prix",
    },

    /**
     * /atelier/demande-intervention/validation-atelier/:numero...
     *
     * Action: validate
     */
    {
      path: "validation-atelier/:numeroDemandeIntervention",
      component: ValidationAtelierSoumission,
      action: "validate",
      loader: verificationDitLoader("validation-atelier"),
      title: "Validation atelier",
    },

    /**
     * /atelier/demande-intervention/bon-commande/:numero...
     *
     * Action: approve
     */
    {
      path: "bon-commande/:numeroDemandeIntervention",
      component: BonCommandeSoumission,
      action: "approve",
      loader: verificationDitLoader("bon-commande"),
      title: "Bon de commande",
    },

    /**
     * /atelier/demande-intervention/ordre-reparation/:numero...
     *
     * Action: approve
     */
    {
      path: "ordre-reparation/:numeroDemandeIntervention",
      component: OrSoummission,
      action: "approve",
      loader: verificationDitLoader("ordre-reparation"),
      title: "Ordre de réparation",
    },

    /**
     * /atelier/demande-intervention/rapport-intervention/:numero...
     *
     * Action: view
     */
    {
      path: "rapport-intervention/:numeroDemandeIntervention",
      component: RapportInterventionSoumission,
      action: "view",
      loader: verificationDitLoader("rapport-intervention"),
      title: "Rapport d'intervention",
    },

    /**
     * /atelier/demande-intervention/facture/:numero...
     *
     * Action: view
     */
    {
      path: "facture/:numeroDemandeIntervention",
      component: FactureSoummission,
      action: "view",
      loader: verificationDitLoader("facture"),
      title: "Facture",
    },

    /**
     * /atelier/demande-intervention/dossier/:numero...
     *
     * Action: view
     */
    {
      path: "dossier/:numeroDemandeIntervention",
      component: DossierDitDetails,
      action: "view",
      title: "Dossier DIT",
    },

    /**
     * /atelier/demande-intervention/dossier-list
     *
     * Action: view
     */
    {
      path: "dossier-list",
      component: DossierDitList,
      action: "view",
      title: "Dossiers DIT",
    },

    /**
     * /atelier/demande-intervention/planning-list
     *
     * Action: view
     */
    {
      path: "planning-list",
      component: PlanningDitList,
      action: "view",
      title: "Planning DIT",
    },

    /**
     * /atelier/demande-intervention/planning-detaille
     *
     * Action: view
     */
    {
      path: "planning-detaille",
      component: PlanningDitListDetaille,
      action: "view",
      title: "Planning détaillé",
    },

    /**
     * /atelier/demande-intervention/planning-interne-atelier
     *
     * Action: view
     */
    {
      path: "planning-interne-atelier",
      component: PlanningDitInterneAtelierList,
      action: "view",
      title: "Planning interne atelier",
    },
  ],
};

/* =========================================================
 * ADMIN
 * ======================================================= */

export const defaultsAdminChildren: RouteObject[] = [
  {
    path: "societes",
    element: <SocietesPage />,
    handle: {
      title: "Sociétés",
    },
  },

  {
    path: "agences",
    element: <AgencesPage />,
    handle: {
      title: "Agences",
    },
  },

  {
    path: "services",
    element: <ServicesPage />,
    handle: {
      title: "Services",
    },
  },

  {
    path: "centres",
    element: <CentresPage />,
    handle: {
      title: "Centres",
    },
  },

  {
    path: "personnel",
    element: <PersonnelPage />,
    handle: {
      title: "Personnel",
    },
  },

  {
    path: "utilisateurs",
    element: <UtilisateursPage />,
    handle: {
      title: "Utilisateurs",
    },
  },

  {
    path: "utilisateurs/:userId/permissions",
    element: <UserPermissionsPage />,
    handle: {
      title: "Permissions utilisateur",
    },
  },

  {
    path: "actions",
    element: <ActionsPage />,
    handle: {
      title: "Actions",
    },
  },

  {
    path: "modeles",
    element: <ModelePermissionsPage />,
    handle: {
      title: "Modèles permissions",
    },
  },

  {
    path: "historique/navigation",
    element: <AuditNavigationPage />,
    handle: {
      title: "Historique navigation",
    },
  },

  {
    path: "historique/operations",
    element: <AuditOperationPage />,
    handle: {
      title: "Historique opérations",
    },
  },
];

/* =========================================================
 * EXPORT
 * ======================================================= */

export default routeMap;
