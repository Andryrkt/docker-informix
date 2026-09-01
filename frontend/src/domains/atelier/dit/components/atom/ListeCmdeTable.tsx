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
import React from "react";

function ListeCmdeTable({ data }: { data: any }) {
  if (!data || data.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        Aucune ligne de commande trouvée.
      </p>
    );
  }

  return (
    <Table className="text-xs">
      <TableHeader className="bg-muted/50">
        <TableRow>
          <TableHead>Ligne</TableHead>
          <TableHead>Code Article</TableHead>
          <TableHead>Désignation</TableHead>
          <TableHead className="text-right">Qté</TableHead>
          <TableHead className="text-right">Prix unitaire</TableHead>
          <TableHead className="text-right">Montant total</TableHead>
          <TableHead>Date livraison</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item: any, index: number) => (
          <TableRow key={index}>
            <TableCell>{item.numeroLigne || index + 1}</TableCell>
            <TableCell>{item.codeArticle || "-"}</TableCell>
            <TableCell>{item.designation || "-"}</TableCell>
            <TableCell className="text-right">{item.quantite ?? "-"}</TableCell>
            <TableCell className="text-right">
              {item.prixUnitaire ? formatMontant(item.prixUnitaire) : "-"}
            </TableCell>
            <TableCell className="text-right font-medium">
              {item.montantTotal ? formatMontant(item.montantTotal) : "-"}
            </TableCell>
            <TableCell>
              {item.dateLivraison
                ? formatApprorpiateDate(item.dateLivraison)
                : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default ListeCmdeTable;
