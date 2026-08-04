// src/components/PermissionBar.tsx
import React from "react";
import { useCurrentRouteHandle } from "@/hooks/useCurrentRouteHandle";

export interface ActionIconDefinition {
  icon: React.ReactNode;
  label: string;
}

const iconStyle = {
  width: 18,
  height: 18,
  stroke: "currentColor",
  fill: "none",
};

export const actionIcons: Record<string, ActionIconDefinition> = {
  view: {
    label: "Voir",
    icon: (
      <svg
        {...iconStyle}
        viewBox="0 0 24 24"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  export: {
    label: "Exporter",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  print: {
    label: "Imprimer",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 12H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
  },
  create: {
    label: "Créer",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  edit: {
    label: "Modifier",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
  },
  delete: {
    label: "Supprimer",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    ),
  },
  validate: {
    label: "Valider",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  approve: {
    label: "Approuver",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
        <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
      </svg>
    ),
  },
  duplicate: {
    label: "Dupliquer",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
    ),
  },
  archive: {
    label: "Archiver",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
      </svg>
    ),
  },
  import: {
    label: "Importer",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  manage_users: {
    label: "Gérer utilisateurs",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  manage_permissions: {
    label: "Gérer permissions",
    icon: (
      <svg {...iconStyle} viewBox="0 0 24 24" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
};

export function PermissionBar() {
  const handle = useCurrentRouteHandle();

  if (!handle) return null; // no route matched (loading)

  const { actions = [], scope } = handle;

  return (
    <div className="flex items-center gap-3 px-4 py-2 mb-4 bg-gray-50 rounded-lg border border-gray-200 text-sm opacity-50 backdrop-blur-md shadow-2xs">
      {/* Actions icons */}
      <div className="flex items-center gap-2">
        {actions.map((action) => {
          const def = actionIcons[action];
          if (!def) return null;
          return (
            <span
              key={action}
              title={def.label}
              className="rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {def.icon}
            </span>
          );
        })}
      </div>

      {/* Agency scope indicator */}
      {scope && (
        <div className="flex items-center gap-2 ml-3 pl-3 border-l border-gray-300">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
          </svg>
          {scope.scopeAll ? (
            <span>Toutes agences</span>
          ) : scope.agencyScopes.length > 0 ? (
            <span>Agences : {scope.agencyScopes.join(", ")}</span>
          ) : (
            <span>Aucune agence (restreint)</span>
          )}
        </div>
      )}
    </div>
  );
}
