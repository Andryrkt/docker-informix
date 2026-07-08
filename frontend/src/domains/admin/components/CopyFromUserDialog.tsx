import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";

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
  onConfirm: (sourceUserId: number, mode: CopyMode) => void;
  isSubmitting?: boolean;
  currentUserId: number;
}

export function CopyFromUserDialog({ open, onClose, onConfirm, isSubmitting, currentUserId }: Props) {
  const { data: users = [] } = useQuery({ queryKey: ["admin", "users"], queryFn: api.fetchAdminUsers });
  const [sourceId, setSourceId] = useState<string>("");
  const [mode, setMode]         = useState<CopyMode>("replace");

  const candidates = users.filter((u) => u.id !== currentUserId);

  const handleConfirm = () => {
    if (!sourceId) return;
    onConfirm(Number(sourceId), mode);
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) { setSourceId(""); setMode("replace"); onClose(); }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy size={16} /> Copier les permissions depuis…
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field>
            <FieldLabel>Utilisateur source</FieldLabel>
            <Select value={sourceId} onValueChange={setSourceId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {candidates.map((u) => (
                  <SelectItem key={u.id} value={String(u.id)}>
                    {u.displayName ?? u.username}
                    {u.department ? ` — ${u.department}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Mode de copie</FieldLabel>
            <div className="border rounded-md divide-y">
              <label className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="copyMode"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                  className="mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Remplacer</p>
                  <p className="text-xs text-gray-400">Supprime toutes les permissions existantes, puis copie celles de la source</p>
                </div>
              </label>
              <label className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="copyMode"
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
          <Button onClick={handleConfirm} disabled={!sourceId || isSubmitting}>
            {isSubmitting ? "Copie en cours…" : "Copier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
