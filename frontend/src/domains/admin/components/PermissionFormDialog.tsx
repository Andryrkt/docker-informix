import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import * as api from "../api/adminApi";
import type { Agency, AgencyScope, UserPermission, PermissionPayload } from "../api/adminApi";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (payload: PermissionPayload) => void;
  isSubmitting?: boolean;
  initial?: UserPermission | null;
}

interface FormState {
  companyId: string;
  resourceType: "module" | "menu";
  moduleId: string;
  menuId: string;
  actions: string[];
  scopeAll: boolean;
  agencyScopes: AgencyScope[];
}

const emptyForm: FormState = {
  companyId: "", resourceType: "module", moduleId: "", menuId: "",
  actions: ["view"], scopeAll: true, agencyScopes: [],
};

const toFieldErrors = (msg: string) => [{ message: msg }];

export function PermissionFormDialog({ open, onClose, onSave, isSubmitting, initial }: Props) {
  const { data: companies  = [] } = useQuery({ queryKey: ["admin", "companies"], queryFn: api.fetchCompanies   });
  const { data: modules    = [] } = useQuery({ queryKey: ["admin", "modules"],   queryFn: api.fetchModules     });
  const { data: agencies   = [] } = useQuery({ queryKey: ["admin", "agencies"],  queryFn: api.fetchAgencies    });
  const { data: actionDefs = [] } = useQuery({ queryKey: ["admin", "actions"],   queryFn: api.fetchActionDefs  });

  const [form, setForm]     = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  useEffect(() => {
    if (!open) return;
    if (initial) {
      const isModule = initial.resourceType === "module";
      setForm({
        companyId:    String(initial.company.id),
        resourceType: initial.resourceType,
        moduleId:     isModule ? String(initial.resourceId) : findModuleOfMenu(initial.resourceId),
        menuId:       isModule ? "" : String(initial.resourceId),
        actions:      initial.actions,
        scopeAll:     initial.scopeAll ?? true,
        agencyScopes: initial.agencyScopes ?? [],
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [open, initial]);

  const findModuleOfMenu = (menuId: number): string => {
    for (const mod of modules) {
      for (const menu of mod.menus) {
        if (menu.id === menuId) return String(mod.id);
        if (menu.subMenus.some((s) => s.id === menuId)) return String(mod.id);
      }
    }
    return "";
  };

  const selectedModule = modules.find((m) => String(m.id) === form.moduleId);
  const menuOptions = selectedModule
    ? selectedModule.menus.flatMap((m) => [
        { id: m.id, label: m.label },
        ...m.subMenus.map((s) => ({ id: s.id, label: `  └ ${s.label}` })),
      ])
    : [];

  const actionsByCategory = actionDefs.reduce<Record<string, typeof actionDefs>>((acc, a) => {
    const cat = a.category ?? "Autre";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(a);
    return acc;
  }, {});

  // ── Helpers portée agence ────────────────────────────────────────────────

  const getScope = (agencyId: number): AgencyScope | undefined =>
    form.agencyScopes.find((s) => s.agencyId === agencyId);

  const isAgencySelected = (agencyId: number) => !!getScope(agencyId);

  const toggleAgency = (agency: Agency) => {
    if (isAgencySelected(agency.id)) {
      setForm((f) => ({ ...f, agencyScopes: f.agencyScopes.filter((s) => s.agencyId !== agency.id) }));
    } else {
      setForm((f) => ({
        ...f,
        agencyScopes: [...f.agencyScopes, { agencyId: agency.id, allServices: true, serviceIds: [] }],
      }));
    }
  };

  const updateScope = (agencyId: number, patch: Partial<AgencyScope>) => {
    setForm((f) => ({
      ...f,
      agencyScopes: f.agencyScopes.map((s) =>
        s.agencyId === agencyId ? { ...s, ...patch } : s,
      ),
    }));
  };

  const toggleService = (agencyId: number, serviceId: number) => {
    const scope = getScope(agencyId);
    if (!scope) return;
    const ids = scope.serviceIds.includes(serviceId)
      ? scope.serviceIds.filter((x) => x !== serviceId)
      : [...scope.serviceIds, serviceId];
    updateScope(agencyId, { serviceIds: ids });
  };

  // ── Validation ───────────────────────────────────────────────────────────

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.companyId)  e.companyId = "La société est obligatoire.";
    if (!form.moduleId)   e.moduleId  = "Le module est obligatoire.";
    if (form.resourceType === "menu" && !form.menuId) e.menuId = "Le menu est obligatoire.";
    if (!form.actions.length) e.actions = "Au moins une action est requise.";
    if (!form.scopeAll && form.agencyScopes.length === 0) {
      e.agencyScopes = "Sélectionnez au moins une agence, ou choisissez Accès complet.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      companyId:    Number(form.companyId),
      resourceType: form.resourceType,
      resourceId:   form.resourceType === "module" ? Number(form.moduleId) : Number(form.menuId),
      actions:      form.actions,
      scopeAll:     form.scopeAll,
      agencyScopes: form.scopeAll ? [] : form.agencyScopes,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier la permission" : "Nouvelle permission"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-2">

          {/* Société */}
          <Field className="col-span-2" data-invalid={!!errors.companyId}>
            <FieldLabel>Société</FieldLabel>
            <Select value={form.companyId} onValueChange={(v) => setForm((f) => ({ ...f, companyId: v }))}>
              <SelectTrigger><SelectValue placeholder="Choisir une société" /></SelectTrigger>
              <SelectContent>
                {companies.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.companyId && <FieldError errors={toFieldErrors(errors.companyId)} />}
          </Field>

          {/* Type de ressource */}
          <Field>
            <FieldLabel>Type de ressource</FieldLabel>
            <Select
              value={form.resourceType}
              onValueChange={(v) => setForm((f) => ({ ...f, resourceType: v as "module" | "menu", menuId: "" }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="module">Module (vignette)</SelectItem>
                <SelectItem value="menu">Menu (sous-page)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          {/* Module */}
          <Field data-invalid={!!errors.moduleId}>
            <FieldLabel>Module</FieldLabel>
            <Select
              value={form.moduleId}
              onValueChange={(v) => setForm((f) => ({ ...f, moduleId: v, menuId: "" }))}
            >
              <SelectTrigger><SelectValue placeholder="Choisir un module" /></SelectTrigger>
              <SelectContent>
                {modules.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.moduleId && <FieldError errors={toFieldErrors(errors.moduleId)} />}
          </Field>

          {/* Menu */}
          {form.resourceType === "menu" && (
            <Field className="col-span-2" data-invalid={!!errors.menuId}>
              <FieldLabel>Menu</FieldLabel>
              <Select
                value={form.menuId}
                onValueChange={(v) => setForm((f) => ({ ...f, menuId: v }))}
                disabled={!form.moduleId}
              >
                <SelectTrigger><SelectValue placeholder="Choisir un menu" /></SelectTrigger>
                <SelectContent>
                  {menuOptions.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.menuId && <FieldError errors={toFieldErrors(errors.menuId)} />}
            </Field>
          )}

          {/* Actions */}
          <Field className="col-span-2" data-invalid={!!errors.actions}>
            <FieldLabel>Actions autorisées</FieldLabel>
            <div className="border rounded-md p-3 space-y-3">
              {actionDefs.length === 0 ? (
                <p className="text-xs text-gray-400">Chargement des actions...</p>
              ) : (
                Object.entries(actionsByCategory).map(([category, items]) => (
                  <div key={category}>
                    <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{category}</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {items.map((a) => (
                        <label key={a.actionKey} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.actions.includes(a.actionKey)}
                            onChange={() => setForm((f) => ({
                              ...f,
                              actions: f.actions.includes(a.actionKey)
                                ? f.actions.filter((x) => x !== a.actionKey)
                                : [...f.actions, a.actionKey],
                            }))}
                            className="rounded"
                          />
                          {a.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            {errors.actions && <FieldError errors={toFieldErrors(errors.actions)} />}
          </Field>

          {/* Portée des accès */}
          <Field className="col-span-2" data-invalid={!!errors.agencyScopes}>
            <FieldLabel>Portée des accès</FieldLabel>

            {/* Choix du mode */}
            <div className="border rounded-md divide-y mb-2">
              <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scopeMode"
                  checked={form.scopeAll}
                  onChange={() => setForm((f) => ({ ...f, scopeAll: true, agencyScopes: [] }))}
                />
                <div>
                  <p className="text-sm font-medium">Accès complet</p>
                  <p className="text-xs text-gray-400">Toutes les agences et tous leurs services</p>
                </div>
              </label>
              <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="scopeMode"
                  checked={!form.scopeAll}
                  onChange={() => setForm((f) => ({ ...f, scopeAll: false }))}
                />
                <div>
                  <p className="text-sm font-medium">Accès restreint par agence</p>
                  <p className="text-xs text-gray-400">Définir pour chaque agence les services autorisés</p>
                </div>
              </label>
            </div>

            {/* Sélecteur agence → services */}
            {!form.scopeAll && (
              <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
                {agencies.length === 0 ? (
                  <p className="text-sm text-gray-400 p-3 italic">Aucune agence disponible</p>
                ) : agencies.map((agency) => {
                  const scope     = getScope(agency.id);
                  const selected  = !!scope;

                  return (
                    <div key={agency.id} className={`p-3 ${selected ? "bg-blue-50/40" : ""}`}>
                      {/* Ligne agence */}
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleAgency(agency)}
                        />
                        <span className="font-medium text-sm">{agency.name}</span>
                        <span className="font-mono text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          {agency.code}
                        </span>
                        {selected && (
                          <span className="ml-auto text-xs text-blue-600">
                            {scope!.allServices
                              ? "Tous les services"
                              : `${scope!.serviceIds.length} service(s)`}
                          </span>
                        )}
                      </label>

                      {/* Services de cette agence */}
                      {selected && agency.services.length > 0 && (
                        <div className="mt-2.5 ml-6 space-y-2">
                          {/* Choix du mode services */}
                          <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name={`svc-mode-${agency.id}`}
                                checked={scope!.allServices}
                                onChange={() => updateScope(agency.id, { allServices: true, serviceIds: [] })}
                              />
                              Tous les services
                            </label>
                            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name={`svc-mode-${agency.id}`}
                                checked={!scope!.allServices}
                                onChange={() => updateScope(agency.id, { allServices: false, serviceIds: [] })}
                              />
                              Services spécifiques
                            </label>
                          </div>

                          {/* Checkboxes des services */}
                          {!scope!.allServices && (
                            <div className="grid grid-cols-2 gap-1.5 border rounded p-2 bg-white">
                              {agency.services.map((svc) => (
                                <label key={svc.id} className="flex items-center gap-1.5 text-xs cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={scope!.serviceIds.includes(svc.id)}
                                    onChange={() => toggleService(agency.id, svc.id)}
                                  />
                                  <span className="font-mono text-gray-500">{svc.code}</span>
                                  {svc.name}
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Avertissement si aucun service sélectionné */}
                          {!scope!.allServices && scope!.serviceIds.length === 0 && (
                            <p className="text-xs text-amber-600">
                              Aucun service sélectionné — l'accès à cette agence sera vide.
                            </p>
                          )}
                        </div>
                      )}

                      {selected && agency.services.length === 0 && (
                        <p className="mt-1.5 ml-6 text-xs text-gray-400 italic">Aucun service rattaché à cette agence</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {errors.agencyScopes && <FieldError errors={toFieldErrors(errors.agencyScopes)} />}
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
  );
}
