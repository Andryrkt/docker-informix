import { useState } from "react";
import { Building2, Briefcase, LayoutTemplate, Menu, Settings, Users, Layers, ShieldCheck, X } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/societes",     label: "Sociétés",    icon: Building2    },
  { to: "/admin/agences",      label: "Agences",     icon: Layers       },
  { to: "/admin/services",     label: "Services",    icon: Briefcase    },
  { to: "/admin/utilisateurs", label: "Utilisateurs",icon: Users        },
  { to: "/admin/actions",      label: "Actions",     icon: ShieldCheck  },
  { to: "/admin/modeles",      label: "Modèles",     icon: LayoutTemplate },
];

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center justify-between gap-2 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Administration</span>
        </div>
        {/* Fermer sur mobile */}
        <button
          className="md:hidden p-1 rounded hover:bg-gray-200 text-gray-500"
          onClick={() => setMobileOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={16} />
        </button>
      </div>
      <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );

  return (
    <div className="flex w-full flex-1 min-h-0">
      {/* ── Sidebar desktop (toujours visible ≥ md) ── */}
      <div className="hidden md:flex w-56 shrink-0 border-r flex-col">
        {sidebar}
      </div>

      {/* ── Overlay + sidebar mobile (< md) ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Voile sombre */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative z-50 w-64 border-r shadow-lg">
            {sidebar}
          </div>
        </div>
      )}

      {/* ── Zone de contenu ── */}
      <div className="flex-1 overflow-auto">
        {/* Barre mobile avec bouton hamburger */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-white sticky top-0 z-30">
          <button
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-700">Administration</span>
        </div>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
