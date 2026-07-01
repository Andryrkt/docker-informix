import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminCrudDialog } from "../components/AdminCrudDialog";
import * as api from "../api/adminApi";
import type { ActionDef } from "../api/adminApi";

interface FormState {
  actionKey: string;
  label: string;
  category: string;
  sortOrder: string;
}

const emptyForm: FormState = { actionKey: "", label: "", category: "", sortOrder: "0" };

const CATEGORY_COLORS: Record<string, string> = {
  "Lecture":        "bg-blue-50 text-blue-700",
  "Ã‰criture":       "bg-orange-50 text-orange-700",
  "MÃ©tier":         "bg-green-50 text-green-700",
  "Import":         "bg-yellow-50 text-yellow-700",
  "Administration": "bg-red-50 text-red-700",
};

export default function ActionsPage() {
  const qc = useQueryClient();
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["admin", "actions"],
    queryFn: api.fetchActionDefs,
  });

  const [dialog, setDialog] = useState<{ open: boolean; item: ActionDef | null }>({ open: false, item: null });
  const [form, setForm]     = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const openCreate = () => { setForm(emptyForm); setErrors({}); setDialog({ open: true, item: null }); };
  const openEdit   = (a: ActionDef) => {
    setForm({ actionKey: a.actionKey, label: a.label, category: a.category ?? "", sortOrder: String(a.sortOrder) });
    setErrors({});
    setDialog({ open: true, item: a });
  };
  const closeDialog = () => setDialog({ open: false, item: null });

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.actionKey.trim()) {
      e.actionKey = "La clÃ© est obligatoire.";
    } else if (!/^[a-z][a-z0-9_]*$/.test(form.actionKey)) {
      e.actionKey = "Minuscules + chiffres + _ uniquement (ex: export_pdf).";
    }
    if (!form.label.trim()) e.label = "Le libellÃ© est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        actionKey: form.actionKey,
        label:     form.label,
        category:  form.category || null,
        sortOrder: parseInt(form.sortOrder, 10) || 0,
      };
      return dialog.item
        ? api.updateActionDef(dialog.item.id, payload)
        : api.createActionDef(payload);
    },
    onSuccess: () => {
      toast.success(dialog.item ? "Action modifiÃ©e." : "Action crÃ©Ã©e.");
      qc.invalidateQueries({ queryKey: ["admin", "actions"] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteActionDef,
    onSuccess: () => {
      toast.success("Action supprimÃ©e.");
      qc.invalidateQueries({ queryKey: ["admin", "actions"] });
    },
    onError: () => toast.error("Impossible de supprimer cette action."),
  });

  // Grouper par catÃ©gorie
  const grouped = actions.reduce<Record<string, ActionDef[]>>((acc, a) => {
    const cat = a.category ?? "Sans catÃ©gorie";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Actions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {actions.length} action(s) â€” utilisÃ©es dans les permissions
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Nouvelle action
        </Button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${CATEGORY_COLORS[category] ?? "bg-gray-100 text-gray-600"}`}>
                {category}
              </span>
              <span className="text-xs text-gray-400">{items.length} action(s)</span>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ClÃ© technique</TableHead>
                    <TableHead>LibellÃ©</TableHead>
                    <TableHead className="w-20">Ordre</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{a.actionKey}</span>
                      </TableCell>
                      <TableCell className="font-medium">{a.label}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{a.sortOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(a)}>
                            <Pencil size={14} />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteMutation.mutate(a.id)}
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
        ))
      )}

      <AdminCrudDialog
        open={dialog.open}
        onClose={closeDialog}
        title={dialog.item ? "Modifier l'action" : "Nouvelle action"}
        onSubmit={() => { if (validate()) saveMutation.mutate(); }}
        isSubmitting={saveMutation.isPending}
      >
        <Field data-invalid={!!errors.actionKey}>
          <FieldLabel>ClÃ© technique</FieldLabel>
          <Input
            value={form.actionKey}
            onChange={(e) => setForm((f) => ({ ...f, actionKey: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
            placeholder="ex: export_pdf"
            disabled={!!dialog.item}
          />
          <p className="text-xs text-gray-400">Minuscules, chiffres et _ uniquement. Non modifiable aprÃ¨s crÃ©ation.</p>
          {errors.actionKey && <FieldError errors={[{ message: errors.actionKey }]} />}
        </Field>

        <Field data-invalid={!!errors.label}>
          <FieldLabel>LibellÃ© affichÃ©</FieldLabel>
          <Input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="ex: Exporter en PDF"
          />
          {errors.label && <FieldError errors={[{ message: errors.label }]} />}
        </Field>

        <Field>
          <FieldLabel>CatÃ©gorie</FieldLabel>
          <Input
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="ex: Lecture, Ã‰criture, MÃ©tierâ€¦"
          />
        </Field>

        <Field>
          <FieldLabel>Ordre d'affichage</FieldLabel>
          <Input
            type="number"
            value={form.sortOrder}
            onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
            min={0}
          />
        </Field>
      </AdminCrudDialog>
    </div>
  );
}
