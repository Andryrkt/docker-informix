// routeMap.tsx
import HomePage from "@/domains/home/page/HomePage";
import DevisNegList from "@/domains/magasin/dematerialisation/devis/pages/DevisNegList";
import PlanningMagasinList from "@/domains/magasin/dematerialisation/planning/pages/PlanningCmdeMagasinList";
import VerificationPrixDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/VerificationPrixDevisSoumission";
import ValidationDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/ValidationDevisSoumission";
import BonCommandeDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/BonCommandeDevisSoumission";
import OrdreReparationALivrerList from "@/domains/magasin/ordreReparation/livrer/pages/OrdreReparationALivrerList";
import OrdreReparationATraiterList from "@/domains/magasin/ordreReparation/livrer/pages/OrdreReparationATraiterList";
import DitList from "@/domains/atelier/dit/pages/DitList";
import DitCreation from "@/domains/atelier/dit/pages/DitCreation";
import DitDuplication from "@/domains/atelier/dit/pages/DitDuplication";
import DitDetails from "@/domains/atelier/dit/pages/DitDetails";
import VerificationPrixSoumission from "@/domains/atelier/soumission/pages/VerificationPrixSoumission";
import ValidationAtelierSoumission from "@/domains/atelier/soumission/pages/ValidationAtelierSoumission";
import BonCommandeSoumission from "@/domains/atelier/soumission/pages/BonCommandeSoumission";
import OrSoummission from "@/domains/atelier/soumission/pages/OrdreReparationSoummission";
import RapportInterventionSoumission from "@/domains/atelier/soumission/pages/RapportInterventionSoumission";
import FactureSoummission from "@/domains/atelier/soumission/pages/FactureSoummission";
import DossierDitDetails from "@/domains/atelier/dossierDit/pages/DossierDitDetails";
import DossierDitList from "@/domains/atelier/dossierDit/pages/DossierDitList";
import PlanningDitList from "@/domains/atelier/planning/pages/PlanningDitList";
import PlanningDitListDetaille from "@/domains/atelier/planning/pages/PlanningDitListDetaille";
import PlanningDitInterneAtelierList from "@/domains/atelier/planning/pages/PlanningDitInterneAtelierList";
import DemandeSupportIT from "@/domains/it/page/DemandeSupportIT";
import TikListPage from "@/domains/it/page/TikListPage";
import TikDetailPage from "@/domains/it/page/TikDetailPage";
import TikGanttPage from "@/domains/it/page/TikGanttPage";
import TikDashboardPage from "@/domains/it/page/TikDashboardPage";
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

// Loader factories
import { verificationDitLoader } from "./guards/verificationDitLoader";
import { verificationDevisLoader } from "./guards/verificationDevisLoader";
import type { RouteObject } from "react-router-dom";

export interface RouteConfig {
  component: React.ComponentType<any>;
  loader?: (args: any) => any; // optional loader factory
}

const routeMap: Record<string, RouteConfig> = {
  "/": { component: HomePage },
  "/magasin/dematerialisation/liste-devis-neg": { component: DevisNegList },
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

  "/atelier/demande-intervention/dit-list": { component: DitList },
  "/atelier/demande-intervention/new": { component: DitCreation },
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
  "/atelier/demande-intervention/dossier-list": { component: DossierDitList },
  "/atelier/demande-intervention/planning-list": { component: PlanningDitList },
  "/atelier/demande-intervention/planning-detaille": {
    component: PlanningDitListDetaille,
  },
  "/atelier/demande-intervention/planning-interne-atelier": {
    component: PlanningDitInterneAtelierList,
  },
  "/it/demande-support-informatique": { component: DemandeSupportIT },
  "/it/tickets": { component: TikListPage },
  "/it/tickets/gantt": { component: TikGanttPage },
  "/it/tickets/dashboard": { component: TikDashboardPage },
  "/it/tickets/:id": { component: TikDetailPage },

  // // Admin routes – placed under /admin prefix
  // "/admin/societes": { component: SocietesPage },
  // "/admin/agences": { component: AgencesPage },
  // "/admin/services": { component: ServicesPage },
  // "/admin/centres": { component: CentresPage },
  // "/admin/personnel": { component: PersonnelPage },
  // "/admin/utilisateurs": { component: UtilisateursPage },
  // "/admin/utilisateurs/:userId/permissions": { component: UserPermissionsPage },
  // "/admin/actions": { component: ActionsPage },
  // "/admin/modeles": { component: ModelePermissionsPage },
  // "/admin/historique/navigation": { component: AuditNavigationPage },
  // "/admin/historique/operations": { component: AuditOperationPage },
};

export const defaultsAdminChildren: RouteObject[] = [
  {
    path: "societes",
    element: <SocietesPage />,
    handle: { title: "Sociétés" },
  },
  { path: "agences", element: <AgencesPage />, handle: { title: "Agences" } },
  {
    path: "services",
    element: <ServicesPage />,
    handle: { title: "Services" },
  },
  { path: "centres", element: <CentresPage />, handle: { title: "Centres" } },
  {
    path: "personnel",
    element: <PersonnelPage />,
    handle: { title: "Personnel" },
  },
  {
    path: "utilisateurs",
    element: <UtilisateursPage />,
    handle: { title: "Utilisateurs" },
  },
  {
    path: "utilisateurs/:userId/permissions",
    element: <UserPermissionsPage />,
    handle: { title: "Permissions utilisateur" },
  },
  { path: "actions", element: <ActionsPage />, handle: { title: "Actions" } },
  {
    path: "modeles",
    element: <ModelePermissionsPage />,
    handle: { title: "Modèles permissions" },
  },
  {
    path: "historique/navigation",
    element: <AuditNavigationPage />,
    handle: { title: "Historique navigation" },
  },
  {
    path: "historique/operations",
    element: <AuditOperationPage />,
    handle: { title: "Historique opérations" },
  },
];

export default routeMap;
