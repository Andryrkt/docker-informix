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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AdminCrudDialog } from "../components/AdminCrudDialog";
import * as api from "../api/adminApi";
import type { Agency } from "../api/adminApi";

interface AgenceForm {
  name: string;
  code: string;
  companyId: string;
  serviceIds: number[];
}

const emptyForm: AgenceForm = { name: "", code: "", companyId: "", serviceIds: [] };

export default function AgencesPage() {
  const qc = useQueryClient();

  const { data: agencies  = [], isLoading } = useQuery({ queryKey: ["admin", "agencies"],  queryFn: api.fetchAgencies  });
  const { data: companies = [] }            = useQuery({ queryKey: ["admin", "companies"], queryFn: api.fetchCompanies });
  const { data: services  = [] }            = useQuery({ queryKey: ["admin", "services"],  queryFn: api.fetchServices  });

  const [dialog, setDialog] = useState<{ open: boolean; item: Agency | null }>({ open: false, item: null });
  const [form,   setForm]   = useState<AgenceForm>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AgenceForm, string>>>({});

  const openCreate = () => { setForm(emptyForm); setErrors({}); setDialog({ open: true, item: null }); };
  const openEdit   = (a: Agency) => {
    setForm({ name: a.name, code: a.code, companyId: String(a.company.id), serviceIds: a.services.map((s) => s.id) });
    setErrors({});
    setDialog({ open: true, item: a });
  };
  const closeDialog = () => setDialog({ open: false, item: null });

  const validate = () => {
    const e: Partial<Record<keyof AgenceForm, string>> = {};
    if (!form.name.trim())    e.name      = "Le nom est obligatoire.";
    if (!form.code.trim())    e.code      = "Le code est obligatoire.";
    if (!form.companyId)      e.companyId = "La société est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        code: form.code,
        companyId: Number(form.companyId),
        serviceIds: form.serviceIds,
      };
      return dialog.item
        ? api.updateAgency(dialog.item.id, payload)
        : api.createAgency(payload);
    },
    onSuccess: () => {
      toast.success(dialog.item ? "Agence modifiée." : "Agence créée.");
      qc.invalidateQueries({ queryKey: ["admin", "agencies"] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteAgency,
    onSuccess: () => {
      toast.success("Agence supprimée.");
      qc.invalidateQueries({ queryKey: ["admin", "agencies"] });
    },
    onError: () => toast.error("Impossible de supprimer cette agence."),
  });

  const toggleService = (id: number) => {
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(id)
        ? f.serviceIds.filter((s) => s !== id)
        : [...f.serviceIds, id],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Agences</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agencies.length} agence(s)</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Nouvelle agence
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-96">
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Société</TableHead>
              <TableHead>Services</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">Chargement...</TableCell></TableRow>
            ) : agencies.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-8">Aucune agence.</TableCell></TableRow>
            ) : agencies.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{a.code}</span></TableCell>
                <TableCell className="text-sm text-gray-600">{a.company.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {a.services.map((s) => (
                      <span key={s.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{s.name}</span>
                    ))}
                    {a.services.length === 0 && <span className="text-xs text-gray-400">—</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteMutation.mutate(a.id)}>
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
        title={dialog.item ? "Modifier l'agence" : "Nouvelle agence"}
        onSubmit={() => { if (validate()) saveMutation.mutate(); }}
        isSubmitting={saveMutation.isPending}
      >
        <Field data-invalid={!!errors.name}>
          <FieldLabel>Nom</FieldLabel>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="ex: Agence Antananarivo" />
          {errors.name && <FieldError errors={[{ message: errors.name }]} />}
        </Field>

        <Field data-invalid={!!errors.code}>
          <FieldLabel>Code</FieldLabel>
          <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="ex: AGC-TNR" maxLength={20} />
          {errors.code && <FieldError errors={[{ message: errors.code }]} />}
        </Field>

        <Field data-invalid={!!errors.companyId}>
          <FieldLabel>Société</FieldLabel>
          <Select value={form.companyId} onValueChange={(v) => setForm((f) => ({ ...f, companyId: v }))}>
            <SelectTrigger><SelectValue placeholder="Choisir une société" /></SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.companyId && <FieldError errors={[{ message: errors.companyId }]} />}
        </Field>

        <Field>
          <FieldLabel>Services rattachés</FieldLabel>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto border rounded-md p-2">
            {services.length === 0 && <span className="text-xs text-gray-400">Aucun service disponible.</span>}
            {services.map((s) => (
              <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.serviceIds.includes(s.id)}
                  onChange={() => toggleService(s.id)}
                  className="rounded"
                />
                {s.name} <span className="text-xs text-gray-400">({s.code})</span>
              </label>
            ))}
          </div>
        </Field>
      </AdminCrudDialog>
    </div>
  );
}
