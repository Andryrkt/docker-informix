import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import * as api from "../api/tikApi";
import type { Tik } from "../api/tikApi";

export type TikActionKind =
  | "valider" | "refuser" | "mettreEnAttente"
  | "planifier" | "transferer" | "resoudre"
  | "cloturer" | "reouvrir";

const ACTION_CONFIG: Record<TikActionKind, {
  title: string;
  needsIntervenant?: boolean;
  needsDates?: boolean;
  commentRequired?: boolean;
  commentLabel?: string;
  confirmLabel: string;
}> = {
  valider:         { title: "Valider le ticket",        needsIntervenant: true,  commentLabel: "Commentaire (optionnel)", confirmLabel: "Valider" },
  refuser:         { title: "Refuser le ticket",        commentRequired: true,   commentLabel: "Motif du refus",          confirmLabel: "Refuser" },
  mettreEnAttente: { title: "Mettre en attente",        commentRequired: true,   commentLabel: "Motif",                   confirmLabel: "Mettre en attente" },
  planifier:       { title: "Planifier l'intervention", needsDates: true,        confirmLabel: "Planifier" },
  transferer:      { title: "Transférer le ticket",     needsIntervenant: true,  confirmLabel: "Transférer" },
  resoudre:        { title: "Marquer comme résolu",     commentLabel: "Commentaire (optionnel)", confirmLabel: "Résoudre" },
  cloturer:        { title: "Clôturer le ticket",       commentLabel: "Commentaire (optionnel)", confirmLabel: "Clôturer" },
  reouvrir:        { title: "Réouvrir le ticket",       commentRequired: true,   commentLabel: "Motif de la réouverture", confirmLabel: "Réouvrir" },
};

interface Props {
  ticket: Tik | null;
  action: TikActionKind | null;
  onClose: () => void;
}

export default function TikActionDialog({ ticket, action, onClose }: Props) {
  const qc = useQueryClient();

  const { data: intervenants = [] } = useQuery({
    queryKey: ["tik", "intervenants"],
    queryFn: api.fetchIntervenantsDisponibles,
    enabled: !!action && ACTION_CONFIG[action].needsIntervenant,
  });

  const [intervenantId, setIntervenantId] = useState<number | undefined>(undefined);
  const [commentaire, setCommentaire] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setIntervenantId(undefined);
    setCommentaire("");
    setDebut("");
    setFin("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const mutation = useMutation({
    mutationFn: () => {
      if (!ticket || !action) throw new Error("no action");
      switch (action) {
        case "valider":         return api.validerTicket(ticket.id, { intervenantId, commentaire: commentaire || undefined });
        case "refuser":         return api.refuserTicket(ticket.id, commentaire);
        case "mettreEnAttente": return api.mettreEnAttenteTicket(ticket.id, commentaire);
        case "planifier":       return api.planifierTicket(ticket.id, { dateDebutPlanning: debut, dateFinPlanning: fin });
        case "transferer":      return api.transfererTicket(ticket.id, intervenantId);
        case "resoudre":        return api.resoudreTicket(ticket.id, commentaire || undefined);
        case "cloturer":        return api.cloturerTicket(ticket.id, commentaire || undefined);
        case "reouvrir":        return api.reouvrirTicket(ticket.id, commentaire || undefined);
      }
    },
    onSuccess: () => {
      toast.success("Ticket mis à jour.");
      qc.invalidateQueries({ queryKey: ["tik", "tickets"] });
      qc.invalidateQueries({ queryKey: ["tik", "historique", ticket?.id] });
      handleClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Action impossible.");
    },
  });

  if (!action) return null;
  const config = ACTION_CONFIG[action];

  const handleConfirm = () => {
    if (config.needsIntervenant && !intervenantId) {
      setError("L'intervenant est obligatoire.");
      return;
    }
    if (config.needsDates && (!debut || !fin)) {
      setError("Les dates de début et de fin sont obligatoires.");
      return;
    }
    if (config.commentRequired && !commentaire.trim()) {
      setError("Ce champ est obligatoire.");
      return;
    }
    setError(null);
    mutation.mutate();
  };

  return (
    <Dialog open={!!ticket && !!action} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title} — {ticket?.numeroTicket}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {config.needsIntervenant && (
            <Field data-invalid={!!error}>
              <FieldLabel>Intervenant</FieldLabel>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={intervenantId ?? ""}
                onChange={(e) => setIntervenantId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">-- Choisir un intervenant --</option>
                {intervenants.map((p) => (
                  <option key={p.id} value={p.id}>{p.nom} {p.prenoms}</option>
                ))}
              </select>
              {intervenants.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Aucun utilisateur n'a le rôle Intervenant TIK pour l'instant.
                </p>
              )}
            </Field>
          )}

          {config.needsDates && (
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!error}>
                <FieldLabel>Début</FieldLabel>
                <input
                  type="datetime-local"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={debut}
                  onChange={(e) => setDebut(e.target.value)}
                />
              </Field>
              <Field data-invalid={!!error}>
                <FieldLabel>Fin</FieldLabel>
                <input
                  type="datetime-local"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={fin}
                  onChange={(e) => setFin(e.target.value)}
                />
              </Field>
            </div>
          )}

          {config.commentLabel && (
            <Field data-invalid={!!error}>
              <FieldLabel>{config.commentLabel}</FieldLabel>
              <Textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={3}
              />
            </Field>
          )}

          {error && <FieldError errors={[{ message: error }]} />}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} disabled={mutation.isPending}>
            {mutation.isPending ? "Enregistrement…" : config.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
