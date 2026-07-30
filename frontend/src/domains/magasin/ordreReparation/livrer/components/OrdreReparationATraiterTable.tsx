import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import { InfoIcon, MoreVerticalIcon, ToolCase } from "lucide-react";
import { toast } from "sonner";

import { useConfirm } from "@/components/common/ConfirmDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MaterielInfoCard } from "@/domains/materiel/components/MaterielInfoCard";
import { cn, formatDate } from "@/lib/utils";

import type { MenuAction } from "@/domains/atelier/dit/components/Dots.Menu";
import type { OrdreReparationATraiter } from "../schema/ordreReparationATraiterSchema";
import OrdreReparationLivrerSkeleton from "./OrdreReparationALivrerSkeleton";
import DotsMenu from "@/domains/atelier/dit/components/Dots.Menu";
import { useTranslation } from "react-i18next";

// Helper pour le style d'urgence
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

interface Props {
  ordres: OrdreReparationATraiter[];
  loading: boolean;
}

export default function OrdreReparationATraiterTable({
  ordres,
  loading,
}: Props) {
  const { t } = useTranslation("common");

  const confirm = useConfirm();
  const parentRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<OrdreReparationATraiter | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: ordres?.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - virtualRows[virtualRows.length - 1].end
      : 0;

  // Actions
  const getActions = useCallback(
    (order: OrdreReparationATraiter) => {
      return [
        {
          label: "Dossier DIT",
          to: `/atelier/demande-intervention/dossier/${order.numeroDit}`,
        },
      ].filter(Boolean) as MenuAction[];
    },
    [confirm],
  );

  if (loading) {
    return <OrdreReparationLivrerSkeleton />;
  }

  const TOTAL_COLUMNS = 17;

  return (
    <TooltipProvider>
      <div
        ref={parentRef}
        className="w-full overflow-auto relative h-[calc(100vh-160px)]"
      >
        <Table className="min-w-max border-collapse">
          <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0 z-10">
            <TableRow className="hover:bg-brand-dark border-b-0">
              <TableHead className="max-w-2 w-fit">
                <MoreVerticalIcon className="h-4 w-4" />
              </TableHead>
              <TableHead>N° DIT</TableHead>
              <TableHead>N° OR</TableHead>
              <TableHead>{t("date-planning")}</TableHead>
              <TableHead className="text-center">{t("niv-urgence")}</TableHead>
              <TableHead>Date OR</TableHead>
              <TableHead>{t("agence-emetteur")}</TableHead>
              <TableHead>{t("service-emetteur")}</TableHead>
              <TableHead>{t("agence-debiteur")}</TableHead>
              <TableHead>{t("service-debiteur")}</TableHead>
              <TableHead>N° ITV</TableHead>
              {/* Colonnes associées aux lignes de l'OR */}
              <TableHead className="text-center">{t("n-ligne")}</TableHead>
              <TableHead>{t("constructeur")}</TableHead>
              <TableHead className="text-center">Réf</TableHead>
              <TableHead className="text-start">{t("designation")}</TableHead>
              <TableHead className="text-center">{t("qte-demandee")}</TableHead>
              <TableHead>{t("utilisateur")}</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paddingTop > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={TOTAL_COLUMNS}
                  style={{ height: `${paddingTop}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {virtualRows.map((virtualRow) => {
              const or = ordres[virtualRow.index];
              if (!or) return null;

              const lignes = or.lignes?.length > 0 ? or.lignes : [null];
              const rowSpan = lignes.length;

              return lignes.map((ligne, lineIndex) => {
                const isFirstLine = lineIndex === 0;

                return (
                  <TableRow
                    key={`${virtualRow.index}-${lineIndex}`}
                    data-index={virtualRow.index}
                    ref={
                      isFirstLine ? rowVirtualizer.measureElement : undefined
                    }
                    className=" text-[0.7rem] hover:bg-muted/50 border-b"
                  >
                    {/* Cellules principales groupées avec rowSpan */}
                    {isFirstLine && (
                      <>
                        <TableCell
                          rowSpan={rowSpan}
                          className="  w-fit cursor-pointer "
                        >
                          <DotsMenu
                            contentClassName="ml-4 mt-2"
                            actions={getActions(or)}
                          />
                        </TableCell>

                        <TableCell rowSpan={rowSpan} className="align-middle">
                          <div className="flex gap-2 items-center">
                            <Link
                              to={`/atelier/demande-intervention/details/${or.numeroDit}`}
                              target="_blank"
                              className="text-blue-600 hover:underline"
                            >
                              {or.numeroDit}
                            </Link>
                            {or.materiel && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                                    <InfoIcon className="h-4 w-4 inline" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="left"
                                  className="p-4 border-0 bg-brand-primary shadow-md"
                                >
                                  <MaterielInfoCard
                                    materiel={or.materiel}
                                    className="bg-brand-primary text-brand-dark"
                                    itemClassName="bg-transparent"
                                  />
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>

                        <TableCell
                          rowSpan={rowSpan}
                          className="font-medium align-middle"
                        >
                          <Link
                            to={`/atelier/ordre-reparation/details/${or.numeroOr}`}
                            target="_blank"
                            className="text-blue-600 hover:underline"
                          >
                            {or.numeroOr}
                          </Link>
                        </TableCell>

                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {formatDate(or.datePlanning)}
                        </TableCell>

                        <TableCell
                          rowSpan={rowSpan}
                          className={cn(
                            "w-20 text-center align-middle",
                            getUrgenceClass(or.niveauUrgence),
                          )}
                        >
                          {or.niveauUrgence ?? "-"}
                        </TableCell>

                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {formatDate(or.dateOr)}
                        </TableCell>

                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {or.agenceEmetteur}
                        </TableCell>
                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {or.serviceEmetteur ?? "-"}
                        </TableCell>
                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {or.agenceDebiteur}
                        </TableCell>
                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {or.serviceDebiteur ?? "-"}
                        </TableCell>
                        <TableCell rowSpan={rowSpan} className="align-middle">
                          {or.numeroItv ?? "-"}
                        </TableCell>
                      </>
                    )}

                    {/* Cellules spécifiques à chaque ligne d'intervention */}
                    <TableCell className="align-middle">
                      {ligne?.numeroLigne ?? "-"}
                    </TableCell>
                    <TableCell className="text-start align-middle">
                      {ligne?.constructeur ?? "-"}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {ligne?.reference ?? "-"}
                    </TableCell>
                    <TableCell className="text-start max-w-50 wrap-break-word align-middle">
                      {ligne?.designation ?? "-"}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {ligne ? ligne.quantiteDemander.toFixed(2) : "-"}
                    </TableCell>
                    <TableCell className="text-start align-middle">
                      {ligne?.utilisateur ?? "-"}
                    </TableCell>
                  </TableRow>
                );
              });
            })}

            {paddingBottom > 0 && (
              <TableRow className="border-none hover:bg-transparent">
                <TableCell
                  colSpan={TOTAL_COLUMNS}
                  style={{ height: `${paddingBottom}px` }}
                  className="p-0 border-none pointer-events-none"
                />
              </TableRow>
            )}

            {ordres?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={TOTAL_COLUMNS}
                  className="text-center py-6 text-gray-500 font-medium"
                >
                  {t("or:aucun-ordre-de-reparation-trouve")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
