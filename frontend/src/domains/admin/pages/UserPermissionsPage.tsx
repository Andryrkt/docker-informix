import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Copy, LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PermissionFormDialog } from "../components/PermissionFormDialog";
import { CopyFromUserDialog } from "../components/CopyFromUserDialog";
import { ApplyTemplateDialog } from "../components/ApplyTemplateDialog";
import * as api from "../api/adminApi";
import type { UserPermission, PermissionPayload, CopyMode } from "../api/adminApi";

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
  const [copyDialog,     setCopyDialog]     = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);

  const openCreate  = () => setDialog({ open: true, item: null });
  const openEdit    = (p: UserPermission) => setDialog({ open: true, item: p });
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

  const copyMutation = useMutation({
    mutationFn: ({ sourceUserId, mode }: { sourceUserId: number; mode: CopyMode }) =>
      api.copyPermissionsFromUser(uid, sourceUserId, mode),
    onSuccess: () => {
      toast.success("Permissions copiées avec succès.");
      qc.invalidateQueries({ queryKey: ["admin", "permissions", uid] });
      setCopyDialog(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Erreur lors de la copie.");
    },
  });

  const applyTemplateMutation = useMutation({
    mutationFn: ({ templateId, mode }: { templateId: number; mode: CopyMode }) =>
      api.applyPermissionTemplate(uid, templateId, mode),
    onSuccess: () => {
      toast.success("Modèle appliqué avec succès.");
      qc.invalidateQueries({ queryKey: ["admin", "permissions", uid] });
      setTemplateDialog(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Erreur lors de l'application du modèle.");
    },
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/utilisateurs")} className="gap-1 self-start">
          <ArrowLeft size={15} /> Retour
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            Permissions — {user?.displayName ?? user?.username ?? `Utilisateur #${uid}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{permissions.length} permission(s) au total</p>
        </div>
        {/* Groupe de boutons — s'empile sur mobile, s'aligne sur sm+ */}
        <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:shrink-0">
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setCopyDialog(true)}>
            <Copy size={15} /> Copier depuis…
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setTemplateDialog(true)}>
            <LayoutTemplate size={15} /> Appliquer un modèle
          </Button>
          <Button onClick={openCreate} size="sm" className="gap-2">
            <Plus size={15} /> Ajouter
          </Button>
        </div>
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

          <div className="border rounded-md overflow-x-auto">
            <Table className="min-w-160">
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

      <CopyFromUserDialog
        open={copyDialog}
        onClose={() => setCopyDialog(false)}
        onConfirm={(sourceUserId, mode) => copyMutation.mutate({ sourceUserId, mode })}
        isSubmitting={copyMutation.isPending}
        currentUserId={uid}
      />

      <ApplyTemplateDialog
        open={templateDialog}
        onClose={() => setTemplateDialog(false)}
        onConfirm={(templateId, mode) => applyTemplateMutation.mutate({ templateId, mode })}
        isSubmitting={applyTemplateMutation.isPending}
      />
    </div>
  );
}
