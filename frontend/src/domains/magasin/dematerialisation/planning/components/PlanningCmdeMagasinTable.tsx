import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PlanningCmdeMagasinTableSkeleton from "./PlanningCmdeMagasinTableSkeleton";
import type {
  PlanningCmdeMagasin,
  ValeurMensuelleEntry,
} from "../schema/planningCmdeMagasinSchema";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState, useCallback } from "react";
import { getEtatPlanningCmdeMagasinColorMark } from "@/helper/helper";
import { CmdeMagasinTableModal } from "./CmdeMagasinTableModal";
// import { MonthEntriesDialog } from "./MonthEntriesDialog"; // 👈 import

function PlanningCmdeMagasinTable({
  planningMagasin,
  loading,
}: {
  planningMagasin: PlanningCmdeMagasin[];
  loading: boolean;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  const months = Array.from(
    new Set(planningMagasin.flatMap((p) => p.MOIS.map((m) => m.date))),
  ).sort();

  const rowVirtualizer = useVirtualizer({
    count: planningMagasin.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{
    clientName: string;
    month: string;
    entry: ValeurMensuelleEntry;
  } | null>(null);

  const openModal = useCallback(
    (clientName: string, month: string, entry: ValeurMensuelleEntry) => {
      setModalData({ clientName, month, entry });
      setModalOpen(true);
    },
    [],
  );

  if (loading) return <PlanningCmdeMagasinTableSkeleton />;

  return (
    <>
      <div ref={parentRef} className="w-full overflow-auto relative max-h-150">
        <Table className="min-w-max text-xs">
          <TableHeader className="sticky top-0 z-20 bg-brand-dark [&_th]:text-white">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead>Commerciaux</TableHead>
              <TableHead>Agence - Service</TableHead>
              <TableHead>Code Client</TableHead>
              <TableHead>Nom client</TableHead>
              {months.map((month) => (
                <TableHead key={month} className="text-center">
                  {month}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={months.length + 4}
                  style={{ height: `${paddingTop}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {virtualRows.map((virtualRow) => {
              const d = planningMagasin[virtualRow.index];
              if (!d) return null;

              return (
                <TableRow
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="border-none hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="py-2">{d.COMMERCIAUX}</TableCell>
                  <TableCell className="uppercase py-2">
                    {d.AGENCE} - {d.SERVICE}
                  </TableCell>
                  <TableCell className="py-2">{d.CODE_CLIENT}</TableCell>
                  <TableCell className="py-2">{d.NOM_CLIENT}</TableCell>
                  {months.map((month) => {
                    const moisData = d.MOIS.find((m) => m.date === month);
                    const entries = moisData?.entries || [];
                    const hasEntries = entries.length > 0;

                    return (
                      <TableCell
                        key={month}
                        className={cn(
                          "text-center py-2 cursor-pointer hover:bg-muted/80 transition-colors",
                          hasEntries
                            ? "text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {hasEntries ? (
                          <div className="space-y-0.5">
                            {entries.map((e, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "text-xs underline hover:text-brand-dark transition-colors duration-300 cursor-pointer",
                                  getEtatPlanningCmdeMagasinColorMark(e.etat),
                                )}
                                onClick={() => {
                                  if (hasEntries) {
                                    openModal(d.NOM_CLIENT, month, e);
                                  }
                                }}
                              >
                                {e.value != null && e.value !== 0
                                  ? e.value.toLocaleString()
                                  : "-"}
                              </div>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}

            {paddingBottom > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={months.length + 4}
                  style={{ height: `${paddingBottom}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {planningMagasin.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={months.length + 4}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  Aucun planning à afficher.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reusable dialog */}
      <CmdeMagasinTableModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        clientName={modalData?.clientName ?? ""}
        month={modalData?.month ?? ""}
        entry={modalData?.entry}
      />
    </>
  );
}

export default PlanningCmdeMagasinTable;
