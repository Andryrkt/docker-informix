import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import DossierDitView from "./DossierDitView";
import { dossierDitMock } from "../schema/dossierDitMock";
import { dossierDitFieldFilter } from "../filter/DossierDitFieldfilter";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import { fetchDits } from "../../dit/api/ditApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStatusDevisClass } from "@/helper/helper";
import { cn, formatFileSize } from "@/lib/utils";
import { MoreVerticalIcon, Link } from "lucide-react";
import DotsMenu from "../../dit/components/Dots.Menu";
import type { Dit } from "../../dit/schema/ditSchema";
import { DocTypeBadge } from "@/components/common/DocTypeBadge";
import { DocumentViewer } from "@/components/common/DocumentViewer";

function DossierList() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  // const {
  //   data: dit,
  //   isLoading,
  //   isFetching,
  // } = useQuery({
  //   queryKey: ["dit", selectedFilters, currentPage],
  //   queryFn: () => fetchDits(selectedFilters, currentPage),
  //   staleTime: 0 * 60 * 1000,
  //   gcTime: 0 * 60 * 1000,
  //   refetchOnWindowFocus: false,
  //   refetchOnReconnect: false,
  // });

  const mockDit: Dit[] = [
    {
      dateDemande: "2026-07-01",
      numeroDemandeIntervention: "DIT-0001",
      idMateriel: "MAT-1001",
      numeroParc: "PARC-2201",
      numeroSerie: "SER-88421",
      designation: "Maintenance moteur hydraulique",
      numeroOr: "OR-7781",
      nombreDocuments: 3,
      interneExterne: "Interne",
    },
  ];

  return (
    <div className="p-4 w-full  ">
      <div className=" w-full grid grid-cols-2 gap-6 overflow-x-auto">
        <div className="flex-col gap-4 space-y-4">
          <CollapsibleFilter
            fields={dossierDitFieldFilter}
            onSearch={(values) => {
              Object.entries(values).forEach(([key, value]) => {
                setFilter(key, String(value ?? ""));
              });
            }}
            onReset={() => {
              reset();
            }}
            className=" border-b-0 rounded-t-md border"
          />
          <div className="w-full  max-h-100 overflow-auto border">
            <Table>
              <TableHeader className=" bg-brand-dark  [&_th]:text-white sticky top-0">
                <TableRow className="hover:bg-brand-dark border-b-0  ">
                  <TableHead className=" wrap-break-word whitespace-normal max-w-20 text-center">
                    Date Demande
                  </TableHead>
                  <TableHead>N° DIT</TableHead>
                  <TableHead className=" wrap-break-word whitespace-normal max-w-20">
                    ID mat
                  </TableHead>
                  <TableHead>N° Parc</TableHead>
                  <TableHead>N° Série</TableHead>

                  <TableHead className=" wrap-break-word whitespace-normal max-w-10">
                    Designation
                  </TableHead>
                  <TableHead>N° OR</TableHead>
                  <TableHead>Nbr de docs</TableHead>
                  <TableHead>Int / Ext</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDit.map((d, index) => (
                  <TableRow
                    key={index}
                    className="text-xs font-mono text-gray-600 hover:bg-muted/40 transition"
                  >
                    <TableCell className="text-center py-4 px-4">
                      {d.dateDemande}
                    </TableCell>

                    <TableCell className="font-medium">
                      {d.numeroDemandeIntervention}
                    </TableCell>

                    <TableCell>{d.idMateriel ?? "-"}</TableCell>

                    <TableCell>{d.numeroParc ?? "-"}</TableCell>

                    <TableCell>{d.numeroSerie ?? "-"}</TableCell>

                    <TableCell className="max-w-32 truncate">
                      {d.designation ?? "-"}
                    </TableCell>

                    <TableCell>{d.numeroOr ?? "-"}</TableCell>

                    <TableCell className="text-center">
                      {d.nombreDocuments ?? 0}
                    </TableCell>

                    <TableCell className="text-center">
                      {d.interneExterne ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}

                {mockDit.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-6 text-gray-500"
                    >
                      Aucun DIT trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col space-y-2 mx-auto">
            <h1 className="text-2xl font-bold  tracking-tight ">
              Dossier : {"XXXXXXXXX"}
            </h1>
            <div className="h-1 bg-brand-primary w-1/2"></div>
          </div>

          <div className="w-full max-h-150 overflow-auto ">
            <Table>
              <TableHeader className=" bg-brand-dark  [&_th]:text-white sticky top-0">
                <TableRow className="hover:bg-brand-dark border-b-0  ">
                  <TableHead className=" text-center">Type</TableHead>
                  <TableHead>Nom Document</TableHead>
                  <TableHead className=" wrap-break-word whitespace-normal max-w-20">
                    N° de document
                  </TableHead>
                  <TableHead className=" wrap-break-word whitespace-normal max-w-10">
                    Date création
                  </TableHead>
                  <TableHead className=" wrap-break-word whitespace-normal max-w-20">
                    Date mise à jour
                  </TableHead>
                  <TableHead>N° Version</TableHead>
                  <TableHead>Nb de pages</TableHead>
                  <TableHead>Taille</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {dossierDitMock.map((d, index) => (
                  <TableRow
                    key={index}
                    // onClick={() => handleSelect(d)}
                    className="cursor-pointer text-xs font-mono text-gray-600 hover:bg-muted/40 transition"
                  >
                    <TableCell className="py-4">
                      <DocTypeBadge type={d.type} />
                    </TableCell>

                    <TableCell className="py-4 px-4 font-medium text-foreground wrap-break-word whitespace-normal ">
                      {d.nomDocument}
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      {d.numeroDocument}
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      {d.dateCreation}
                    </TableCell>

                    <TableCell className="py-4 px-4">
                      {d.dateMiseAJour}
                    </TableCell>

                    <TableCell className="py-4 px-4 text-center">
                      {d.numeroVersion}
                    </TableCell>

                    <TableCell className="py-4 px-4 text-center">
                      {d.nombrePages}
                    </TableCell>

                    <TableCell className="py-4 px-4 font-medium">
                      {formatFileSize(d.pieceJointe.taille)}
                    </TableCell>
                  </TableRow>
                ))}

                {/* EMPTY STATE */}
                {dossierDitMock.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-gray-500"
                    >
                      Aucun dossier DIT trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div>
          <DocumentViewer files={[]} />
        </div>
      </div>
    </div>
  );
}

export default DossierList;
