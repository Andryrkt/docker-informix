import type { Devis } from "../schema/devisSchema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreVerticalIcon } from "lucide-react";
import {
  displayValue,
  formatMontant,
  getStatutDevisClass,
  getStatutRelanceClass,
} from "@/helper/helper";
import { cn } from "@/lib/utils";
import { DevisTableSkeleton } from "./DevisTableSkeleton";
import { useRef, useCallback, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { MenuAction } from "@/domains/atelier/dit/components/Dots.Menu";
import DotsMenu from "@/domains/atelier/dit/components/Dots.Menu";
import { formatApprorpiateDate } from "@/lib/dateUtils";
import DialogRelanceDevisForm from "./DialogRelanceDevisForm";
import { submitRelanceDevis, updateStopProgression } from "../api/devisApi";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { Switch } from "@/components/ui/switch";

function DevisTable({ devis, loading }: { devis: Devis[]; loading: boolean }) {
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);
  const [selectedDevisForRelance, setSelectedDevisForRelance] =
    useState<Devis | null>(null);
  const [open, setOpen] = useState(false);

  // ---------- Virtualizer ----------
  const rowVirtualizer = useVirtualizer({
    count: devis?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // row height (adjust if needed)
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  const getActions = useCallback((d: Devis): MenuAction[] => {
    return [
      {
        label: "Soumission devis pour vérification prix",
        to: `/magasin/dematerialisation/soumission-devis-neg-verification-de-prix/VP/${d.numeroDevis}`,
      },
      {
        label: "Soumission devis pour validation",
        to: `/magasin/dematerialisation/soumission-devis-neg-validation-devis/VD/${d.numeroDevis}`,
      },
      {
        label: "Soumission BC client pour validation",
        to: `/magasin/dematerialisation/soumission-bc-neg/${d.numeroDevis}`,
      },
      {
        label: "Pointer relance devis client",
        onClick: () => {
          setSelectedDevisForRelance(d);
          setOpen(true);
        },
      },
    ].filter(Boolean) as MenuAction[];
  }, []);

  const relanceMutation = useMutation({
    mutationFn: submitRelanceDevis,
    onSuccess: () => {
      toast.success("Relance enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ["devis-relance"] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error?.message || "Erreur lors de l'enregistrement de la relance",
      );
    },
  });

  const stopMutation = useMutation({
    mutationFn: updateStopProgression,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devis"] });
      toast.success("Statut de progression mis à jour");
    },
    onError: (error) => {
      toast.error(error?.message || "Erreur lors de la mise à jour");
    },
  });

  if (loading) return <DevisTableSkeleton />;

  return (
    <>
      <div ref={parentRef} className="w-full overflow-auto relative max-h-125">
        <Table className="min-w-max text-xs">
          <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0 z-9999">
            <TableRow className="hover:bg-brand-dark border-b-0">
              <TableHead>
                <MoreVerticalIcon className="h-4 w-4" />
              </TableHead>
              <TableHead>Statut devis</TableHead>
              <TableHead>Statut BC</TableHead>
              <TableHead>Numéro devis</TableHead>
              <TableHead className="text-center">Date de création</TableHead>
              <TableHead>Emetteur</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Libellé</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="wrap-break-word whitespace-normal max-w-30 text-center">
                Date envoi au client
              </TableHead>
              <TableHead>Relance 1</TableHead>
              <TableHead>Relance 2</TableHead>
              <TableHead>Relance 3</TableHead>
              <TableHead>Stop relance</TableHead>
              <TableHead className="wrap-break-word text-center">
                Position IPS
              </TableHead>
              <TableHead className="wrap-break-word text-center">
                PO/BC client
              </TableHead>
              <TableHead>Créer par</TableHead>
              <TableHead>Soumis par</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Top padding spacer */}
            {paddingTop > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={18} // total number of columns
                  style={{ height: `${paddingTop}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {virtualRows.map((virtualRow) => {
              const d = devis[virtualRow.index];
              if (!d) return null;

              return (
                <TableRow
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="wrap-break-word whitespace-normal text-center  [&_td]:text-[0.7rem] "
                >
                  <TableCell className="max-w-auto">
                    <DotsMenu
                      contentClassName="ml-4 mt-2"
                      actions={getActions(d)}
                    />
                  </TableCell>

                  <TableCell
                    className={cn(
                      "font-mono w-30 whitespace-normal wrap-break-word text-center py-2 px-3 font-semibold",
                      getStatutDevisClass(d.statutDw ?? ""),
                    )}
                  >
                    {displayValue(d.statutDw)}
                  </TableCell>

                  <TableCell
                    className={cn(
                      "font-mono w-30 whitespace-normal wrap-break-word text-center p-2 font-semibold",
                      getStatutDevisClass(d.statutBc ?? ""),
                    )}
                  >
                    {displayValue(d.statutBc)}
                  </TableCell>

                  <TableCell className=" ">
                    {displayValue(d.numeroDevis)}
                  </TableCell>
                  <TableCell className="font-mono  ">
                    {displayValue(formatApprorpiateDate(d.dateCreation))}
                  </TableCell>
                  <TableCell className="font-mono  text-start">
                    {displayValue(d.emetteur)}
                  </TableCell>
                  <TableCell className="font-mono  wrap-break-word whitespace-normal max-w-50 text-start">
                    {displayValue(d.client)}
                  </TableCell>
                  <TableCell className="font-mono ">
                    {displayValue(d.numeroDevis)}
                  </TableCell>
                  <TableCell className="font-mono  text-right min-w-40">
                    {displayValue(formatMontant(d.montantDevis))}
                  </TableCell>
                  <TableCell className="font-mono  wrap-break-word whitespace-normal max-w-20 text-center">
                    {d.dateEnvoiDevisAuClient}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono  text-center",
                      getStatutRelanceClass(d.statutRelance1),
                    )}
                  >
                    {displayValue(d.statutRelance1)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono  text-center",
                      getStatutRelanceClass(d.statutRelance2),
                    )}
                  >
                    {displayValue(d.statutRelance2)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "font-mono  text-center",
                      getStatutRelanceClass(d.statutRelance3),
                    )}
                  >
                    {displayValue(d.statutRelance3)}
                  </TableCell>
                  <TableCell className="font-mono py-2">
                    <Switch
                      checked={d.stopProgressionGlobal === "STOP"}
                      onCheckedChange={(checked) => {
                        stopMutation.mutate({
                          numeroDevis: d.numeroDevis,
                          stop: checked,
                        });
                      }}
                      disabled={stopMutation.isPending}
                      className="z-0"
                    />
                  </TableCell>
                  <TableCell className="font-mono ">
                    {displayValue(d.positionIps)}
                  </TableCell>
                  <TableCell className="font-mono ">
                    {d.urlPo ? (
                      <a
                        href={d.urlPo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        {d.numeroPo}
                      </a>
                    ) : (
                      displayValue(d.numeroPo)
                    )}
                  </TableCell>
                  <TableCell className="font-mono ">
                    {displayValue(d.utilisateurCreateurDevis)}
                  </TableCell>
                  <TableCell className="font-mono ">{d.soumisPar}</TableCell>
                </TableRow>
              );
            })}

            {/* Bottom padding spacer */}
            {paddingBottom > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={18}
                  style={{ height: `${paddingBottom}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {devis.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={18}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  Aucun devis trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DialogRelanceDevisForm
        open={open}
        onOpenChange={setOpen}
        numeroDevis={selectedDevisForRelance?.numeroDevis}
        onSubmitRelance={({ numeroDevis, dateRelance }) => {
          relanceMutation.mutate({ numeroDevis, dateRelance });
        }}
        isLoading={relanceMutation.isPending}
      />
    </>
  );
}

export default DevisTable;
