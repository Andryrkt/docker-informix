// import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import ErrorPage from "../error/ErrorPage";
import { AnonymousOnly } from "../auth/guard/AnonymousOnly";
import AppLayouts from "../layout/AppLayout";
import Login from "../domains/authentification/pages/Login";
import SelectCompany from "../domains/authentification/pages/SelectCompany";
import HomePage from "@/domains/home/page/HomePage";
import DemandeSupportIT from "@/domains/it/page/DemandeSupportIT";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireCompany } from "./guards/RequireCompany";
import DevisList from "@/domains/magasin/dematerialisation/devis/pages/DevisList";
import PlanningList from "@/domains/magasin/dematerialisation/planning/pages/PlanningList";
import DitList from "@/domains/atelier/dit/pages/DitList";
import DitCreation from "@/domains/atelier/dit/pages/DitCreation";
import DitDuplication from "@/domains/atelier/dit/pages/DitDuplication";
import DitDetails from "@/domains/atelier/dit/pages/DitDetails";

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
    [...publicRoutes, ...privateRoutesNoCompany, ...privateRoutes],
    // {
    //   basename: import.meta.env.VITE_APP_BASE || "/",
    // },
  );

  return <RouterProvider router={router} />;
}

export default AppRoutes;
