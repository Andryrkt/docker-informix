import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminCrudDialog } from "@/domains/admin/components/AdminCrudDialog";
import { fetchPersonnel } from "@/domains/admin/api/adminApi";
import * as api from "../api/tacheApi";
import type { Tache, TachePayload } from "../api/tacheApi";

const emptyForm: TachePayload = {
  titre: "",
  dateTache: "",
  intervenantId: undefined,
  ticketRef: "",
};

type FormErrors = Partial<Record<"titre" | "dateTache" | "intervenantId", string>>;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

export default function TachesPage() {
  const qc = useQueryClient();

  const { data: taches = [], isLoading } = useQuery({
    queryKey: ["it", "taches"],
    queryFn: api.fetchTaches,
  });

  const { data: personnels = [] } = useQuery({
    queryKey: ["admin", "personnel"],
    queryFn: fetchPersonnel,
  });

  const [dialog, setDialog] = useState<{ open: boolean; item: Tache | null }>({
    open: false, item: null,
  });
  const [form, setForm] = useState<TachePayload>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setDialog({ open: true, item: null });
  };

  const openEdit = (t: Tache) => {
    setForm({
      titre: t.titre,
      dateTache: t.dateTache,
      intervenantId: t.intervenant?.id,
      ticketRef: t.ticketRef ?? "",
    });
    setErrors({});
    setDialog({ open: true, item: t });
  };

  const closeDialog = () => setDialog({ open: false, item: null });

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.titre.trim())    e.titre         = "Le titre est obligatoire.";
    if (!form.dateTache)       e.dateTache     = "La date est obligatoire.";
    if (!form.intervenantId)   e.intervenantId = "L'intervenant est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      dialog.item
        ? api.updateTache(dialog.item.id, form)
        : api.createTache(form),
    onSuccess: () => {
      toast.success(dialog.item ? "Tâche modifiée." : "Tâche créée.");
      qc.invalidateQueries({ queryKey: ["it", "taches"] });
      closeDialog();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: api.toggleTache,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["it", "taches"] }),
    onError: () => toast.error("Impossible de mettre à jour la tâche."),
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteTache,
    onSuccess: () => {
      toast.success("Tâche supprimée.");
      qc.invalidateQueries({ queryKey: ["it", "taches"] });
    },
    onError: () => toast.error("Impossible de supprimer cette tâche."),
  });

  const handleSubmit = () => { if (validate()) saveMutation.mutate(); };

  const set = <K extends keyof TachePayload>(key: K, value: TachePayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const enCours = taches.filter((t) => !t.termine).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Tâches — Support IT</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {enCours} tâche(s) à faire sur {taches.length} au total
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Nouvelle tâche
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Titre</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Intervenant</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : taches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  Aucune tâche pour le moment.
                </TableCell>
              </TableRow>
            ) : taches.map((t) => (
              <TableRow key={t.id} className={t.termine ? "opacity-50" : ""}>
                <TableCell>
                  <button
                    onClick={() => toggleMutation.mutate(t.id)}
                    className="text-gray-400 hover:text-green-600"
                    title={t.termine ? "Marquer à faire" : "Marquer terminée"}
                  >
                    {t.termine ? <CheckCircle2 size={17} className="text-green-600" /> : <Circle size={17} />}
                  </button>
                </TableCell>
                <TableCell className={`font-medium ${t.termine ? "line-through" : ""}`}>
                  {t.titre}
                </TableCell>
                <TableCell className="text-sm text-gray-600">{fmtDate(t.dateTache)}</TableCell>
                <TableCell className="text-sm text-gray-700">
                  {t.intervenant ? `${t.intervenant.nom} ${t.intervenant.prenoms}` : "—"}
                </TableCell>
                <TableCell>
                  {t.ticketRef ? (
                    <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{t.ticketRef}</span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(t.id)}
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

      <AdminCrudDialog
        open={dialog.open}
        onClose={closeDialog}
        title={dialog.item ? "Modifier la tâche" : "Nouvelle tâche"}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <Field data-invalid={!!errors.titre}>
          <FieldLabel>Titre</FieldLabel>
          <Input
            value={form.titre}
            onChange={(e) => set("titre", e.target.value)}
            placeholder="ex: Réinitialiser mot de passe imprimante"
            maxLength={255}
          />
          {errors.titre && <FieldError errors={[{ message: errors.titre }]} />}
        </Field>

        <Field data-invalid={!!errors.dateTache}>
          <FieldLabel>Date</FieldLabel>
          <Input
            type="date"
            value={form.dateTache}
            onChange={(e) => set("dateTache", e.target.value)}
          />
          {errors.dateTache && <FieldError errors={[{ message: errors.dateTache }]} />}
        </Field>

        <Field data-invalid={!!errors.intervenantId}>
          <FieldLabel>Intervenant</FieldLabel>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.intervenantId ?? ""}
            onChange={(e) => set("intervenantId", e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">— Choisir un intervenant —</option>
            {personnels.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nom} {p.prenoms}
              </option>
            ))}
          </select>
          {errors.intervenantId && <FieldError errors={[{ message: errors.intervenantId }]} />}
        </Field>

        <Field>
          <FieldLabel>Ticket <span className="text-gray-400 font-normal">(optionnel)</span></FieldLabel>
          <Input
            value={form.ticketRef ?? ""}
            onChange={(e) => set("ticketRef", e.target.value)}
            placeholder="ex: TIK-2026-042"
            maxLength={100}
          />
        </Field>
      </AdminCrudDialog>
    </div>
  );
}
