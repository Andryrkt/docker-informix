import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate } from "lucide-react";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import * as api from "../api/adminApi";
import type { CopyMode } from "../api/adminApi";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (templateId: number, mode: CopyMode) => void;
  isSubmitting?: boolean;
}

export function ApplyTemplateDialog({ open, onClose, onConfirm, isSubmitting }: Props) {
  const { data: templates = [] } = useQuery({
    queryKey: ["admin", "permission-templates"],
    queryFn:  api.fetchPermissionTemplates,
  });

  const [templateId, setTemplateId] = useState<string>("");
  const [mode, setMode]             = useState<CopyMode>("replace");

  const selected = templates.find((t) => String(t.id) === templateId);

  const handleConfirm = () => {
    if (!templateId) return;
    onConfirm(Number(templateId), mode);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) { setTemplateId(""); setMode("replace"); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate size={16} /> Appliquer un modèle de permissions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field>
            <FieldLabel>Modèle</FieldLabel>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                    {t.items.length > 0 ? ` (${t.items.length} permission${t.items.length > 1 ? "s" : ""})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selected?.description && (
              <p className="text-xs text-gray-500 mt-1">{selected.description}</p>
            )}
            {selected && (
              <p className="text-xs text-gray-400 mt-0.5">
                {selected.items.length} permission{selected.items.length > 1 ? "s" : ""} dans ce modèle
              </p>
            )}
          </Field>

          <Field>
            <FieldLabel>Mode d'application</FieldLabel>
            <div className="border rounded-md divide-y">
              <label className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="applyMode"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Remplacer</p>
                  <p className="text-xs text-gray-400">Supprime toutes les permissions existantes, puis applique le modèle</p>
                </div>
              </label>
              <label className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="applyMode"
                  checked={mode === "merge"}
                  onChange={() => setMode("merge")}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Fusionner</p>
                  <p className="text-xs text-gray-400">Ajoute uniquement les permissions manquantes sans toucher aux existantes</p>
                </div>
              </label>
            </div>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={!templateId || isSubmitting}>
            {isSubmitting ? "Application en cours…" : "Appliquer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
