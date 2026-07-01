import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PermissionFormDialog } from "../components/PermissionFormDialog";
import * as api from "../api/adminApi";
import type { UserPermission, PermissionPayload } from "../api/adminApi";

const ACTION_LABELS: Record<string, string> = {
  view: "Voir", create: "Créer", edit: "Modifier", delete: "Supprimer",
  validate: "Valider", approve: "Approuver", duplicate: "Dupliquer",
  archive: "Archiver", export: "Exporter", print: "Imprimer",
  import: "Importer", manage_users: "Gest. users", manage_permissions: "Gest. perms",
};

export default function UserPermissionsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate   = useNavigate();
  const qc         = useQueryClient();
  const uid        = Number(userId);

  const { data: users = [] } = useQuery({ queryKey: ["admin", "users"], queryFn: api.fetchAdminUsers });
  const user = users.find((u) => u.id === uid);

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ["admin", "permissions", uid],
    queryFn:  () => api.fetchUserPermissions(uid),
    enabled:  !!uid,
  });

  const [dialog, setDialog] = useState<{ open: boolean; item: UserPermission | null }>({
    open: false, item: null,
  });

  const openCreate = () => setDialog({ open: true, item: null });
  const openEdit   = (p: UserPermission) => setDialog({ open: true, item: p });
  const closeDialog = () => setDialog({ open: false, item: null });

  const saveMutation = useMutation({
    mutationFn: (payload: PermissionPayload) =>
      dialog.item
        ? api.updateUserPermission(dialog.item.id, payload)
        : api.createUserPermission(uid, payload),
    onSuccess: () => {
      toast.success(dialog.item ? "Permission modifiée." : "Permission ajoutée.");
      qc.invalidateQueries({ queryKey: ["admin", "permissions", uid] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteUserPermission,
    onSuccess: () => {
      toast.success("Permission supprimée.");
      qc.invalidateQueries({ queryKey: ["admin", "permissions", uid] });
    },
    onError: () => toast.error("Impossible de supprimer cette permission."),
  });

  // Grouper par société
  const grouped = permissions.reduce<Record<number, { company: UserPermission["company"]; perms: UserPermission[] }>>(
    (acc, p) => {
      if (!acc[p.company.id]) acc[p.company.id] = { company: p.company, perms: [] };
      acc[p.company.id].perms.push(p);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/utilisateurs")} className="gap-1">
          <ArrowLeft size={15} /> Retour
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800">
            Permissions — {user?.displayName ?? user?.username ?? `Utilisateur #${uid}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{permissions.length} permission(s) au total</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Ajouter une permission
        </Button>
      </div>

      {/* Permissions groupées par société */}
      {isLoading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="border rounded-md p-10 text-center text-gray-400">
          <p>Aucune permission configurée pour cet utilisateur.</p>
          <Button onClick={openCreate} variant="outline" size="sm" className="mt-4 gap-2">
            <Plus size={14} /> Ajouter la première permission
          </Button>
        </div>
      ) : Object.values(grouped).map(({ company, perms }) => (
        <div key={company.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{company.name}</span>
            <span className="font-mono text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{company.code}</span>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Portée</TableHead>
                  <TableHead className="w-20 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {perms.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        p.resourceType === "module"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}>
                        {p.resourceType === "module" ? "Module" : "Menu"}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{p.resourceLabel}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {p.actions.map((a) => (
                          <span key={a} className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                            {ACTION_LABELS[a] ?? a}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {p.scopeAll ? (
                        <span className="text-xs text-gray-400 italic">Accès complet</span>
                      ) : (p.agencyScopes ?? []).length === 0 ? (
                        <span className="text-xs text-amber-600">Aucune agence</span>
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          {(p.agencyScopes ?? []).map((s) => (
                            <span key={s.agencyId} className="text-xs">
                              Agence #{s.agencyId} —{" "}
                              {s.allServices ? "tous les services" : `${(s.serviceIds ?? []).length} service(s)`}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil size={14} /></Button>
                        <Button
                          variant="ghost" size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteMutation.mutate(p.id)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}

      <PermissionFormDialog
        open={dialog.open}
        onClose={closeDialog}
        onSave={(payload) => saveMutation.mutate(payload)}
        isSubmitting={saveMutation.isPending}
        initial={dialog.item}
      />
    </div>
  );
}
