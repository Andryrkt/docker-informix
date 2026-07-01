import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminCrudDialog } from "../components/AdminCrudDialog";
import * as api from "../api/adminApi";
import type { Service } from "../api/adminApi";

const emptyForm = { name: "", code: "" };

export default function ServicesPage() {
  const qc = useQueryClient();
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: api.fetchServices,
  });

  const [dialog, setDialog] = useState<{ open: boolean; item: Service | null }>({ open: false, item: null });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const openCreate  = () => { setForm(emptyForm); setErrors({}); setDialog({ open: true, item: null }); };
  const openEdit    = (s: Service) => { setForm({ name: s.name, code: s.code }); setErrors({}); setDialog({ open: true, item: s }); };
  const closeDialog = () => setDialog({ open: false, item: null });

  const validate = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim()) e.name = "Le nom est obligatoire.";
    if (!form.code.trim()) e.code = "Le code est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      dialog.item
        ? api.updateService(dialog.item.id, form)
        : api.createService(form),
    onSuccess: () => {
      toast.success(dialog.item ? "Service modifié." : "Service créé.");
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteService,
    onSuccess: () => {
      toast.success("Service supprimé.");
      qc.invalidateQueries({ queryKey: ["admin", "services"] });
    },
    onError: () => toast.error("Impossible de supprimer ce service."),
  });

  const handleSubmit = () => { if (validate()) saveMutation.mutate(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Services</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} service(s)</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Nouveau service
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={3} className="text-center text-gray-400 py-8">Chargement...</TableCell></TableRow>
            ) : services.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-gray-400 py-8">Aucun service.</TableCell></TableRow>
            ) : services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{s.code}</span></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteMutation.mutate(s.id)}>
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
        title={dialog.item ? "Modifier le service" : "Nouveau service"}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
      >
        <Field data-invalid={!!errors.name}>
          <FieldLabel>Nom</FieldLabel>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="ex: Comptabilité" />
          {errors.name && <FieldError errors={[errors.name]} />}
        </Field>
        <Field data-invalid={!!errors.code}>
          <FieldLabel>Code</FieldLabel>
          <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="ex: COMPTA" maxLength={20} />
          {errors.code && <FieldError errors={[errors.code]} />}
        </Field>
      </AdminCrudDialog>
    </div>
  );
}
