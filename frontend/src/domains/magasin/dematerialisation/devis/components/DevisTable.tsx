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
import { formatMontant, getStatutDevisClass } from "@/helper/helper";
import { cn, formatDate } from "@/lib/utils";
import { DevisTableSkeleton } from "./DevisTableSkeleton";
import { useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { MenuAction } from "@/domains/atelier/dit/components/Dots.Menu";
import DotsMenu from "@/domains/atelier/dit/components/Dots.Menu";

function DevisTable({ devis, loading }: { devis: Devis[]; loading: boolean }) {
  const navigate = useNavigate();
  const parentRef = useRef<HTMLDivElement>(null);

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

  // ---------- Actions for DotsMenu ----------
  const getActions = useCallback((d: Devis): MenuAction[] => {
    return [
      {
        label: "Voir le devis",
        to: `/devis/${d.numeroDevis}`, // adjust route as needed
      },
      {
        label: "Dupliquer",
        to: `/devis/duplication/${d.numeroDevis}`,
      },
      // add more actions (e.g. "Soumettre", "Clôturer") with onClick + confirm if needed
    ].filter(Boolean) as MenuAction[];
  }, []);

  if (loading) return <DevisTableSkeleton />;

  return (
    <div ref={parentRef} className="w-full overflow-auto relative max-h-125">
      <Table className="min-w-max text-xs">
        <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0">
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
                className="wrap-break-word whitespace-normal text-center  h-10"
              >
                <TableCell className="max-w-auto">
                  <DotsMenu
                    contentClassName="ml-4 mt-2"
                    actions={getActions(d)}
                  />
                </TableCell>

                <TableCell
                  className={cn(
                    "font-mono w-30 whitespace-normal wrap-break-word text-center p-2 font-semibold",
                    getStatutDevisClass(d.statutDw ?? ""),
                  )}
                >
                  {d.statutDw ?? "-"}
                </TableCell>

                <TableCell
                  className={cn(
                    "font-mono w-30 whitespace-normal wrap-break-word text-center p-2 font-semibold",
                    getStatutDevisClass(d.statutBc ?? ""),
                  )}
                >
                  {d.statutBc ?? "-"}
                </TableCell>

                <TableCell className=" text-gray-600">
                  {d.numeroDevis}
                </TableCell>
                <TableCell className="font-mono text-gray-600">
                  {formatDate(d.dateCreation)}
                </TableCell>
                <TableCell className="font-mono text-gray-600 text-start">
                  {d.emetteur}
                </TableCell>
                <TableCell className="font-mono text-gray-600 wrap-break-word whitespace-normal max-w-50 text-start">
                  {d.client}
                </TableCell>
                <TableCell className="font-mono text-gray-600">
                  {d.numeroDevis} {/* fallback */}
                </TableCell>
                <TableCell className="font-mono text-gray-600 text-right min-w-40">
                  {formatMontant(d.montantDevis)}
                </TableCell>
                <TableCell className="font-mono text-gray-600 wrap-break-word whitespace-normal max-w-20 text-center">
                  {d.dateEnvoiDevisAuClient}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-gray-600 text-center",
                    getStatutDevisClass(d.statutRelance1 ?? "-"),
                  )}
                >
                  {d.statutRelance1 ?? "-"}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-gray-600 text-center",
                    getStatutDevisClass(d.statutRelance2 ?? "-"),
                  )}
                >
                  {d.statutRelance2 ?? "-"}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-gray-600 text-center",
                    getStatutDevisClass(d.statutRelance3 ?? "-"),
                  )}
                >
                  {d.statutRelance3 ?? "-"}
                </TableCell>
                <TableCell className="font-mono text-gray-600">
                  {d.stopProgressionGlobal}
                </TableCell>
                <TableCell className="font-mono text-gray-600">
                  {d.positionIps}
                </TableCell>
                <TableCell className="font-mono text-gray-600">
                  {"-"} {/* add if field exists */}
                </TableCell>
                <TableCell className="font-mono text-gray-600">
                  {d.utilisateurCreateurDevis}
                </TableCell>
                <TableCell className="font-mono text-gray-600">
                  {d.soumisPar}
                </TableCell>
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
  );
}

export default DevisTable;
