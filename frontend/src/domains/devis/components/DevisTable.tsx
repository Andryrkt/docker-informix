import React, { useEffect, useState } from "react";
import { fetchDevis1 } from "../api/devisApi";
import type { Devis } from "../schema/devisSchema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "radix-ui";
import DotsMenu from "./Dots.Menu";
import { MoreVerticalIcon } from "lucide-react";
import { formatMontant, getStatusClass } from "@/helper/helper";
import { cn } from "@/lib/utils";

function DevisTable({
  refreshKey,
  onRefresh,
}: {
  refreshKey: number;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [devis, setDevis] = useState<Devis[]>([]);
  //   const HUGE_LIST = Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`);

  useEffect(
    () => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(true);

      fetchDevis1()
        .then((response) => {
          setDevis(response);
          // setLastPage(response.last_page);
          // setTotal(response.total);
        })
        .finally(() => setLoading(false));
    },
    [
      // currentPage, keyword, selectedFilters, refreshKey
    ],
  );
  if (loading) return <div className="py-4">Chargement...</div>;
  return (
    <div className="  w-full overflow-x-auto py-4 ">
      <Table className=" text-white min-w-max  text-xs  ">
        <TableHeader>
          <TableRow>
            <TableHead>
              <MoreVerticalIcon className="h-4 w-4" />
            </TableHead>
            <TableHead>Statut devis</TableHead>
            <TableHead>Statut BC</TableHead>
            <TableHead>Numéro devis</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Emetteur</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Libellé</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className=" wrap-break-word whitespace-normal max-w-30 text-center">
              Date envoi au client{" "}
            </TableHead>
            <TableHead>Relance 1</TableHead>
            <TableHead>Relance 2</TableHead>
            <TableHead>Relance 3</TableHead>
            <TableHead>Stop relance</TableHead>
            <TableHead className=" wrap-break-word text-center">
              Position IPS
            </TableHead>
            <TableHead className=" wrap-break-word text-center">
              PO/BC client
            </TableHead>
            <TableHead>Créer par</TableHead>
            <TableHead>Soumis par</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devis?.map((d) => {
            return (
              <TableRow>
                <TableCell className=" font-mono text-gray-600  max-w-auto">
                  {<DotsMenu></DotsMenu>}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono max-w-30 whitespace-normal wrap-break-word text-center px-2 py-2",
                    getStatusClass(d.STATUT_DW ? d.STATUT_DW : ""),
                  )}
                >
                  {d.STATUT_DW ? d.STATUT_DW : "-"}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono max-w-30 whitespace-normal wrap-break-word text-center px-2 py-2",
                    getStatusClass(d.STATUT_BC ? d.STATUT_BC : ""),
                  )}
                >
                  {d.STATUT_BC ? d.STATUT_BC : "-"}
                </TableCell>
                <TableCell className=" font-mono text-gray-600">
                  {d.NUMERO_DEVIS}
                </TableCell>
                <TableCell className=" font-mono text-gray-600">
                  {d.DATE_CREATION}
                </TableCell>
                <TableCell className=" font-mono text-gray-600">
                  {d.EMETTEUR}
                </TableCell>
                <TableCell className=" font-mono text-gray-600 wrap-break-word whitespace-normal max-w-50">
                  {d.CLIENT}
                </TableCell>
                <TableCell className=" font-mono text-gray-600">
                  {d.NUMERO_DEVIS}
                </TableCell>
                <TableCell className=" font-mono text-gray-600 text-right min-w-40">
                  {formatMontant(d.MONTANT_DEVIS, "Ar")}
                </TableCell>
                <TableCell className=" font-mono text-gray-600  wrap-break-word whitespace-normal max-w-20 text-center">
                  {d.DATE_ENVOYE_DEVIS_AU_CLIENT}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-gray-600 text-center",
                    getStatusClass(d.STATUT_RELANCE_1 ?? "-"),
                  )}
                >
                  {d.STATUT_RELANCE_1 ?? "-"}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-gray-600 text-center",
                    getStatusClass(d.STATUT_RELANCE_2 ?? "-"),
                  )}
                >
                  {d.STATUT_RELANCE_2 ?? "-"}
                </TableCell>
                <TableCell
                  className={cn(
                    "font-mono text-gray-600 text-center",
                    getStatusClass(d.STATUT_RELANCE_3 ?? "-"),
                  )}
                >
                  {d.STATUT_RELANCE_3 ?? "-"}
                </TableCell>
                <TableCell className=" font-mono text-gray-600">
                  {d.STOP_PROGRESSION_GLOBAL}
                </TableCell>
                <TableCell className=" font-mono text-gray-600 ">
                  {d.POSITION_IPS}
                </TableCell>
                <TableCell className=" font-mono text-gray-600  ">
                  {d.UTILISATEUR_CREATEUR_DEVIS}
                </TableCell>
                <TableCell className=" font-mono text-gray-600">
                  {d.SOUMIS_PAR}
                </TableCell>
              </TableRow>
            );
          })}

          {devis.length === 0 && (
            <TableRow>
              <TableCell className=" font-mono text-gray-600"></TableCell>
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
