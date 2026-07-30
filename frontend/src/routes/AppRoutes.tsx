// import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import ErrorPage from "../error/ErrorPage";
import { AnonymousOnly } from "../auth/guard/AnonymousOnly";
import AppLayouts from "../layout/AppLayout";
import Login from "../domains/authentification/pages/Login";
import SelectCompany from "../domains/authentification/pages/SelectCompany";
import HomePage from "@/domains/home/page/HomePage";
import DemandeSupportIT from "@/domains/it/page/DemandeSupportIT";
import TikListPage from "@/domains/it/page/TikListPage";
import TikDetailPage from "@/domains/it/page/TikDetailPage";
import TikGanttPage from "@/domains/it/page/TikGanttPage";
import TikDashboardPage from "@/domains/it/page/TikDashboardPage";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireCompany } from "./guards/RequireCompany";
import DevisNegList from "@/domains/magasin/dematerialisation/devis/pages/DevisNegList";
import DitList from "@/domains/atelier/dit/pages/DitList";
import DitCreation from "@/domains/atelier/dit/pages/DitCreation";
import DitDuplication from "@/domains/atelier/dit/pages/DitDuplication";
import DitDetails from "@/domains/atelier/dit/pages/DitDetails";
import VerificationPrixSoumission from "@/domains/atelier/soumission/pages/VerificationPrixSoumission";
import { verificationDitLoader } from "./guards/verificationDitLoader";
import { ditDefaultsLoader } from "./guards/ditDefaultsLoader";
import ValidationAtelierSoumission from "@/domains/atelier/soumission/pages/ValidationAtelierSoumission";
import BonCommandeSoumission from "@/domains/atelier/soumission/pages/BonCommandeSoumission";
import OrSoummission from "@/domains/atelier/soumission/pages/OrdreReparationSoummission";
import RapportInterventionSoumission from "@/domains/atelier/soumission/pages/RapportInterventionSoumission";
import FactureSoummission from "@/domains/atelier/soumission/pages/FactureSoummission";
import DossierDitDetails from "@/domains/atelier/dossierDit/pages/DossierDitDetails";
import AdminLayout from "@/domains/admin/layout/AdminLayout";
import SocietesPage from "@/domains/admin/pages/SocietesPage";
import AgencesPage from "@/domains/admin/pages/AgencesPage";
import ServicesPage from "@/domains/admin/pages/ServicesPage";
import UtilisateursPage from "@/domains/admin/pages/UtilisateursPage";
import UserPermissionsPage from "@/domains/admin/pages/UserPermissionsPage";
import ActionsPage from "@/domains/admin/pages/ActionsPage";
import ModelePermissionsPage from "@/domains/admin/pages/ModelePermissionsPage";
import AuditNavigationPage from "@/domains/admin/pages/AuditNavigationPage";
import AuditOperationPage from "@/domains/admin/pages/AuditOperationPage";
import CentresPage from "@/domains/admin/pages/CentresPage";
import PersonnelPage from "@/domains/admin/pages/PersonnelPage";
import DossierDitList from "@/domains/atelier/dossierDit/pages/DossierDitList";
import PlanningDitInterneAtelierList from "@/domains/atelier/planning/pages/PlanningDitInterneAtelierList";
import PlanningDitList from "@/domains/atelier/planning/pages/PlanningDitList";
import PlanningDitListDetaille from "@/domains/atelier/planning/pages/PlanningDitListDetaille";
import PlanningMagasinList from "@/domains/magasin/dematerialisation/planning/pages/PlanningCmdeMagasinList";
import OrdreReparationALivrerList from "@/domains/magasin/ordreReparation/livrer/pages/OrdreReparationALivrerList";
import OrdreReparationATraiterList from "@/domains/magasin/ordreReparation/livrer/pages/OrdreReparationATraiterList";
import VerificationPrixDevisForm from "@/domains/magasin/dematerialisation/devis/soumission/components/VerificationPrixDevisForm";
import VerificationPrixDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/VerificationPrixDevisSoumission";
import ValidationDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/ValidationDevisSoumission";
import { verificationDevisLoader } from "./guards/verificationDevisLoader";
import BonCommandeDevisSoumission from "@/domains/magasin/dematerialisation/devis/soumission/pages/BonCommandeDevisSoumission";

