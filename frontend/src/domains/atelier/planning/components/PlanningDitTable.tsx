import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEtatPlanningColorMark } from "@/helper/helper";
import { cn, formatMonthDisplay } from "@/lib/utils";
import type { PlanningDit } from "../schema/planningDitSchema";

function PlanningDitTable({
  planningDit,
  loading,
  locale = "fr-FR",
}: {
  planningDit: PlanningDit[];
  loading: boolean;
  locale?: string;
}) {
  // Récupérer tous les mois uniques et les trier
  const allMonths = planningDit.flatMap((p) => p.mois.map((m) => m.date));
  if (allMonths.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        Aucune donnée de planning
      </div>
    );
  }

  // Trier les mois et générer la plage
  const sortedMonths = allMonths.sort();
  const minDate = new Date(sortedMonths[0]);
  const maxDate = new Date(sortedMonths[sortedMonths.length - 1]);

  const months: string[] = [];
  let current = new Date(minDate);
  while (current <= maxDate) {
    months.push(current.toISOString().slice(0, 7));
    current.setMonth(current.getMonth() + 1);
  }

  if (loading) return <>Loading squeleton</>;

  return (
    <div className="w-full overflow-x-auto py-4">
      <Table className=" min-w-max text-xs">
        <TableHeader>
          <TableRow>
            <TableHead>Agence - Service Travaux</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Marque</TableHead>
            <TableHead>Modèle</TableHead>
            <TableHead>N° Série</TableHead>
            <TableHead>N° Parc</TableHead>
            <TableHead>Casier</TableHead>
            {months.map((month) => (
              <TableHead key={month} className="text-center">
                {formatMonthDisplay(month, locale)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {planningDit?.map((d) => {
            return (
              <TableRow key={d.id}>
                <TableCell>
                  {d.agence} / {d.service}
                </TableCell>
                <TableCell>{d.id}</TableCell>
                <TableCell>{d.marque}</TableCell>
                <TableCell>{d.model}</TableCell>
                <TableCell>{d.numSerie}</TableCell>
                <TableCell>{d.numParc}</TableCell>
                <TableCell>{d.casier}</TableCell>
                {months.map((month) => {
                  const moisData = d.mois.find((m) => m.date === month);
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

          {planningDit.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7 + months.length}
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

export default PlanningDitTable;
