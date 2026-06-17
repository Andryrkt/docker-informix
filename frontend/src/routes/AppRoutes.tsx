// import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import ErrorPage from "../error/ErrorPage";
import { AnonymousOnly } from "../auth/guard/AnonymousOnly";
import AppLayouts from "../layout/AppLayout";
import Login from "../domains/authentification/pages/Login";
import DevisList from "@/domains/devis/pages/DevisList";
import HomePage from "@/domains/home/page/HomePage";
import DemandeSupportIT from "@/domains/it/page/DemandeSupportIT";
import { RequireAuth } from "./guards/RequireAuth";

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
        {
          path: "/magasin/dematerialisation/liste-devis-neg",
          element: <DevisList />,
        },
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
