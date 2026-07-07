import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { PlanningDitDetail } from "../schema/planningDitDetailleSchema";

const SkeletonRow = ({ colSpan }: { colSpan: number }) => (
  <TableRow>
    {Array.from({ length: colSpan }).map((_, i) => (
      <TableCell key={i} className="py-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </TableCell>
    ))}
  </TableRow>
);

function PlanningDitDetailleTable({
  planningDitDetail,
  loading,
}: {
  planningDitDetail: PlanningDitDetail[];
  loading: boolean;
}) {
  const totalCols = 1 + 12 + 9 + 7 + 1 + 1 + 1;

  const getVal = (val: any) => (val != null && val !== "" ? val : "-");

  if (loading) {
    return (
      <div className="w-full overflow-x-auto py-4">
        <Table className="min-w-max text-xs border border-gray-200">
          <TableHeader className="sticky top-0 z-20">
            <TableRow className="bg-brand-dark [&_th]:text-white">
              <TableHead rowSpan={2} className="border border-gray-300">
                Agence / Service
              </TableHead>
              <TableHead
                colSpan={12}
                className="border border-gray-300 text-center"
              >
                Matériel
              </TableHead>
              <TableHead
                colSpan={9}
                className="border border-gray-300 text-center"
              >
                Ordre de réparation
              </TableHead>
              <TableHead
                colSpan={7}
                className="border border-gray-300 text-center"
              >
                Cession inter-stock
              </TableHead>
              <TableHead rowSpan={2} className="border border-gray-300 ">
                ETA Ivato
              </TableHead>
              <TableHead rowSpan={2} className="border border-gray-300">
                ETA Magasin
              </TableHead>
              <TableHead rowSpan={2} className="border border-gray-300">
                Message
              </TableHead>
            </TableRow>
            <TableRow className="bg-brand-dark [&_th]:text-white">
              {[
                "Marque",
                "Modèle",
                "ID",
                "Série",
                "Parc",
                "Casier",
                "Travaux",
                "OR Itv",
                "Date",
                "CST",
                "Réf",
                "Désignation",
              ].map((label) => (
                <TableHead
                  key={`mat-${label}`}
                  className="border border-gray-300"
                >
                  {label}
                </TableHead>
              ))}
              {[
                "Qté cde",
                "Qté all",
                "Qté reliq",
                "Qté liv",
                "Statut",
                "Date statut",
                "Ctr Marque",
                "Cde frn",
                "Statut ctrmrq",
              ].map((label) => (
                <TableHead
                  key={`ord-${label}`}
                  className="border border-gray-300"
                >
                  {label}
                </TableHead>
              ))}
              {[
                "numCIS",
                "Qté cde",
                "Qté all",
                "Qté rel",
                "Qté liv",
                "Statut",
                "Date statut",
              ].map((label) => (
                <TableHead
                  key={`ces-${label}`}
                  className="border border-gray-300"
                >
                  {label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} colSpan={totalCols} />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!planningDitDetail || planningDitDetail.length === 0) {
    return (
      <div className="w-full py-8 text-center text-gray-500">
        Aucune donnée de planning détaillé
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto relative h-[calc(100vh-10rem)] mt-4">
      <Table className="w-full min-w-max text-xs border-collapse ">
        <TableHeader className="sticky top-0 z-20">
          <TableRow className="bg-brand-dark [&_th]:text-white hover:bg-brand-dark border-b-0">
            <TableHead
              rowSpan={2}
              className="border border-gray-300 sticky left-0 z-30 bg-brand-dark text-white wrap-break-word w-20"
            >
              Agence
            </TableHead>
            <TableHead
              colSpan={12}
              className="border border-gray-300 text-center"
            >
              Matériel
            </TableHead>
            <TableHead
              colSpan={9}
              className="border border-gray-300 text-center"
            >
              Ordre de réparation
            </TableHead>
            <TableHead
              colSpan={7}
              className="border border-gray-300 text-center "
            >
              Cession inter-stock
            </TableHead>
            <TableHead
              rowSpan={2}
              className="border border-gray-300 whitespace-break-spaces  max-w-20"
            >
              ETA Ivato
            </TableHead>
            <TableHead
              rowSpan={2}
              className="border border-gray-300 whitespace-break-spaces  max-w-20"
            >
              ETA Magasin
            </TableHead>
            <TableHead
              rowSpan={2}
              className="border border-gray-300"
              style={{ minWidth: "100px" }}
            >
              Message
            </TableHead>
          </TableRow>
          <TableRow className="bg-brand-dark [&_th]:text-white hover:bg-brand-dark border-b-0">
            {/* Matériel */}
            <TableHead className="border border-gray-300 min-w-[60px]">
              Marque
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px]">
              Modèle
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[40px]">
              ID
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px]">
              Série
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px]">
              Parc
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px]">
              Casier
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[80px]">
              Travaux
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px]">
              OR Itv
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px]">
              Date
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[40px]">
              CST
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[40px]">
              Réf
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[80px]">
              Désignation
            </TableHead>
            {/* Ordre */}
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté cde
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté all
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté reliq
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté liv
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px] text-center">
              Statut
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px] text-center">
              Date statut
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px] text-center">
              Ctr Marque
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Cde frn
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px] text-center">
              Statut ctrmrq
            </TableHead>
            {/* Cession */}
            <TableHead className="border border-gray-300 min-w-[60px] text-center">
              numCIS
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté cde
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté all
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté rel
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[50px] text-center">
              Qté liv
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px] text-center">
              Statut
            </TableHead>
            <TableHead className="border border-gray-300 min-w-[60px] text-center">
              Date statut
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="bg-white">
          {planningDitDetail.map((item, idx) => {
            const maxRows = Math.max(
              item.materiels.length,
              item.ordresReparation.length,
              item.cessionsInterStock.length,
              1,
            );

            const rows = [];
            for (let i = 0; i < maxRows; i++) {
              const mat = i < item.materiels.length ? item.materiels[i] : null;
              const ord =
                i < item.ordresReparation.length
                  ? item.ordresReparation[i]
                  : null;
              const ces =
                i < item.cessionsInterStock.length
                  ? item.cessionsInterStock[i]
                  : null;

              rows.push(
                <TableRow key={`${idx}-${i}`} className="hover:bg-muted/40">
                  {i === 0 && (
                    <TableCell
                      rowSpan={maxRows}
                      className="font-medium align-top border border-gray-200 sticky left-0 z-10 bg-white py-1.5 px-2"
                      style={{ minWidth: "120px" }}
                    >
                      {item.agence} <br />{" "}
                      <span className="font-normal">{item.service}</span>
                    </TableCell>
                  )}

                  {/* 12 colonnes Matériel */}
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.marque)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.modele)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.id)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.numSerie)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.numParc)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.casier)}
                  </TableCell>
                  <TableCell className="break-normal whitespace-normal max-w-30">
                    {getVal(mat?.intituleTravaux)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.numeroORItv)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.datePlanning)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.cst)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.ref)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5">
                    {getVal(mat?.designation)}
                  </TableCell>

                  {/* 9 colonnes Ordre */}
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.qteCde)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.qteAll)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.qteReliq)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.qteLiv)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center font-medium">
                    {getVal(ord?.statut)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.dateStatut)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.ctrMarque)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.cdeFrn)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ord?.statutCtrmrq)}
                  </TableCell>

                  {/* 7 colonnes Cession */}
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ces?.numCIS)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ces?.qteCde)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ces?.qteAll)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ces?.qteRel)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ces?.qteLiv)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center font-medium">
                    {getVal(ces?.statut)}
                  </TableCell>
                  <TableCell className="border border-gray-200 px-1.5 py-1.5 text-center">
                    {getVal(ces?.dateStatut)}
                  </TableCell>

                  {i === 0 && (
                    <>
                      <TableCell
                        rowSpan={maxRows}
                        className="border border-gray-200 align-top px-1.5 py-1.5 max-w-20  wrap-normal"
                      >
                        <span className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 whitespace-normal  wrap-break-word">
                          {item.etaIvato || "-"}
                        </span>
                      </TableCell>
                      <TableCell
                        rowSpan={maxRows}
                        className="border border-gray-200 align-top px-1.5 py-1.5 max-w-20 wrap-normal"
                      >
                        <span className="inline-block px-1.5 py-0.5 rounded bg-green-50 text-green-700  whitespace-normal wrap-break-word text-[0.6rem]">
                          {item.etatMagasin || "-"}
                        </span>
                      </TableCell>
                      <TableCell
                        rowSpan={maxRows}
                        className="border border-gray-200 align-top px-1.5 py-1.5 text-gray-600 max-w-20 whitespace-normal wrap-normal"
                      >
                        {item.message || "-"}
                      </TableCell>
                    </>
                  )}
                </TableRow>,
              );
            }
            return rows;
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default PlanningDitDetailleTable;
