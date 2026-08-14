// src/router/buildRoutesFromMenu.ts

import { type RouteObject } from "react-router";
import routeMap, {
  internalRouteMap,
  type RouteConfig,
  type ModuleAction,
} from "./routeMap";

import type { MenuItem } from "@/domains/authentification/schema/navigationSchema";

/* =========================================================
 * TYPES
 * ======================================================= */

interface ModuleNode {
  id: number;
  nom: string;
  menu: MenuItem[];
}

/* =========================================================
 * PERMISSIONS
 * ======================================================= */

/**
 * Vérifie que le menu possède l'action demandée.
 *
 * Exemple :
 *
 * actions: ["view", "create", "edit"]
 *
 * hasAction(item, "view")   => true
 * hasAction(item, "delete") => false
 */
function hasAction(item: MenuItem, action: ModuleAction): boolean {
  return item.actions?.includes(action) ?? false;
}

/**
 * Une route principale est accessible si l'item possède "view".
 */
function hasView(item: MenuItem): boolean {
  return hasAction(item, "view");
}

/* =========================================================
 * INTERNAL ROUTES
 * ======================================================= */

/**
 * Construit les routes internes associées à une route/menu.
 *
 * Exemple :
 *
 * /atelier/demande-intervention
 *
 * peut automatiquement recevoir :
 *
 * /atelier/demande-intervention/dit-list
 * /atelier/demande-intervention/new
 * /atelier/demande-intervention/details/:numeroDemandeIntervention
 * /atelier/demande-intervention/duplication/:numeroDemandeIntervention
 *
 * selon les actions présentes dans item.actions.
 */
function buildInternalRoutes(
  parentRoute: string,
  item: MenuItem,
): RouteObject[] {
  const configs = internalRouteMap[parentRoute] ?? [];

  const routes: RouteObject[] = [];

  for (const config of configs) {
    /**
     * Si la route interne demande une action,
     * on vérifie que le menu l'autorise.
     */
    if (config.action) {
      if (!hasAction(item, config.action)) {
        continue;
      }
    }

    routes.push({
      path: config.path,
      element: <config.component />,

      ...(config.loader
        ? {
            loader: config.loader,
          }
        : {}),

      handle: {
        title: config.title,
        actions: item.actions,
        scope: item.scope,

        /**
         * Cette route ne vient pas du menu.
         * Elle ne doit donc pas être utilisée
         * pour construire le menu/breadcrumb de navigation.
         */
        hideFromMenu: true,

        /**
         * Permet de savoir de quel menu/module
         * provient cette route.
         */
        parentRoute,
      },
    });
  }

  return routes;
}

/* =========================================================
 * MAIN ROUTE
 * ======================================================= */

/**
 * Construit une route React Router à partir
 * d'un MenuItem.
 */
function processMenuItem(item: MenuItem): RouteObject[] {
  const routes: RouteObject[] = [];

  /* =======================================================
   * ROUTE PRINCIPALE
   * ===================================================== */

  if (item.route && hasView(item)) {
    const config: RouteConfig = routeMap[item.route];

    if (config) {
      const Component = config.component;

      /**
       * Routes internes du module.
       *
       * Elles sont ajoutées comme children
       * lorsqu'elles sont définies dans internalRouteMap.
       */
      const internalRoutes = buildInternalRoutes(item.route, item);

      routes.push({
        path: item.route,

        element: <Component />,

        ...(config.loader
          ? {
              loader: config.loader,
            }
          : {}),

        handle: {
          title: item.nom,
          actions: item.actions,
          scope: item.scope,
        },

        /**
         * On ajoute les routes internes
         * comme enfants uniquement s'il y en a.
         */
        ...(internalRoutes.length > 0
          ? {
              children: internalRoutes,
            }
          : {}),
      });
    } else {
      console.warn(`[Routing] No component mapped for route: ${item.route}`);
    }
  }

  /* =======================================================
   * SOUS-MENU
   * ===================================================== */

  if (item["sous-menu"]?.length) {
    for (const child of item["sous-menu"]) {
      routes.push(...processMenuItem(child));
    }
  }

  return routes;
}

/* =========================================================
 * PUBLIC API
 * ======================================================= */

/**
 * Recursively converts a list of MODULES
 * into React Router route objects.
 *
 * Structure :
 *
 * modules
 *   └── menu
 *        └── sous-menu
 *
 * Le backend reste responsable du menu
 * et des actions disponibles.
 *
 * Le frontend ajoute les routes internes
 * qui ne doivent pas apparaître dans le menu.
 */
export function buildRoutesFromMenu(modules: ModuleNode[]): RouteObject[] {
  const routes: RouteObject[] = [];

  for (const module of modules) {
    /**
     * Chaque module contient un tableau de menu.
     */
    for (const item of module.menu) {
      routes.push(...processMenuItem(item));
    }
  }

  return routes;
}

export default buildRoutesFromMenu;
