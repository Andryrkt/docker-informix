import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { PermissionFormDialog } from "./PermissionFormDialog";
import * as api from "../api/adminApi";
import type {
  PermissionPayload, PermissionTemplate, PermissionTemplatePayload, UserPermission,
} from "../api/adminApi";

// ── Local type: payload + display info for list rendering ──────────────────

type DraftItem = PermissionPayload & {
  _key: string;
  companyName: string;
  companyCode: string;
  resourceLabel: string;
};

function deriveDisplay(
  payload: PermissionPayload,
  companies: api.Company[],
  modules: api.AppModule[],
): Pick<DraftItem, "companyName" | "companyCode" | "resourceLabel"> {
  const company = companies.find((c) => c.id === payload.companyId);

  let resourceLabel = "—";
  if (payload.resourceType === "module") {
    const mod = modules.find((m) => m.id === payload.resourceId);
    resourceLabel = mod?.label ?? `Module #${payload.resourceId}`;
  } else {
    outer: for (const mod of modules) {
      for (const menu of mod.menus) {
        if (menu.id === payload.resourceId) { resourceLabel = menu.label; break outer; }
        const sub = menu.subMenus.find((s) => s.id === payload.resourceId);
        if (sub) { resourceLabel = sub.label; break outer; }
      }
    }
  }

  return {
    companyName:   company?.name ?? `Société #${payload.companyId}`,
    companyCode:   company?.code ?? "?",
    resourceLabel,
  };
}

function itemToUserPermission(item: DraftItem): UserPermission {
  return {
    id:            0,
    company:       { id: item.companyId, name: item.companyName, code: item.companyCode },
    resourceType:  item.resourceType,
    resourceId:    item.resourceId,
    resourceLabel: item.resourceLabel,
    actions:       item.actions,
    scopeAll:      item.scopeAll,
    agencyScopes:  item.agencyScopes,
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

let _counter = 0;
const nextKey = () => String(++_counter);

const ACTION_LABELS: Record<string, string> = {
  view: "Voir", create: "Créer", edit: "Modifier", delete: "Supprimer",
  validate: "Valider", approve: "Approuver", duplicate: "Dupliquer",
  archive: "Archiver", export: "Exporter", print: "Imprimer",
  import: "Importer", manage_users: "Gest. users", manage_permissions: "Gest. perms",
};

// ── Props ──────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payload: PermissionTemplatePayload) => void;
  isSubmitting?: boolean;
  initial?: PermissionTemplate | null;
}

// ── Component ──────────────────────────────────────────────────────────────

export function PermissionTemplateFormDialog({ open, onClose, onSave, isSubmitting, initial }: Props) {
  const { data: companies = [] } = useQuery({ queryKey: ["admin", "companies"], queryFn: api.fetchCompanies });
  const { data: modules   = [] } = useQuery({ queryKey: ["admin", "modules"],   queryFn: api.fetchModules   });

  const [name,        setName]        = useState("");
  const [description, setDescription] = useState("");
  const [items,       setItems]       = useState<DraftItem[]>([]);
  const [errors,      setErrors]      = useState<{ name?: string; items?: string }>({});

  // Sub-dialog for adding/editing an individual permission item
  const [itemDialog, setItemDialog] = useState<{ open: boolean; editing: DraftItem | null }>({
    open: false, editing: null,
  });

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setName(initial.name);
      setDescription(initial.description ?? "");
      setItems(
        initial.items.map((it) => ({
          _key:         nextKey(),
          companyId:    it.company.id,
          resourceType: it.resourceType,
          resourceId:   it.resourceId,
          actions:      it.actions,
          scopeAll:     it.scopeAll,
          agencyScopes: it.agencyScopes,
          companyName:  it.company.name,
          companyCode:  it.company.code,
          resourceLabel: it.resourceLabel,
        })),
      );
    } else {
      setName("");
      setDescription("");
      setItems([]);
    }
    setErrors({});
  }, [open, initial]);

  const openAdd  = () => setItemDialog({ open: true, editing: null });
  const openEdit = (item: DraftItem) => setItemDialog({ open: true, editing: item });
  const closeItemDialog = () => setItemDialog({ open: false, editing: null });

  const handleItemSave = (payload: PermissionPayload) => {
    const display = deriveDisplay(payload, companies, modules);
    if (itemDialog.editing) {
      setItems((prev) =>
        prev.map((it) =>
          it._key === itemDialog.editing!._key
            ? { ...payload, _key: it._key, ...display }
            : it,
        ),
      );
    } else {
      setItems((prev) => [...prev, { ...payload, _key: nextKey(), ...display }]);
    }
    closeItemDialog();
  };

  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((it) => it._key !== key));

  const validate = () => {
    const e: { name?: string; items?: string } = {};
    if (!name.trim()) e.name = "Le nom du modèle est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload: PermissionTemplatePayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      items: items.map(({ companyId, resourceType, resourceId, actions, scopeAll, agencyScopes }) => ({
        companyId, resourceType, resourceId, actions, scopeAll, agencyScopes,
      })),
    };
    onSave(payload);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {initial ? "Modifier le modèle" : "Nouveau modèle de permissions"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Nom */}
            <Field data-invalid={!!errors.name}>
              <FieldLabel>Nom du modèle</FieldLabel>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex : Responsable atelier"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && <FieldError errors={[{ message: errors.name }]} />}
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel>Description <span className="text-gray-400 font-normal">(optionnelle)</span></FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez l'usage de ce modèle…"
                rows={2}
                className="w-full border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </Field>

            {/* Items */}
            <Field>
              <div className="flex items-center justify-between mb-1.5">
                <FieldLabel className="mb-0">Permissions ({items.length})</FieldLabel>
                <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs" onClick={openAdd}>
                  <Plus size={13} /> Ajouter
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="border border-dashed rounded-md p-6 text-center text-gray-400 text-sm">
                  Aucune permission. Cliquez sur « Ajouter » pour en configurer une.
                </div>
              ) : (
                <div className="border rounded-md divide-y max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item._key} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            item.resourceType === "module"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-purple-50 text-purple-700"
                          }`}>
                            {item.resourceType === "module" ? "Module" : "Menu"}
                          </span>
                          <span className="text-sm font-medium truncate">{item.resourceLabel}</span>
                          <span className="font-mono text-xs text-gray-400">{item.companyCode}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.actions.map((a) => ACTION_LABELS[a] ?? a).join(", ")}
                          {" · "}
                          {item.scopeAll ? "Accès complet" : `${item.agencyScopes.length} agence(s)`}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(item)}>
                          <Pencil size={13} />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item._key)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sub-dialog: ajouter / éditer un item */}
      <PermissionFormDialog
        open={itemDialog.open}
        onClose={closeItemDialog}
        onSave={handleItemSave}
        initial={itemDialog.editing ? itemToUserPermission(itemDialog.editing) : null}
      />
    </>
  );
}
