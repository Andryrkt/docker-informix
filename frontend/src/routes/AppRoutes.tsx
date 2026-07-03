// import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import ErrorPage from "../error/ErrorPage";
import { AnonymousOnly } from "../auth/guard/AnonymousOnly";
import AppLayouts from "../layout/AppLayout";
import Login from "../domains/authentification/pages/Login";
import HomePage from "@/domains/home/page/HomePage";
import DemandeSupportIT from "@/domains/it/page/DemandeSupportIT";
import { RequireAuth } from "./guards/RequireAuth";
import DevisList from "@/domains/magasin/dematerialisation/devis/pages/DevisList";
import PlanningList from "@/domains/magasin/dematerialisation/planning/pages/PlanningList";
import DitList from "@/domains/atelier/dit/pages/DitList";
import DitCreation from "@/domains/atelier/dit/pages/DitCreation";
import DitDuplication from "@/domains/atelier/dit/pages/DitDuplication";
import DitDetails from "@/domains/atelier/dit/pages/DitDetails";
import VerificationPrixSoumission from "@/domains/atelier/soumission/pages/VerificationPrixSoumission";
import { verificationDitLoader } from "./guards/verificationDitLoader";
import ValidationAtelierSoumission from "@/domains/atelier/soumission/pages/ValidationAtelierSoumission";
import BonCommandeSoumission from "@/domains/atelier/soumission/pages/BonCommandeSoumission";
import OrSoummission from "@/domains/atelier/soumission/pages/OrdreReparationSoummission";
import RapportInterventionSoumission from "@/domains/atelier/soumission/pages/RapportInterventionSoumission";
import FactureSoummission from "@/domains/atelier/soumission/pages/FactureSoummission";
import DossierDitDetails from "@/domains/atelier/dossierDit/pages/DossierDitDetails";
import DossierList from "@/domains/atelier/dossierDit/components/DossierList";

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
        },
      ],
    },
  ];

  const privateRoutes = [
    {
      element: (
        <RequireAuth>
          {/* //Mettre RequireAuth après pour protéger les routes privées */}
          {/* <LazyWrapper> */}
          <AppLayouts />
          {/* </LazyWrapper> */}
        </RequireAuth>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        // Magazin -> Dematerialisation
        {
          path: "/magasin/dematerialisation/liste-devis-neg",
          element: <DevisList />,
        },
        {
          path: "/magasin/dematerialisation/planning-commande",
          element: <PlanningList />,
        },

        // Atelier -> Demande d'intervention
        {
          path: "/atelier/demande-intervention/dit-list",
          element: <DitList />,
        },
        {
          path: "/atelier/demande-intervention/new",
          element: <DitCreation />,
        },
        {
          path: "/atelier/demande-intervention/duplication/:numeroDemandeIntervention",
          element: <DitDuplication />,
        },
        {
          path: "/atelier/demande-intervention/details/:numeroDemandeIntervention",
          element: <DitDetails />,
        },
        {
          path: "/atelier/demande-intervention/verification-prix/:numeroDemandeIntervention",
          element: <VerificationPrixSoumission />,
          loader: verificationDitLoader("verification-prix"),
        },
        {
          path: "/atelier/demande-intervention/validation-atelier/:numeroDemandeIntervention",
          element: <ValidationAtelierSoumission />,
          loader: verificationDitLoader("validation-atelier"),
        },
        {
          path: "/atelier/demande-intervention/bon-commande/:numeroDemandeIntervention",
          element: <BonCommandeSoumission />,
          loader: verificationDitLoader("bon-commande"),
        },

        {
          path: "/atelier/demande-intervention/ordre-reparation/:numeroDemandeIntervention",
          element: <OrSoummission />,
          loader: verificationDitLoader("ordre-reparation"),
        },
        {
          path: "/atelier/demande-intervention/rapport-intervention/:numeroDemandeIntervention",
          element: <RapportInterventionSoumission />,
          loader: verificationDitLoader("rapport-intervention"),
        },
        {
          path: "/atelier/demande-intervention/facture/:numeroDemandeIntervention",
          element: <FactureSoummission />,
          loader: verificationDitLoader("facture"),
        },
        {
          path: "/atelier/demande-intervention/dossier/:numeroDemandeIntervention",
          element: <DossierDitDetails />,
        },
        {
          path: "/atelier/demande-intervention/dossier-list",
          element: <DossierList />,
        },

        // {
        //   path: "/atelier/demande-intervention/new",
        //   element: <PlanningList />,
        // },

        // IT
        {
          path: "/it/demande-support-informatique",
          element: <DemandeSupportIT />,
        },
      ],
    },
  ];
  const router = createBrowserRouter(
    [...publicRoutes, ...privateRoutes],
    // {
    //   basename: import.meta.env.VITE_APP_BASE || "/",
    // },
  );

  return <RouterProvider router={router} />;
}

export default AppRoutes;
