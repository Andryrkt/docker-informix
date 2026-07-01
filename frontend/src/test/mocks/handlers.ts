import { http, HttpResponse } from "msw";

// Base URL identique à celle de l'axios instance en mode dev/test
const BASE = "http://localhost:8080/api";

// ── Fixtures de test ──────────────────────────────────────────────────────

export const mockUsers = [
  { id: 1, username: "lanto",   displayName: "Lanto R.", email: "lanto@hff.mg",  department: "IT",      roles: ["ROLE_USER"], lastLoginAt: null },
  { id: 2, username: "admin",   displayName: "Admin HFF", email: "admin@hff.mg", department: "DSI",     roles: ["ROLE_ADMIN"], lastLoginAt: null },
  { id: 3, username: "hoby",    displayName: "Hoby R.",   email: "hoby@hff.mg",  department: "Achats",  roles: ["ROLE_USER"], lastLoginAt: null },
];

export const mockCompanies = [
  { id: 1, name: "HFF",    code: "HFF" },
  { id: 2, name: "FRAISE", code: "FS"  },
];

export const mockAgencies = [
  {
    id: 1, name: "Antananarivo", code: "01",
    company: { id: 1, name: "HFF", code: "HFF" },
    services: [
      { id: 1, name: "Négoce",   code: "NEG" },
      { id: 2, name: "Atelier",  code: "ATE" },
    ],
  },
  {
    id: 2, name: "Tamatave", code: "30",
    company: { id: 1, name: "HFF", code: "HFF" },
    services: [
      { id: 1, name: "Négoce",   code: "NEG" },
      { id: 3, name: "Transit",  code: "TRA" },
    ],
  },
];

export const mockModules = [
  {
    id: 1, label: "Magasin", slug: "magasin",
    menus: [
      { id: 10, label: "Devis",    slug: "devis",    subMenus: [] },
      { id: 11, label: "Planning", slug: "planning", subMenus: [] },
    ],
  },
  {
    id: 2, label: "Atelier", slug: "atelier",
    menus: [
      { id: 20, label: "Demandes d'intervention", slug: "dit", subMenus: [] },
    ],
  },
];

export const mockTemplates = [
  {
    id: 1,
    name: "Responsable atelier",
    description: "Accès complet au module Atelier",
    items: [
      {
        id: 1,
        company:       { id: 1, name: "HFF", code: "HFF" },
        resourceType:  "module",
        resourceId:    2,
        resourceLabel: "Atelier",
        actions:       ["view", "edit", "validate"],
        scopeAll:      true,
        agencyScopes:  [],
      },
    ],
  },
  {
    id: 2,
    name: "Lecteur Magasin",
    description: null,
    items: [
      {
        id: 2,
        company:       { id: 1, name: "HFF", code: "HFF" },
        resourceType:  "module",
        resourceId:    1,
        resourceLabel: "Magasin",
        actions:       ["view"],
        scopeAll:      false,
        agencyScopes:  [{ agencyId: 1, allServices: true, serviceIds: [] }],
      },
    ],
  },
];

export const mockPermissions = [
  {
    id: 1,
    company:       { id: 1, name: "HFF", code: "HFF" },
    resourceType:  "module",
    resourceId:    1,
    resourceLabel: "Magasin",
    actions:       ["view", "edit"],
    scopeAll:      true,
    agencyScopes:  [],
  },
];

export const mockActions = [
  { id: 1, actionKey: "view",   label: "Voir",     category: "Lecture",  sortOrder: 1 },
  { id: 2, actionKey: "create", label: "Créer",    category: "Écriture", sortOrder: 4 },
  { id: 3, actionKey: "edit",   label: "Modifier", category: "Écriture", sortOrder: 5 },
  { id: 4, actionKey: "delete", label: "Supprimer",category: "Écriture", sortOrder: 6 },
];

// ── Handlers MSW ──────────────────────────────────────────────────────────

export const handlers = [
  // Utilisateurs
  http.get(`${BASE}/admin/users`, () =>
    HttpResponse.json(mockUsers),
  ),

  // Modèles de permissions
  http.get(`${BASE}/admin/permission-templates`, () =>
    HttpResponse.json(mockTemplates),
  ),
  http.get(`${BASE}/admin/permission-templates/:id`, ({ params }) => {
    const template = mockTemplates.find((t) => t.id === Number(params.id));
    if (!template) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(template);
  }),
  http.post(`${BASE}/admin/permission-templates`, () =>
    HttpResponse.json({ id: 99, name: "Nouveau modèle", description: null, items: [] }, { status: 201 }),
  ),
  http.put(`${BASE}/admin/permission-templates/:id`, () =>
    HttpResponse.json({ id: 1, name: "Modèle mis à jour", description: null, items: [] }),
  ),
  http.delete(`${BASE}/admin/permission-templates/:id`, () =>
    new HttpResponse(null, { status: 204 }),
  ),

  // Sociétés
  http.get(`${BASE}/admin/companies`, () =>
    HttpResponse.json(mockCompanies),
  ),

  // Agences
  http.get(`${BASE}/admin/agencies`, () =>
    HttpResponse.json(mockAgencies),
  ),

  // Modules
  http.get(`${BASE}/admin/modules`, () =>
    HttpResponse.json(mockModules),
  ),

  // Actions
  http.get(`${BASE}/admin/actions`, () =>
    HttpResponse.json(mockActions),
  ),

  // Permissions utilisateur
  http.get(`${BASE}/admin/users/:userId/permissions`, () =>
    HttpResponse.json(mockPermissions),
  ),
  http.post(`${BASE}/admin/users/:userId/copy-from/:sourceId`, () =>
    HttpResponse.json(mockPermissions),
  ),
  http.post(`${BASE}/admin/users/:userId/apply-template/:templateId`, () =>
    HttpResponse.json(mockPermissions),
  ),
];
