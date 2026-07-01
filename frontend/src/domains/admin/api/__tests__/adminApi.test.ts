import { describe, it, expect } from "vitest";
import type { AgencyScope, UserPermission, PermissionTemplate } from "../adminApi";

/**
 * Tests unitaires pour les types et la structure des données admin.
 * Aucun appel HTTP — on vérifie uniquement que les structures de données
 * sont cohérentes avec ce que l'API doit retourner.
 */

describe("AgencyScope", () => {
  it("supporte allServices=true avec serviceIds vide", () => {
    const scope: AgencyScope = { agencyId: 1, allServices: true, serviceIds: [] };

    expect(scope.agencyId).toBe(1);
    expect(scope.allServices).toBe(true);
    expect(scope.serviceIds).toHaveLength(0);
  });

  it("supporte allServices=false avec serviceIds remplis", () => {
    const scope: AgencyScope = { agencyId: 2, allServices: false, serviceIds: [10, 20] };

    expect(scope.allServices).toBe(false);
    expect(scope.serviceIds).toContain(10);
    expect(scope.serviceIds).toContain(20);
  });
});

describe("UserPermission", () => {
  const basePermission: UserPermission = {
    id:            1,
    company:       { id: 1, name: "HFF", code: "HFF" },
    resourceType:  "module",
    resourceId:    1,
    resourceLabel: "Magasin",
    actions:       ["view", "edit"],
    scopeAll:      true,
    agencyScopes:  [],
  };

  it("a une structure scopeAll=true avec agencyScopes vide", () => {
    expect(basePermission.scopeAll).toBe(true);
    expect(basePermission.agencyScopes).toHaveLength(0);
  });

  it("a une structure scopeAll=false avec agencyScopes remplis", () => {
    const restricted: UserPermission = {
      ...basePermission,
      scopeAll:     false,
      agencyScopes: [{ agencyId: 1, allServices: false, serviceIds: [1, 2] }],
    };

    expect(restricted.scopeAll).toBe(false);
    expect(restricted.agencyScopes).toHaveLength(1);
    expect(restricted.agencyScopes[0].agencyId).toBe(1);
    expect(restricted.agencyScopes[0].serviceIds).toHaveLength(2);
  });

  it("accepte resourceType 'menu'", () => {
    const menuPerm: UserPermission = { ...basePermission, resourceType: "menu" };
    expect(menuPerm.resourceType).toBe("menu");
  });
});

describe("PermissionTemplate", () => {
  const template: PermissionTemplate = {
    id:          1,
    name:        "Responsable atelier",
    description: "Accès complet atelier",
    items: [
      {
        id:            1,
        company:       { id: 1, name: "HFF", code: "HFF" },
        resourceType:  "module",
        resourceId:    2,
        resourceLabel: "Atelier",
        actions:       ["view", "edit", "validate"],
        scopeAll:      true,
        agencyScopes:  [],
      },
    ],
  };

  it("a un nom et une description", () => {
    expect(template.name).toBe("Responsable atelier");
    expect(template.description).toBe("Accès complet atelier");
  });

  it("contient des items structurellement identiques à UserPermission", () => {
    const item = template.items[0];
    expect(item.id).toBeDefined();
    expect(item.company).toBeDefined();
    expect(item.resourceType).toMatch(/^(module|menu)$/);
    expect(item.actions).toBeInstanceOf(Array);
    expect(typeof item.scopeAll).toBe("boolean");
    expect(item.agencyScopes).toBeInstanceOf(Array);
  });

  it("supporte description=null", () => {
    const t: PermissionTemplate = { ...template, description: null };
    expect(t.description).toBeNull();
  });
});