function AppRoutes() {
  const publicRoutes = [
    {
      element: (
        <AnonymousOnly>
          {/* <LazyWrapper> */}
          <AppLayouts />
          {/* </LazyWrapper> */}
        </AnonymousOnly>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/login",
          element: <Login />,
          handle: { title: "Connexion" },
        },
      ],
    },
  ];

  // Routes nécessitant auth mais PAS de société active (ex: sélection de société)
  const privateRoutesNoCompany = [
    {
      element: (
        <RequireAuth>
          <AppLayouts />
        </RequireAuth>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/select-company",
          element: <SelectCompany />,
          handle: { title: "Sélection de société" },
        },
      ],
    },
  ];

  // Routes nécessitant auth ET société active sélectionnée
  const privateRoutes = [
    {
      element: (
        <RequireAuth>
          <RequireCompany>
            {/* <LazyWrapper> */}
            <AppLayouts />
            {/* </LazyWrapper> */}
          </RequireCompany>
        </RequireAuth>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <HomePage />,
          handle: { title: "Accueil" },
        },

        // Magazin -> Dematerialisation
        {
          path: "/magasin/dematerialisation/liste-devis-neg",
          element: <DevisNegList />,
          handle: { title: "Liste devis négociés" },
        },
        {
          path: "/magasin/dematerialisation/planning-commande-magasin",
          element: <PlanningMagasinList />,
          handle: { title: "Planning commande magasin" },
        },
        {
          path: "/magasin/dematerialisation/soumission-devis-neg-verification-de-prix/VP/:numeroDevis",
          element: <VerificationPrixDevisSoumission />,
          handle: { title: "Vérification prix devis" },
        },
        {
          path: "/magasin/dematerialisation/soumission-devis-neg-validation-devis/VD/:numeroDevis",
          element: <ValidationDevisSoumission />,
          loader: verificationDevisLoader("validation-devis"),
          handle: { title: "Validation devis" },
        },
        {
          path: "/magasin/dematerialisation/soumission-bc-neg/:numeroDevis",
          element: <BonCommandeDevisSoumission />,
          loader: verificationDevisLoader("validation-devis"),
          handle: { title: "Bon de commande devis" },
        },

        // Magazin -> ordre de reparation
        {
          path: "/magasin/ordre-reparation/a-livrer",
          element: <OrdreReparationALivrerList />,
          handle: { title: "OR à livrer" },
        },
        {
          path: "/magasin/ordre-reparation/a-traiter",
          element: <OrdreReparationATraiterList />,
          handle: { title: "OR à traiter" },
        },

        // Atelier -> Demande d'intervention
        {
          path: "/atelier/demande-intervention/dit-list",
          element: <DitList />,
          handle: { title: "Liste DIT" },
        },
        {
          path: "/atelier/demande-intervention/new",
          element: <DitCreation />,
          // loader: ditDefaultsLoader,
          handle: { title: "Nouvelle DIT" },
        },
        {
          path: "/atelier/demande-intervention/duplication/:numeroDemandeIntervention",
          element: <DitDuplication />,
          handle: { title: "Duplication DIT" },
        },
        {
          path: "/atelier/demande-intervention/details/:numeroDemandeIntervention",
          element: <DitDetails />,
          handle: { title: "Détails DIT" },
        },

        // atelier => soummission
        {
          path: "/atelier/demande-intervention/verification-prix/:numeroDemandeIntervention",
          element: <VerificationPrixSoumission />,
          loader: verificationDitLoader("verification-prix"),
          handle: { title: "Vérification prix" },
        },
        {
          path: "/atelier/demande-intervention/validation-atelier/:numeroDemandeIntervention",
          element: <ValidationAtelierSoumission />,
          loader: verificationDitLoader("validation-atelier"),
          handle: { title: "Validation atelier" },
        },
        {
          path: "/atelier/demande-intervention/bon-commande/:numeroDemandeIntervention",
          element: <BonCommandeSoumission />,
          loader: verificationDitLoader("bon-commande"),
          handle: { title: "Bon de commande" },
        },

        {
          path: "/atelier/demande-intervention/ordre-reparation/:numeroDemandeIntervention",
          element: <OrSoummission />,
          loader: verificationDitLoader("ordre-reparation"),
          handle: { title: "Ordre de réparation" },
        },
        {
          path: "/atelier/demande-intervention/rapport-intervention/:numeroDemandeIntervention",
          element: <RapportInterventionSoumission />,
          loader: verificationDitLoader("rapport-intervention"),
          handle: { title: "Rapport d'intervention" },
        },
        {
          path: "/atelier/demande-intervention/facture/:numeroDemandeIntervention",
          element: <FactureSoummission />,
          loader: verificationDitLoader("facture"),
          handle: { title: "Facture" },
        },

        // atelier => dossier
        {
          path: "/atelier/demande-intervention/dossier/:numeroDemandeIntervention",
          element: <DossierDitDetails />,
          handle: { title: "Dossier DIT" },
        },
        {
          path: "/atelier/demande-intervention/dossier-list",
          element: <DossierDitList />,
          handle: { title: "Liste dossiers DIT" },
        },
        // atelier => planning
        {
          path: "/atelier/demande-intervention/planning-list",
          element: <PlanningDitList />,
          handle: { title: "Planning DIT" },
        },

        {
          path: "/atelier/demande-intervention/planning-detaille",
          element: <PlanningDitListDetaille />,
          handle: { title: "Planning détaillé" },
        },
        {
          path: "/atelier/demande-intervention/planning-interne-atelier",
          element: <PlanningDitInterneAtelierList />,
          handle: { title: "Planning interne atelier" },
        },

        // IT
        {
          path: "/it/demande-support-informatique",
          element: <DemandeSupportIT />,
          handle: { title: "Demande support IT" },
        },
        {
          path: "/it/tickets",
          element: <TikListPage />,
          handle: { title: "Liste tickets" },
        },
        {
          path: "/it/tickets/gantt",
          element: <TikGanttPage />,
          handle: { title: "Gantt tickets" },
        },
        {
          path: "/it/tickets/dashboard",
          element: <TikDashboardPage />,
          handle: { title: "Dashboard tickets" },
        },
        {
          path: "/it/tickets/:id",
          element: <TikDetailPage />,
          handle: { title: "Détail ticket" },
        },
      ],
    },
  ];

  // Routes admin — auth + company required, layout propre avec sidebar
  const adminRoutes = [
    {
      element: (
        <RequireAuth>
          <RequireCompany>
            <AppLayouts />
          </RequireCompany>
        </RequireAuth>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/admin",
          element: <AdminLayout />,
          children: [
            {
              path: "societes",
              element: <SocietesPage />,
              handle: { title: "Sociétés" },
            },
            {
              path: "agences",
              element: <AgencesPage />,
              handle: { title: "Agences" },
            },
            {
              path: "services",
              element: <ServicesPage />,
              handle: { title: "Services" },
            },
            {
              path: "centres",
              element: <CentresPage />,
              handle: { title: "Centres" },
            },
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
            {
              path: "actions",
              element: <ActionsPage />,
              handle: { title: "Actions" },
            },
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
          ],
        },
      ],
    },
  ];

  const router = createBrowserRouter(
    [
      ...publicRoutes,
      ...privateRoutesNoCompany,
      ...privateRoutes,
      ...adminRoutes,
    ],
    // {
    //   basename: import.meta.env.VITE_APP_BASE || "/",
    // },
  );

  return <RouterProvider router={router} />;
}

export default AppRoutes;
