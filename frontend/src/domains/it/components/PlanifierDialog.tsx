import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { fetchPersonnel } from "@/domains/admin/api/adminApi";
import * as api from "../api/tikApi";
import type { Tik } from "../api/tikApi";

interface Props {
  ticket: Tik | null;
  onClose: () => void;
}

export default function PlanifierDialog({ ticket, onClose }: Props) {
  const qc = useQueryClient();

  const { data: personnels = [] } = useQuery({
    queryKey: ["admin", "personnel"],
    queryFn: fetchPersonnel,
  });

  const [intervenantId, setIntervenantId] = useState<number | undefined>(undefined);
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [errors, setErrors] = useState<{ intervenantId?: string; debut?: string; fin?: string }>({});

  const reset = () => {
    setIntervenantId(undefined);
    setDebut("");
    setFin("");
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!intervenantId) e.intervenantId = "L'intervenant est obligatoire.";
    if (!debut)         e.debut         = "La date de début est obligatoire.";
    if (!fin)           e.fin           = "La date de fin est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: () =>
      api.planifierTicket(ticket!.id, {
        intervenantId,
        dateDebutPlanning: debut,
        dateFinPlanning: fin,
      }),
    onSuccess: () => {
      toast.success("Ticket planifié.");
      qc.invalidateQueries({ queryKey: ["tik", "tickets"] });
      handleClose();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Impossible de planifier ce ticket.");
    },
  });

  return (
    <Dialog open={!!ticket} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock size={16} /> Planifier — {ticket?.numeroTicket}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field data-invalid={!!errors.intervenantId}>
            <FieldLabel>Intervenant</FieldLabel>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={intervenantId ?? ""}
              onChange={(e) => setIntervenantId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">-- Choisir un intervenant --</option>
              {personnels.map((p) => (
                <option key={p.id} value={p.id}>{p.nom} {p.prenoms}</option>
              ))}
            </select>
            {errors.intervenantId && <FieldError errors={[{ message: errors.intervenantId }]} />}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field data-invalid={!!errors.debut}>
              <FieldLabel>Début</FieldLabel>
              <input
                type="datetime-local"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
              />
              {errors.debut && <FieldError errors={[{ message: errors.debut }]} />}
            </Field>

            <Field data-invalid={!!errors.fin}>
              <FieldLabel>Fin</FieldLabel>
              <input
                type="datetime-local"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
              />
              {errors.fin && <FieldError errors={[{ message: errors.fin }]} />}
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button onClick={() => validate() && mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Enregistrement…" : "Planifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
