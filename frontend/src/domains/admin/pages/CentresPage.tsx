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
import type { Centre, CentrePayload } from "../api/adminApi";

const emptyForm: CentrePayload = {
  agencyId: 0,
  serviceId: 0,
  code: "",
  companyCode: "",
  codeSage: "",
  responsable: "",
};

type FormErrors = Partial<Record<keyof CentrePayload, string>>;

export default function CentresPage() {
  const qc = useQueryClient();

  const { data: centres = [], isLoading } = useQuery({
    queryKey: ["admin", "centres"],
    queryFn: api.fetchCentres,
  });

  const { data: agencies = [] } = useQuery({
    queryKey: ["admin", "agencies"],
    queryFn: api.fetchAgencies,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin", "services"],
    queryFn: api.fetchServices,
  });

  const [dialog, setDialog] = useState<{ open: boolean; item: Centre | null }>({ open: false, item: null });
  const [form, setForm] = useState<CentrePayload>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setDialog({ open: true, item: null });
  };

  const openEdit = (c: Centre) => {
    setForm({
      agencyId: c.agency.id,
      serviceId: c.service.id,
      code: c.code,
      companyCode: c.companyCode,
      codeSage: c.codeSage ?? "",
      responsable: c.responsable ?? "",
    });
    setErrors({});
    setDialog({ open: true, item: c });
  };

  const closeDialog = () => setDialog({ open: false, item: null });

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.agencyId)          e.agencyId    = "L'agence est obligatoire.";
    if (!form.serviceId)         e.serviceId   = "Le service est obligatoire.";
    if (!form.code.trim())       e.code        = "Le code est obligatoire.";
    if (!form.companyCode.trim()) e.companyCode = "Le code société est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      dialog.item
        ? api.updateCentre(dialog.item.id, form)
        : api.createCentre(form),
    onSuccess: () => {
      toast.success(dialog.item ? "Centre modifié." : "Centre créé.");
      qc.invalidateQueries({ queryKey: ["admin", "centres"] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteCentre,
    onSuccess: () => {
      toast.success("Centre supprimé.");
      qc.invalidateQueries({ queryKey: ["admin", "centres"] });
    },
    onError: () => toast.error("Impossible de supprimer ce centre."),
  });

  const handleSubmit = () => { if (validate()) saveMutation.mutate(); };

  const set = <K extends keyof CentrePayload>(key: K, value: CentrePayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Centres analytiques</h1>
          <p className="text-sm text-gray-500 mt-0.5">{centres.length} centre(s)</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Nouveau centre
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Agence</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Société</TableHead>
              <TableHead>Code Sage</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">Chargement...</TableCell>
              </TableRow>
            ) : centres.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-8">Aucun centre.</TableCell>
              </TableRow>
            ) : centres.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs font-semibold">{c.code}</TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500 mr-1">{c.agency.code}</span>
                  {c.agency.name}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-gray-500 mr-1">{c.service.code}</span>
                  {c.service.name}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{c.companyCode}</span>
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-600">{c.codeSage ?? "—"}</TableCell>
                <TableCell className="text-sm text-gray-700">{c.responsable || "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      <Pencil size={14} />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteMutation.mutate(c.id)}
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
        title={dialog.item ? "Modifier le centre" : "Nouveau centre"}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
      >
        {/* Agence */}
        <Field data-invalid={!!errors.agencyId}>
          <FieldLabel>Agence</FieldLabel>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.agencyId || ""}
            onChange={(e) => set("agencyId", Number(e.target.value))}
          >
            <option value="">— Choisir une agence —</option>
            {agencies.map((a) => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
          {errors.agencyId && <FieldError errors={[{ message: errors.agencyId }]} />}
        </Field>

        {/* Service */}
        <Field data-invalid={!!errors.serviceId}>
          <FieldLabel>Service</FieldLabel>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.serviceId || ""}
            onChange={(e) => set("serviceId", Number(e.target.value))}
          >
            <option value="">— Choisir un service —</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
            ))}
          </select>
          {errors.serviceId && <FieldError errors={[{ message: errors.serviceId }]} />}
        </Field>

        {/* Code */}
        <Field data-invalid={!!errors.code}>
          <FieldLabel>Code analytique</FieldLabel>
          <Input
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            placeholder="ex: 01-NEG"
            maxLength={20}
          />
          {errors.code && <FieldError errors={[{ message: errors.code }]} />}
        </Field>

        {/* Société */}
        <Field data-invalid={!!errors.companyCode}>
          <FieldLabel>Code société</FieldLabel>
          <Input
            value={form.companyCode}
            onChange={(e) => set("companyCode", e.target.value.toUpperCase())}
            placeholder="ex: HF"
            maxLength={10}
          />
          {errors.companyCode && <FieldError errors={[{ message: errors.companyCode }]} />}
        </Field>

        {/* Code Sage */}
        <Field>
          <FieldLabel>Code Sage <span className="text-gray-400 font-normal">(optionnel)</span></FieldLabel>
          <Input
            value={form.codeSage ?? ""}
            onChange={(e) => set("codeSage", e.target.value.toUpperCase())}
            placeholder="ex: AB11"
            maxLength={20}
          />
        </Field>

        {/* Responsable */}
        <Field>
          <FieldLabel>Responsable <span className="text-gray-400 font-normal">(optionnel)</span></FieldLabel>
          <Input
            value={form.responsable ?? ""}
            onChange={(e) => set("responsable", e.target.value)}
            placeholder="ex: Prisca"
            maxLength={100}
          />
        </Field>
      </AdminCrudDialog>
    </div>
  );
}
