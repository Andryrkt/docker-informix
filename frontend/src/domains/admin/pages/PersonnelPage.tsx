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
import type { Personnel, PersonnelPayload } from "../api/adminApi";

const emptyForm: PersonnelPayload = {
  nom: "",
  prenoms: "",
  matricule: "",
  codeBancaire: "",
  centreId: undefined,
  userId: undefined,
};

type FormErrors = Partial<Record<keyof PersonnelPayload, string>>;

export default function PersonnelPage() {
  const qc = useQueryClient();

  const { data: personnels = [], isLoading } = useQuery({
    queryKey: ["admin", "personnel"],
    queryFn: api.fetchPersonnel,
  });

  const { data: centres = [] } = useQuery({
    queryKey: ["admin", "centres"],
    queryFn: api.fetchCentres,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: api.fetchAdminUsers,
  });

  const [dialog, setDialog] = useState<{ open: boolean; item: Personnel | null }>({
    open: false,
    item: null,
  });
  const [form, setForm] = useState<PersonnelPayload>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setDialog({ open: true, item: null });
  };

  const openEdit = (p: Personnel) => {
    setForm({
      nom: p.nom,
      prenoms: p.prenoms,
      matricule: p.matricule,
      codeBancaire: p.codeBancaire ?? "",
      centreId: p.centre?.id,
      userId: p.user?.id,
    });
    setErrors({});
    setDialog({ open: true, item: p });
  };

  const closeDialog = () => setDialog({ open: false, item: null });

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.nom.trim())       e.nom       = "Le nom est obligatoire.";
    if (!form.prenoms.trim())   e.prenoms   = "Les prénoms sont obligatoires.";
    if (!form.matricule.trim()) e.matricule = "Le matricule est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      dialog.item
        ? api.updatePersonnel(dialog.item.id, form)
        : api.createPersonnel(form),
    onSuccess: () => {
      toast.success(dialog.item ? "Personnel modifié." : "Personnel créé.");
      qc.invalidateQueries({ queryKey: ["admin", "personnel"] });
      closeDialog();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Une erreur est survenue.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deletePersonnel,
    onSuccess: () => {
      toast.success("Personnel supprimé.");
      qc.invalidateQueries({ queryKey: ["admin", "personnel"] });
    },
    onError: () => toast.error("Impossible de supprimer ce personnel."),
  });

  const handleSubmit = () => { if (validate()) saveMutation.mutate(); };

  const set = <K extends keyof PersonnelPayload>(key: K, value: PersonnelPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Personnel</h1>
          <p className="text-sm text-gray-500 mt-0.5">{personnels.length} personne(s)</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-2">
          <Plus size={15} /> Nouveau personnel
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>Matricule</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénoms</TableHead>
              <TableHead>Centre</TableHead>
              <TableHead>Utilisateur</TableHead>
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
            ) : personnels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                  Aucun personnel.
                </TableCell>
              </TableRow>
            ) : personnels.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                    {p.matricule}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{p.nom}</TableCell>
                <TableCell>{p.prenoms}</TableCell>
                <TableCell className="font-mono text-xs text-gray-600">
                  {p.centre ? p.centre.code : <span className="text-gray-300">—</span>}
                </TableCell>
                <TableCell className="text-sm text-gray-700">
                  {p.user
                    ? (p.user.displayName ?? p.user.username)
                    : <span className="text-gray-300">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                      <Pencil size={14} />
                    </Button>
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

      <AdminCrudDialog
        open={dialog.open}
        onClose={closeDialog}
        title={dialog.item ? "Modifier le personnel" : "Nouveau personnel"}
        onSubmit={handleSubmit}
        isSubmitting={saveMutation.isPending}
      >
        {/* Nom */}
        <Field data-invalid={!!errors.nom}>
          <FieldLabel>Nom</FieldLabel>
          <Input
            value={form.nom}
            onChange={(e) => set("nom", e.target.value.toUpperCase())}
            placeholder="ex: RAKOTO"
            maxLength={100}
          />
          {errors.nom && <FieldError errors={[{ message: errors.nom }]} />}
        </Field>

        {/* Prénoms */}
        <Field data-invalid={!!errors.prenoms}>
          <FieldLabel>Prénoms</FieldLabel>
          <Input
            value={form.prenoms}
            onChange={(e) => set("prenoms", e.target.value)}
            placeholder="ex: Jean Pierre"
            maxLength={150}
          />
          {errors.prenoms && <FieldError errors={[{ message: errors.prenoms }]} />}
        </Field>

        {/* Matricule */}
        <Field data-invalid={!!errors.matricule}>
          <FieldLabel>Matricule</FieldLabel>
          <Input
            value={form.matricule}
            onChange={(e) => set("matricule", e.target.value)}
            placeholder="ex: 9999"
            maxLength={20}
          />
          {errors.matricule && <FieldError errors={[{ message: errors.matricule }]} />}
        </Field>

        {/* Centre */}
        <Field>
          <FieldLabel>Centre <span className="text-gray-400 font-normal">(optionnel)</span></FieldLabel>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.centreId ?? ""}
            onChange={(e) => set("centreId", e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">— Aucun centre —</option>
            {centres.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}{c.codeSage ? ` (${c.codeSage})` : ""} — {c.agency.code} / {c.service.code}
              </option>
            ))}
          </select>
        </Field>

        {/* Utilisateur */}
        <Field>
          <FieldLabel>Utilisateur <span className="text-gray-400 font-normal">(optionnel)</span></FieldLabel>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            value={form.userId ?? ""}
            onChange={(e) => set("userId", e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">— Aucun utilisateur —</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}{u.displayName ? ` — ${u.displayName}` : ""}
              </option>
            ))}
          </select>
        </Field>

        {/* Code bancaire */}
        <Field>
          <FieldLabel>Code bancaire <span className="text-gray-400 font-normal">(optionnel)</span></FieldLabel>
          <Input
            value={form.codeBancaire ?? ""}
            onChange={(e) => set("codeBancaire", e.target.value)}
            placeholder="ex: 4875 96321547 89966 3211 4778"
            maxLength={60}
          />
        </Field>
      </AdminCrudDialog>
    </div>
  );
}
