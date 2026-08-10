import { useEffect, useMemo, useState } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  type RouteObject,
} from "react-router";

import ErrorPage from "../error/ErrorPage";
import { AnonymousOnly } from "../auth/guard/AnonymousOnly";
import AppLayouts from "../layout/AppLayout";
import Login from "../domains/authentification/pages/Login";
import SelectCompany from "../domains/authentification/pages/SelectCompany";
import AdminLayout from "@/domains/admin/layout/AdminLayout";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireCompany } from "./guards/RequireCompany";
import { useMenu } from "@/hooks/useMenu";
import { buildRoutesFromMenu } from "./buildRoutesFromMenu";
import HomePage from "@/domains/home/page/HomePage";
import { useAuth } from "@/context/authContext";
import { defaultsAdminChildren } from "./routeMap";
import LoaderSpinner from "@/components/common/LoaderSpinner";

function AppRoutes() {
  const { modules, isLoading } = useMenu();
  const { user } = useAuth();
  const router = useMemo(() => {
    const allMenuRoutes = buildRoutesFromMenu(modules ?? []);

    const adminRoutes = allMenuRoutes.filter((r) =>
      r.path?.startsWith("/admin"),
    );

    const privateRoutes = allMenuRoutes.filter(
      (r) => !r.path?.startsWith("/admin"),
    );

    const publicRoutes: RouteObject[] = [
      {
        element: (
          <AnonymousOnly>
            <AppLayouts />
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

    const privateRoutesNoCompany: RouteObject[] = [
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

    const privateShell: RouteObject = {
      element: (
        <RequireAuth>
          <RequireCompany>
            <AppLayouts />
          </RequireCompany>
        </RequireAuth>
      ),
      errorElement: <ErrorPage />,
      children: [
        { path: "/", element: <HomePage />, handle: { title: "Accueil" } },
        ...privateRoutes,
      ],
    };

    const userRoles = user?.roles ?? [];

    const isAdmin =
      userRoles.includes("ROLE_ADMIN") ||
      userRoles.includes("ROLE_SUPER_ADMIN");

    const adminShell: RouteObject | null = isAdmin
      ? {
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
              children: [...defaultsAdminChildren, ...adminRoutes],
            },
          ],
        }
      : null;

    return createBrowserRouter(
      [publicRoutes, privateRoutesNoCompany, privateShell, adminShell]
        .flat()
        .filter(Boolean) as RouteObject[],
    );
  }, [modules, user]);

  return <RouterProvider router={router} />;
}

export default AppRoutes;
