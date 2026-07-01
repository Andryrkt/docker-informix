import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, UserCheck } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import * as api from "../api/adminApi";

export default function UtilisateursPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: api.fetchAdminUsers,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {users.length} utilisateur(s) — créés automatiquement à la première connexion LDAP
          </p>
        </div>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-160">
          <TableHeader>
            <TableRow>
              <TableHead>Nom complet</TableHead>
              <TableHead>Identifiant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Département</TableHead>
              <TableHead>Rôles</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead className="text-right">Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">Chargement...</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">Aucun utilisateur.</TableCell>
              </TableRow>
            ) : users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shrink-0">
                      {(u.displayName ?? u.username).charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">{u.displayName ?? u.username}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-600">{u.username}</TableCell>
                <TableCell className="text-sm text-gray-600">{u.email ?? "—"}</TableCell>
                <TableCell className="text-sm text-gray-600">{u.department ?? "—"}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.filter((r) => r !== "ROLE_USER").map((r) => (
                      <span key={r} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                        {r.replace("ROLE_", "")}
                      </span>
                    ))}
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded flex items-center gap-1">
                      <UserCheck size={10} /> USER
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500">{u.lastLoginAt ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Link to={`/admin/utilisateurs/${u.id}/permissions`}>
                      <ShieldCheck size={13} />
                      Permissions
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
