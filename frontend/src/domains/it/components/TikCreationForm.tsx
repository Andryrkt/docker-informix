import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { FileText, Paperclip, Save, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import WysiwygEditor from "@/components/common/WysiwygEditor";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { fetchAgencies } from "@/domains/admin/api/adminApi";
import * as api from "../api/tikApi";
import type { TikPayload } from "../api/tikApi";
import { SearchableSelect } from "@/components/common/atom/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  Field: undefined,
  state: undefined
};

type FormErrors = Partial<
  Record<
    | "objetDemande"
    | "detailDemande"
    | "categorieId"
    | "agenceDebiteurId"
    | "serviceDebiteurId",
    string
  >
>;

export default function TikCreationForm() {
  const { t } = useTranslation("ticket");
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
      setForm((f) => ({
        ...f,
        dateFinSouhaitee: defaults.dateFinSouhaiteeDefaut,
      }));
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
        continue;
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        // toast.error(
        //   `"${file.name}" n'est pas d'un type autorisé (PDF, image, Office).`,
        // );
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length) setFiles((f) => [...f, ...accepted]);
  };

  const removeFile = (index: number) =>
    setFiles((f) => f.filter((_, i) => i !== index));

  const validate = (): boolean => {
    const e: FormErrors = {};
    const detailText = form.detailDemande.replace(/<[^>]*>/g, "").trim();
    if (!form.objetDemande.trim()) e.objetDemande = "L'objet est obligatoire.";
    if (!detailText) e.detailDemande = "Le détail est obligatoire.";
    if (!form.categorieId) e.categorieId = "La catégorie est obligatoire.";
    if (!form.agenceDebiteurId)
      e.agenceDebiteurId = "L'agence débiteur est obligatoire.";
    if (!form.serviceDebiteurId)
      e.serviceDebiteurId = "Le service débiteur est obligatoire.";
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
      toast.error(
        err?.response?.data?.error ?? "Impossible de créer le ticket.",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) createMutation.mutate();
  };
  const isPending = createMutation.isPending;
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 ">
      <div className="flex flex-col space-y-2  text-center p-2">
        <h1 className="text-2xl font-bold text-brand-dark tracking-tight ">
          {t("creationForm.title")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-md">
        <fieldset
          disabled={createMutation.isPending}
          className={cn(
            createMutation.isPending && "opacity-60 pointer-events-none",
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className=" pb-3">
                <h3 className="text-base font-semibold border-brand-primary border-b-4">
                  {t("creationForm.sectionRequest")}
                </h3>
              </div>
              <div className="space-y-4">
                <Field data-invalid={!!errors.objetDemande}>
                  <FieldLabel>{t("creationForm.subject")}</FieldLabel>
                  <Input
                    value={form.objetDemande}
                    onChange={(e) => set("objetDemande", e.target.value)}
                    maxLength={255}
                  />
                  {errors.objetDemande && (
                    <FieldError errors={[{ message: errors.objetDemande }]} />
                  )}
                </Field>

                <Field data-invalid={!!errors.detailDemande}>
                  <FieldLabel>{t("creationForm.details")}</FieldLabel>
                  <WysiwygEditor
                    value={form.detailDemande}
                    onChange={(html) => set("detailDemande", html)}
                    placeholder={t("creationForm.detailsPlaceholder")}
                  />
                  {errors.detailDemande && (
                    <FieldError errors={[{ message: errors.detailDemande }]} />
                  )}
                </Field>

                <div className="pt-1">
                  <div className=" pb-3">
                    <h3 className="text-base font-semibold border-brand-primary border-b-4">
                      {t("autres-informations")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field data-invalid={!!errors.categorieId}>
                      <FieldLabel>{t("categorie")} *</FieldLabel>
                      <Select
                        value={form.categorieId?.toString() ?? ""}
                        onValueChange={(value) => {
                          const id = value ? Number(value) : undefined;
                          setForm((f) => ({ ...f, categorieId: id }));
                        }}
                      >
                        <SelectTrigger
                          className={cn(
                            "w-full",
                            errors.categorieId &&
                              "border-red-500 ring-1 ring-red-500",
                          )}
                        >
                          <SelectValue
                            placeholder={t("choisir-une-categorie")}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">
                            {t("choisir-une-categorie")}
                          </SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {errors.categorieId && (
                        <FieldError
                          errors={[{ message: errors.categorieId }]}
                        />
                      )}
                    </Field>

                    <Field>
                      <FieldLabel>{t("date-fin-souhaitee")} *</FieldLabel>
                      <Input
                        type="date"
                        value={form.dateFinSouhaitee}
                        onChange={(e) =>
                          set("dateFinSouhaitee", e.target.value)
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel>{t("parc-informatique")}</FieldLabel>
                      <Input
                        value={form.parcInformatique ?? ""}
                        onChange={(e) =>
                          set("parcInformatique", e.target.value)
                        }
                      />
                    </Field>

                    <Field>
                      <FieldLabel>{t("code-societe")}</FieldLabel>
                      <Input
                        value={defaults?.codeSociete ?? ""}
                        disabled
                        readOnly
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            {/* Agence et Service */}
            <div>
              <div className=" pb-3">
                <h3 className="text-base font-semibold border-brand-primary border-b-4">
                  {t("agence-et-service")}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Field data-invalid={!!errors.agenceDebiteurId}>
                    <FieldLabel>{t("agence-debiteur")} *</FieldLabel>
                    <Select
                      value={form.agenceDebiteurId?.toString() ?? ""}
                      onValueChange={(value) => {
                        const id = value ? Number(value) : undefined;
                        setForm((f) => ({
                          ...f,
                          agenceDebiteurId: id,
                          serviceDebiteurId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          errors.agenceDebiteurId &&
                            "border-red-500 ring-1 ring-red-500",
                        )}
                      >
                        <SelectValue placeholder="-- Choisir une agence débiteur --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          -- Choisir une agence débiteur --
                        </SelectItem>
                        {agencies.map((a) => (
                          <SelectItem key={a.id} value={String(a.id)}>
                            {a.code} {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.agenceDebiteurId && (
                      <FieldError
                        errors={[{ message: errors.agenceDebiteurId }]}
                      />
                    )}
                  </Field>

                  <Field data-invalid={!!errors.serviceDebiteurId}>
                    <FieldLabel>{t("service-debiteur")} *</FieldLabel>
                    <Select
                      value={form.serviceDebiteurId?.toString() ?? ""}
                      onValueChange={(value) => {
                        const id = value ? Number(value) : undefined;
                        setForm((f) => ({ ...f, serviceDebiteurId: id }));
                      }}
                      disabled={!form.agenceDebiteurId}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          errors.serviceDebiteurId &&
                            "border-red-500 ring-1 ring-red-500",
                        )}
                      >
                        <SelectValue placeholder="-- Choisir un service débiteur --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          -- Choisir un service débiteur --
                        </SelectItem>
                        {servicesDebiteur.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.code} {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {errors.serviceDebiteurId && (
                      <FieldError
                        errors={[{ message: errors.serviceDebiteurId }]}
                      />
                    )}
                  </Field>
                </div>

                <div className="space-y-4">
                  <Field>
                    <FieldLabel>{t("agence-emetteur")}</FieldLabel>
                    <Input
                      value={
                        defaults?.agenceEmetteur
                          ? `${defaults.agenceEmetteur.code} ${defaults.agenceEmetteur.name}`
                          : ""
                      }
                      disabled
                      readOnly
                    />
                  </Field>

                  <Field>
                    <FieldLabel>{t("service-emetteur")}</FieldLabel>
                    <Input
                      value={
                        defaults?.serviceEmetteur
                          ? `${defaults.serviceEmetteur.code} ${defaults.serviceEmetteur.name}`
                          : ""
                      }
                      disabled
                      readOnly
                    />
                  </Field>
                </div>
              </div>

              <div className="pt-4">
                <div className=" pb-4">
                  <h3 className="text-base font-semibold border-brand-primary border-b-4">
                    {t("pieces-jointes")}
                  </h3>
                </div>

                <div
                  className={cn(
                    "group  rounded-md border-2 border-dashed p-4 text-center cursor-pointer transition-colors duration-300 hover:border-brand-primary gap-2 flex flex-col items-center justify-center focus:border-brand-primary",
                    dragOver
                      ? "border-brand-primary bg-gray-50"
                      : "border-gray-300",
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    if (e.dataTransfer.files.length)
                      addFiles(e.dataTransfer.files);
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden group  items-baseline "
                    onChange={(e) => {
                      if (e.target.files?.length) addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <UploadCloud className="text-gray-300 group-hover:text-brand-primary transition-colors duration-300" />
                  <p className="text-xs text-gray-300 group-hover:text-brand-primary transition-colors duration-300">
                    {t(
                      "glissez-deposez-vos-fichiers-ici-ou-cliquez-pour-parcourir",
                    )}
                    <br />
                    {t("pdf-images-office-5-mo-max-par-fichier")}.
                  </p>
                </div>

                {/* Liste des fichiers */}
                {files.length > 0 && (
                  <div className="space-y-2 my-4">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-background rounded-md  "
                      >
                        <div className="flex items-center gap-2 max-w-[80%]">
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium">
                              {file.name}
                            </p>
                            <p className="text-[0.6rem] text-muted-foreground">
                              {t("taille")} {formatKb(file.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                          disabled={isPending}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Field orientation="horizontal" className="justify-end mt-4 ">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm({
                  ...emptyForm,
                  dateFinSouhaitee: defaults?.dateFinSouhaiteeDefaut ?? "",
                });
                setFiles([]);
              }}
            >
              {t("reinitialiser")}
            </Button>
            <Button
              variant="brand"
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center justify-center gap-2"
            >
              <Save className="size-4" />
              {createMutation.isPending
                ? t("envoi-en-cours")
                : t("enregistrer")}
            </Button>
          </Field>
        </fieldset>
      </form>
    </div>
  );
}
