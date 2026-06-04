// import { lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

import DevisPage from "../domains/devis/pages/DevisPage";
import ErrorPage from "../error/ErrorPage";
import { AnonymousOnly } from "../auth/guard/AnonymousOnly";
import AppLayouts from "../layout/AppLayout";
import Login from "../domains/authentification/pages/Login";
import DevisList from "@/domains/devis/pages/DevisList";

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
          path: "/",
          element: <Login />,
        },
      ],
    },
  ];

  const privateRoutes = [
    {
      element: (
        // <RequireAuth>
        <AnonymousOnly>
          {/* //Mettre RequireAuth après pour protéger les routes privées */}
          {/* <LazyWrapper> */}
          <AppLayouts />
          {/* </LazyWrapper> */}
        </AnonymousOnly>
        // </RequireAuth>
      ),
      errorElement: <ErrorPage />,
      children: [
        {
          path: "/magasin/dematerialisation/liste-devis-neg",
          element: <DevisList />,
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
