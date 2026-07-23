import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ToolCase } from "lucide-react";
import { Link } from "react-router-dom";
import { cn, formatDate } from "@/lib/utils";
// import DotsMenu, { type MenuAction } from "./Dots.Menu";
import { useCallback, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useConfirm } from "@/components/common/ConfirmDialog";
// import DialogSoumissionDocForm from "./DialogSoumissionDocForm";
import { toast } from "sonner";
import type { OrdreReparationALivrer } from "../schema/ordreReparationALivrerSchema";
import OrdreReparationLivrerSkeleton from "./OrdreReparationALivrerSkeleton";
import type { MenuAction } from "@/domains/atelier/dit/components/Dots.Menu";

// Helper to style urgency levels
const getUrgenceClass = (niveau: string | null) => {
  switch (niveau) {
    case "P4":
    case "P5":
      return "text-red-600 font-bold";
    case "P3":
      return "text-yellow-600 font-semibold";
    case "P1":
    case "P2":
      return "text-green-600";
    default:
      return "text-gray-500";
  }
};

function OrdreReparationALivrerTable({
  ordres,
  loading,
}: {
  ordres: OrdreReparationALivrer[];
  loading: boolean;
}) {
  const confirm = useConfirm();

  const parentRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<OrdreReparationALivrer | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: ordres?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  // Actions for each row
  const getActions = useCallback(
    (order: OrdreReparationALivrer) => {
      return [
        {
          label: "Dupliquer",
          to: `/atelier/ordre-reparation/duplication/${order.numeroOr}`,
        },
        {
          label: "Soumission document à valider",
          onClick: () => {
            setSelectedOrder(order);
            setOpen(true);
          },
        },
        {
          label: "Dossier OR",
          to: `/atelier/ordre-reparation/dossier/${order.numeroOr}`,
        },
        {
          label: "Clôturer",
          className:
            "text-destructive focus:text-destructive focus:bg-destructive/10",
          onClick: async () => {
            const confirmed = await confirm({
              title: "Clôturer l'ordre de réparation ?",
              description: "Êtes-vous sûr de vouloir clôturer cet ordre ?",
              confirmText: "Clôturer",
              icon: <ToolCase />,
              cancelText: "Annuler",
              variant: "destructive",
            });
            if (!confirmed) return;
            // Call API to close order
            toast.success("Ordre clôturé avec succès");
          },
        },
      ].filter(Boolean) as MenuAction[];
    },
    [confirm],
  );

  if (loading) {
    return <OrdreReparationLivrerSkeleton />;
  }

  return (
    <>
      <div
        ref={parentRef}
        className="w-full overflow-auto relative h-[calc(100vh-160px)]"
      >
        <Table className="min-w-max text-xs">
          <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0">
            <TableRow className="hover:bg-brand-dark border-b-0 ">
              <TableHead>N° DIT</TableHead>
              <TableHead className="text-center">N° OR</TableHead>
              <TableHead className="text-center">Date Planning</TableHead>
              <TableHead className="text-center">Niv. Urgence</TableHead>
              <TableHead className="text-center">Date OR</TableHead>
              <TableHead>Agence Émetteur</TableHead>
              <TableHead>Service Émetteur</TableHead>
              <TableHead>Agence Débiteur</TableHead>
              <TableHead>Service Débiteur</TableHead>
              <TableHead>N° ITV</TableHead>
              <TableHead>N° Ligne</TableHead>
              <TableHead>Constructeur</TableHead>
              <TableHead className="text-center">Réf</TableHead>
              <TableHead className="text-start">Désignation</TableHead>
              <TableHead className="text-center">Qté Demandée</TableHead>
              <TableHead className="text-center">Qté à Livrer</TableHead>
              <TableHead className="text-center">Qté Déjà Livrée</TableHead>

              <TableHead>Utilisateur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paddingTop > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={22}
                  style={{ height: `${paddingTop}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {virtualRows.map((virtualRow) => {
              const order = ordres[virtualRow.index];
              if (!order) return null;

              return (
                <TableRow
                  className="wrap-break-word whitespace-normal text-center text-[0.7rem]"
                  key={virtualRow.index}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                >
                  <TableCell>
                    <Link
                      to={`/atelier/demande-intervention/details/${order.numeroDit}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {order.numeroDit}
                    </Link>
                  </TableCell>

                  <TableCell className="font-medium">
                    <Link
                      to={`/atelier/ordre-reparation/details/${order.numeroOr}`}
                      target="_blank"
                      className="text-blue-600 hover:underline"
                    >
                      {order.numeroOr}
                    </Link>
                  </TableCell>

                  <TableCell>{formatDate(order.datePlanning)}</TableCell>

                  <TableCell
                    className={cn(
                      "w-20 text-center",
                      getUrgenceClass(order.niveauUrgence),
                    )}
                  >
                    {order.niveauUrgence ?? "-"}
                  </TableCell>

                  <TableCell>{formatDate(order.dateOr)}</TableCell>

                  <TableCell>{order.agenceEmetteur}</TableCell>
                  <TableCell>{order.serviceEmetteur ?? "-"}</TableCell>
                  <TableCell>{order.agenceDebiteur}</TableCell>
                  <TableCell>{order.serviceDebiteur ?? "-"}</TableCell>

                  <TableCell>{order.numeroItv ?? "-"}</TableCell>
                  <TableCell>{order.numeroLigne ?? "-"}</TableCell>
                  <TableCell className="text-start">
                    {order.constructeur ?? "-"}
                  </TableCell>
                  <TableCell className="text-start">
                    {order.reference ?? "-"}
                  </TableCell>

                  <TableCell className="text-start w-30 wrap-break-word whitespace-normal">
                    {order.designation ?? "-"}
                  </TableCell>

                  <TableCell className=" w-20 wrap-break-word whitespace-normal">
                    {order.quantiteDemandee.toFixed(2)}
                  </TableCell>
                  <TableCell className=" w-20 wrap-break-word whitespace-normal">
                    {order.quantiteALivrer.toFixed(2)}
                  </TableCell>
                  <TableCell className=" w-20 wrap-break-word whitespace-normal">
                    {order.quantiteDejaLivree.toFixed(2)}
                  </TableCell>

                  <TableCell>{order.utilisateur ?? "-"}</TableCell>
                </TableRow>
              );
            })}

            {paddingBottom > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={22}
                  style={{ height: `${paddingBottom}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {ordres?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={22}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  Aucun ordre de réparation trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

export default OrdreReparationALivrerTable;
