import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Paperclip, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import WysiwygEditor from "@/components/common/WysiwygEditor";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { fetchAgencies } from "@/domains/admin/api/adminApi";
import * as api from "../api/tikApi";
import type { TikPayload } from "../api/tikApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

function formatKb(bytes: number) {
  return `${Math.round(bytes / 1024)} Ko`;
}

const emptyForm: TikPayload = {
  objetDemande: "",
  detailDemande: "",
  categorieId: undefined,
  agenceDebiteurId: undefined,
  serviceDebiteurId: undefined,
  dateFinSouhaitee: "",
  parcInformatique: "",
};

type FormErrors = Partial<Record<"objetDemande" | "detailDemande" | "categorieId" | "agenceDebiteurId" | "serviceDebiteurId", string>>;

export default function TikCreationForm() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: categories = [] } = useQuery({
    queryKey: ["tik", "categories"],
    queryFn: api.fetchCategoriesTree,
  });

  const { data: agencies = [] } = useQuery({
    queryKey: ["admin", "agencies"],
    queryFn: fetchAgencies,
  });

  const { data: defaults } = useQuery({
    queryKey: ["tik", "defaults"],
    queryFn: api.fetchTikDefaults,
  });

  const [form, setForm] = useState<TikPayload>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pré-remplit la date de fin souhaitée dès que le backend l'a calculée.
  useEffect(() => {
    if (defaults && !form.dateFinSouhaitee) {
      setForm((f) => ({ ...f, dateFinSouhaitee: defaults.dateFinSouhaiteeDefaut }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaults]);

  const set = <K extends keyof TikPayload>(key: K, value: TikPayload[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const servicesDebiteur = useMemo(
    () => agencies.find((a) => a.id === form.agenceDebiteurId)?.services ?? [],
    [agencies, form.agenceDebiteurId],
  );

  const addFiles = (incoming: FileList | File[]) => {
    const accepted: File[] = [];
    for (const file of Array.from(incoming)) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" dépasse la taille maximale de 5 Mo.`);
        continue;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" n'est pas d'un type autorisé (PDF, image, Office).`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) setFiles((f) => [...f, ...accepted]);
  };

  const removeFile = (index: number) => setFiles((f) => f.filter((_, i) => i !== index));

  const validate = (): boolean => {
    const e: FormErrors = {};
    const detailText = form.detailDemande.replace(/<[^>]*>/g, "").trim();
    if (!form.objetDemande.trim())   e.objetDemande      = "L'objet est obligatoire.";
    if (!detailText)                 e.detailDemande     = "Le détail est obligatoire.";
    if (!form.categorieId)           e.categorieId       = "La catégorie est obligatoire.";
    if (!form.agenceDebiteurId)      e.agenceDebiteurId  = "L'agence débiteur est obligatoire.";
    if (!form.serviceDebiteurId)     e.serviceDebiteurId = "Le service débiteur est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createMutation = useMutation({
    mutationFn: () => api.createTicket({ ...form, fichiers: files }),
    onSuccess: (ticket) => {
      toast.success(`Ticket ${ticket.numeroTicket} créé.`);
      qc.invalidateQueries({ queryKey: ["tik", "tickets"] });
      navigate("/it/tickets");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Impossible de créer le ticket.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) createMutation.mutate();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
          Formulaire Demande de support informatique
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Demande */}
          <div>
            <h3 className="text-base font-semibold pb-3">Demande</h3>
            <div className="space-y-4">
              <Field data-invalid={!!errors.objetDemande}>
                <FieldLabel>Objet de la demande *</FieldLabel>
                <Input
                  value={form.objetDemande}
                  onChange={(e) => set("objetDemande", e.target.value)}
                  maxLength={255}
                />
                {errors.objetDemande && <FieldError errors={[{ message: errors.objetDemande }]} />}
              </Field>

              <Field data-invalid={!!errors.detailDemande}>
                <FieldLabel>Détail de la demande *</FieldLabel>
                <WysiwygEditor
                  value={form.detailDemande}
                  onChange={(html) => set("detailDemande", html)}
                  placeholder="Veuillez décrire les détails de votre demande ici..."
                />
                {errors.detailDemande && <FieldError errors={[{ message: errors.detailDemande }]} />}
              </Field>

              <div className="pt-1">
                <h3 className="text-sm font-semibold text-gray-600 pb-2">Autres informations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field data-invalid={!!errors.categorieId}>
                    <FieldLabel>Catégorie *</FieldLabel>
                    <select
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={form.categorieId ?? ""}
                      onChange={(e) => set("categorieId", e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">-- Choisir une catégorie --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.description}</option>
                      ))}
                    </select>
                    {errors.categorieId && <FieldError errors={[{ message: errors.categorieId }]} />}
                  </Field>

                  <Field>
                    <FieldLabel>Date fin souhaitée *</FieldLabel>
                    <Input
                      type="date"
                      value={form.dateFinSouhaitee}
                      onChange={(e) => set("dateFinSouhaitee", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Parc informatique</FieldLabel>
                    <Input
                      value={form.parcInformatique ?? ""}
                      onChange={(e) => set("parcInformatique", e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Code société</FieldLabel>
                    <Input value={defaults?.codeSociete ?? ""} disabled readOnly />
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* Agence et Service */}
          <div>
            <h3 className="text-base font-semibold pb-3">Agence et service</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <Field data-invalid={!!errors.agenceDebiteurId}>
                  <FieldLabel>Agence débiteur *</FieldLabel>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={form.agenceDebiteurId ?? ""}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : undefined;
                      setForm((f) => ({ ...f, agenceDebiteurId: id, serviceDebiteurId: undefined }));
                    }}
                  >
                    <option value="">-- Choisir une agence débiteur --</option>
                    {agencies.map((a) => (
                      <option key={a.id} value={a.id}>{a.code} {a.name}</option>
                    ))}
                  </select>
                  {errors.agenceDebiteurId && <FieldError errors={[{ message: errors.agenceDebiteurId }]} />}
                </Field>

                <Field data-invalid={!!errors.serviceDebiteurId}>
                  <FieldLabel>Service débiteur *</FieldLabel>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    value={form.serviceDebiteurId ?? ""}
                    disabled={!form.agenceDebiteurId}
                    onChange={(e) => set("serviceDebiteurId", e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">-- Choisir un service débiteur --</option>
                    {servicesDebiteur.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} {s.name}</option>
                    ))}
                  </select>
                  {errors.serviceDebiteurId && <FieldError errors={[{ message: errors.serviceDebiteurId }]} />}
                </Field>
              </div>

              <div className="space-y-4">
                <Field>
                  <FieldLabel>Agence émetteur</FieldLabel>
                  <Input
                    value={defaults?.agenceEmetteur ? `${defaults.agenceEmetteur.code} ${defaults.agenceEmetteur.name}` : ""}
                    disabled
                    readOnly
                  />
                </Field>

                <Field>
                  <FieldLabel>Service émetteur</FieldLabel>
                  <Input
                    value={defaults?.serviceEmetteur ? `${defaults.serviceEmetteur.code} ${defaults.serviceEmetteur.name}` : ""}
                    disabled
                    readOnly
                  />
                </Field>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-semibold text-gray-600 pb-2 flex items-center gap-1.5">
                <Paperclip size={14} /> Pièces jointes
              </h3>
              <div
                className={`rounded-md border-2 border-dashed p-4 text-center cursor-pointer transition-colors ${
                  dragOver ? "border-brand-dark bg-gray-50" : "border-gray-300"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
                <p className="text-xs text-gray-500">
                  Glissez-déposez vos fichiers ici, ou cliquez pour parcourir.
                  <br />
                  PDF, images, Office — 5 Mo max par fichier.
                </p>
              </div>

              {files.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {files.map((file, i) => (
                    <li key={i} className="flex items-center justify-between text-xs bg-gray-50 border rounded px-2 py-1">
                      <span className="truncate">{file.name} <span className="text-gray-400">({formatKb(file.size)})</span></span>
                      <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-600">
                        <X size={13} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <Field orientation="horizontal" className="justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setForm({ ...emptyForm, dateFinSouhaitee: defaults?.dateFinSouhaiteeDefaut ?? "" });
              setFiles([]);
            }}
          >
            Réinitialiser
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Envoi..." : "Enregistrer"}
          </Button>
        </Field>
      </form>
    </div>
  );
}
