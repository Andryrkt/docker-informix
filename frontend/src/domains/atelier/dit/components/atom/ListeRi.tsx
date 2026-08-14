import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMontant } from "@/helper/helper";
import { formatApprorpiateDate } from "@/lib/dateUtils";
import { cn } from "@/lib/utils";
import React from "react";

function ListeRi({ data }: { data: any }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        Aucune soumission RI trouvée.
      </p>
    );
  }

  return (
    <Table className="text-xs">
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>N° RI</TableHead>
          <TableHead>Date soumission</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="text-right">Montant</TableHead>
          <TableHead>Observations</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.numeroRi || item.numeroRI || "-"}</TableCell>
            <TableCell>
              {item.dateSoumission
                ? formatApprorpiateDate(item.dateSoumission)
                : "-"}
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  item.statut === "VALIDÉ"
                    ? "bg-green-100 text-green-800"
                    : item.statut === "REJETÉ"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800",
                )}
              >
                {item.statut || "-"}
              </span>
            </TableCell>
            <TableCell className="text-right">
              {item.montant ? formatMontant(item.montant) : "-"}
            </TableCell>
            <TableCell>{item.observations || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ListeRi;
