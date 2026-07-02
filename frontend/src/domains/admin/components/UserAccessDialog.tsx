import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldUser } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import * as api from "../api/adminApi";
import type { AdminUser } from "../api/adminApi";

interface Props {
  open: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export function UserAccessDialog({ open, onClose, user }: Props) {
  const qc = useQueryClient();

  const { data: detail } = useQuery({
    queryKey: ["admin", "users", user?.id, "detail"],
    queryFn: () => api.fetchAdminUserDetail(user!.id),
    enabled: open && !!user,
  });

  const [isAdmin, setIsAdmin]     = useState(false);
  const [matricule, setMatricule] = useState("");

  useEffect(() => {
    if (detail) {
      setIsAdmin(detail.roles.includes("ROLE_ADMIN"));
      setMatricule(detail.matricule ?? "");
    }
  }, [detail]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      await api.updateUserMatricule(user!.id, matricule.trim());
      await api.updateUserRoles(user!.id, isAdmin ? ["ROLE_ADMIN"] : []);
    },
    onSuccess: () => {
      toast.success("Accès mis à jour.");
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      onClose();
    },
    onError: () => toast.error("Impossible de mettre à jour les accès."),
  });

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldUser size={16} /> Accès — {user.displayName ?? user.username}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field>
            <FieldLabel>Matricule (rattachement à la fiche personnel)</FieldLabel>
            <Input
              value={matricule}
              onChange={(e) => setMatricule(e.target.value)}
              placeholder="Ex: 9998"
              className="font-mono"
            />
          </Field>

          {(detail?.defaultAgency || detail?.defaultService) && (
            <div className="text-xs text-gray-500 bg-gray-50 border rounded-md px-3 py-2">
              Agence / service par défaut (fiche personnel) :{" "}
              <span className="font-medium text-gray-700">
                {detail?.defaultAgency ? `${detail.defaultAgency.code} — ${detail.defaultAgency.name}` : "—"}
              </span>
              {" / "}
              <span className="font-medium text-gray-700">
                {detail?.defaultService ? `${detail.defaultService.code} — ${detail.defaultService.name}` : "—"}
              </span>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Administrateur (ROLE_ADMIN)
          </label>

          <p className="text-xs text-gray-400">
            Les agences/services autorisés se gèrent désormais via les Permissions de l'utilisateur.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saveMutation.isPending}>
            Annuler
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
