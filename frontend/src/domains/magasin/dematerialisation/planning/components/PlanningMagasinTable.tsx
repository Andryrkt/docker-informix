import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PlanningTableSkeleton from "./PlanningMagasinTableSkeleton";
import type { Planning } from "../schema/planningMagasinSchema";
import { cn } from "@/lib/utils";
import { getEtatPlanningColorMark } from "@/helper/helper";

function PlanningMagasinTable({
  planningMagasin,
  loading,
}: {
  planningMagasin: Planning[];
  loading: boolean;
}) {
  const months = Array.from(
    new Set(planningMagasin.flatMap((p) => p.MOIS.map((m) => m.date))),
  );

  if (loading) return <PlanningTableSkeleton></PlanningTableSkeleton>;
  return (
    <div className="  w-full overflow-x-auto py-4">
      <Table className=" min-w-max text-xs">
        <TableHeader>
          <TableRow>
            <TableHead>Commerciaux</TableHead>
            <TableHead>Agence / Service</TableHead>
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
          {planningMagasin?.map((d) => {
            return (
              <TableRow key={d.CODE_CLIENT}>
                <TableCell>{d.COMMERCIAUX}</TableCell>
                <TableCell>
                  {d.AGENCE} / {d.SERVICE}
                </TableCell>
                <TableCell>{d.CODE_CLIENT}</TableCell>
                <TableCell>{d.NOM_CLIENT}</TableCell>
                {months.map((month) => {
                  const moisData = d.MOIS.find((m) => m.date === month);
                  return (
                    <TableCell key={month} className="text-center border">
                      {moisData?.entries?.length ? (
                        <div className="space-y-1 grid">
                          {moisData.entries.map((e, i) => (
                            <div
                              key={i}
                              className={cn(
                                "text-xs",
                                getEtatPlanningColorMark(e.etat),
                              )}
                            >
                              {e.value != null && e.value != 0
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

          {planningMagasin.length === 0 && (
            <TableRow>
              <TableCell className=" font-mono text-gray-600"></TableCell>
              <TableCell
                colSpan={18}
                className="text-center py-6 text-gray-500 font-medium"
              >
                Aucun planning à afficher.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default PlanningMagasinTable;
