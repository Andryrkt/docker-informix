// src/router/buildRoutesFromMenu.ts
import { type RouteObject } from "react-router";
import routeMap, { type RouteConfig } from "./routeMap";
import type { MenuItem } from "@/domains/authentification/schema/navigationSchema";

interface ModuleNode {
  id: number;
  nom: string;
  menu: MenuItem[];
}

function hasView(node: MenuItem): boolean {
  return node.actions.includes("view");
}

/**
 * Recursively converts a list of MODULES into React Router route objects.
 * Each module contains a `menu` array; those items may contain `sous-menu`.
 */
export function buildRoutesFromMenu(modules: ModuleNode[]): RouteObject[] {
  const routes: RouteObject[] = [];

  for (const module of modules) {
    // Process all top‑level menu items inside the module
    for (const item of module.menu) {
      routes.push(...processMenuItem(item));
    }
  }

  return routes;
}

function processMenuItem(item: MenuItem): RouteObject[] {
  const routes: RouteObject[] = [];

  // If the item itself is a page
  if (item.route && hasView(item)) {
    const config: RouteConfig = routeMap[item.route];
    if (config) {
      const Component = config.component;
      routes.push({
        path: item.route,
        element: <Component />,
        loader: config.loader,
        handle: {
          title: item.nom,
          actions: item.actions,
          scope: item.scope,
        },
      });
    } else {
      console.warn(`No component mapped for route: ${item.route}`);
    }
  }

  // Recurse into sous-menu
  if (item["sous-menu"]?.length) {
    for (const child of item["sous-menu"]) {
      routes.push(...processMenuItem(child));
    }
  }

  return routes;
}
