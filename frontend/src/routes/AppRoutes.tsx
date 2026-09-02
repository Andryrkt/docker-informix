import { useMemo } from "react";
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
  const { modules, isLoading: isMenuLoading } = useMenu();

  const { user } = useAuth();

  /**
   * ========================================================
   * ROUTER
   * ========================================================
   *
   * On reconstruit le router uniquement lorsque :
   * - le menu backend est disponible
   * - l'utilisateur est disponible
   */
  const router = useMemo(() => {
    /**
     * Tant que le menu n'est pas disponible,
     * on ne construit pas encore le router.
     */
    if (isMenuLoading) {
      return null;
    }

    /**
     * ======================================================
     * ROUTES BACKEND / METIER
     * ======================================================
     *
     * buildRoutesFromMenu() prend :
     *
     * modules
     *   └── menu
     *       └── sous-menu
     *
     * et ajoute automatiquement les routes internes
     * définies dans internalRouteMap.
     */
    const allMenuRoutes = buildRoutesFromMenu(modules ?? []);

    // console.log("[AppRoutes] Routes générées :", allMenuRoutes);

    /**
     * ======================================================
     * ADMIN
     * ======================================================
     */
    const adminRoutes = allMenuRoutes.filter(
      (route) =>
        typeof route.path === "string" && route.path.startsWith("/admin"),
    );

    /**
     * ======================================================
     * PRIVATE / METIER
     * ======================================================
     */
    const privateRoutes = allMenuRoutes.filter(
      (route) =>
        !(typeof route.path === "string" && route.path.startsWith("/admin")),
    );

    /**
     * ======================================================
     * PUBLIC ROUTES
     * ======================================================
     *
     * Accessible sans authentification.
     */
    const publicRoutes: RouteObject = {
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

          handle: {
            title: "Connexion",
          },
        },
      ],
    };

    /**
     * ======================================================
     * PRIVATE ROUTES - SANS SOCIETE
     * ======================================================
     *
     * L'utilisateur doit être authentifié mais
     * n'a pas encore sélectionné sa société.
     */
    const privateRoutesNoCompany: RouteObject = {
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

          handle: {
            title: "Sélection de société",
            hideHeader: true,
            hideBreadcrumb: true,
          },
        },
      ],
    };

    /**
     * ======================================================
     * PRIVATE SHELL
     * ======================================================
     *
     * Authentification
     *      ↓
     * Société obligatoire
     *      ↓
     * Layout principal
     *      ↓
     * Routes métier
     */
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
        /**
         * Accueil
         */
        {
          path: "/",

          element: <HomePage />,

          handle: {
            title: "Accueil",
          },
        },

        /**
         * Toutes les routes générées depuis
         * le menu backend.
         *
         * Exemple :
         *
         * /atelier/demande-intervention
         *   ├── index
         *   ├── new
         *   ├── details/:numero...
         *   ├── duplication/:numero...
         *   └── ...
         */
        ...privateRoutes,
      ],
    };

    /**
     * ======================================================
     * ADMIN
     * ======================================================
     */

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

              children: [
                /**
                 * Routes admin locales
                 */
                ...defaultsAdminChildren,

                /**
                 * Routes admin provenant du backend
                 */
                ...adminRoutes,
              ],
            },
          ],
        }
      : null;

    /**
     * ======================================================
     * FINAL ROUTER
     * ======================================================
     */

    const routes: RouteObject[] = [
      publicRoutes,
      privateRoutesNoCompany,
      privateShell,
    ];

    /**
     * On ajoute /admin uniquement pour les admins.
     */
    if (adminShell) {
      routes.push(adminShell);
    }

    return createBrowserRouter(routes);
  }, [modules, user, isMenuLoading]);

  /**
   * ========================================================
   * LOADING
   * ========================================================
   */
  if (isMenuLoading || !router) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  /**
   * ========================================================
   * ROUTER PROVIDER
   * ========================================================
   */

  return <RouterProvider router={router} />;
}

export default AppRoutes;
