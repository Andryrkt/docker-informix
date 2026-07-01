import { Building2, Briefcase, Settings, Users, Layers, ShieldCheck } from "lucide-react";
import { NavLink, Outlet } from "react-router";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin/societes",    label: "Sociétés",    icon: Building2   },
  { to: "/admin/agences",     label: "Agences",     icon: Layers      },
  { to: "/admin/services",    label: "Services",    icon: Briefcase   },
  { to: "/admin/utilisateurs",label: "Utilisateurs",icon: Users       },
  { to: "/admin/actions",     label: "Actions",     icon: ShieldCheck },
];

function AdminLayout() {
  return (
    <div className="flex w-full flex-1 min-h-0">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-gray-50 flex flex-col">
        <div className="flex items-center gap-2 px-5 py-4 border-b">
          <Settings size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Administration</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-2 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
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

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
