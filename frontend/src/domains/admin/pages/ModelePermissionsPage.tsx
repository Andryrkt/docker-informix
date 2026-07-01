import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PermissionTemplateFormDialog } from "../components/PermissionTemplateFormDialog";
import * as api from "../api/adminApi";
import type { PermissionTemplate, PermissionTemplatePayload } from "../api/adminApi";

export default function ModelePermissionsPage() {
  const qc = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["admin", "permission-templates"],
    queryFn:  api.fetchPermissionTemplates,
  });

  const [dialog, setDialog] = useState<{ open: boolean; item: PermissionTemplate | null }>({
    open: false, item: null,
  });

  const openCreate = () => setDialog({ open: true, item: null });
  const openEdit   = (t: PermissionTemplate) => setDialog({ open: true, item: t });
  const closeDialog = () => setDialog({ open: false, item: null });

  const saveMutation = useMutation({
    mutationFn: (payload: PermissionTemplatePayload) =>
      dialog.item
        ? api.updatePermissionTemplate(dialog.item.id, payload)
        : api.createPermissionTemplate(payload),
    onSuccess: () => {
      toast.success(dialog.item ? "Modèle modifié." : "Modèle créé.");
      qc.invalidateQueries({ queryKey: ["admin", "permission-templates"] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deletePermissionTemplate,
    onSuccess: () => {
      toast.success("Modèle supprimé.");
      qc.invalidateQueries({ queryKey: ["admin", "permission-templates"] });
    },
    onError: () => toast.error("Impossible de supprimer ce modèle."),
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <LayoutTemplate size={20} className="text-gray-500" />
            Modèles de permissions
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Créez des modèles réutilisables pour appliquer rapidement des ensembles de permissions.
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Nouveau modèle
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : templates.length === 0 ? (
        <div className="border rounded-md p-10 text-center text-gray-400">
          <p>Aucun modèle de permissions.</p>
          <Button onClick={openCreate} variant="outline" size="sm" className="mt-4 gap-2">
            <Plus size={14} /> Créer le premier modèle
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Permissions</TableHead>
                <TableHead className="w-20 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-gray-500 text-sm">
                    {t.description ?? <span className="italic text-gray-300">—</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-6 h-6 bg-blue-50 text-blue-700 text-xs font-medium rounded-full px-2">
                      {t.items.length}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (confirm(`Supprimer le modèle « ${t.name} » ?`)) {
                            deleteMutation.mutate(t.id);
                          }
                        }}
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
      )}

      <PermissionTemplateFormDialog
        open={dialog.open}
        onClose={closeDialog}
        onSave={(payload) => saveMutation.mutate(payload)}
        isSubmitting={saveMutation.isPending}
        initial={dialog.item}
      />
    </div>
  );
}
