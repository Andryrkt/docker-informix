import { useState, useEffect, useMemo } from "react";
import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import {
  dossierDitMock,
  dossierDitListItemMock,
} from "../schema/dossierDitMock";
import { dossierDitFieldFilter } from "../filter/DossierDitFieldfilter";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn, formatFileSize } from "@/lib/utils";
import { DocTypeBadge } from "@/components/common/DocTypeBadge";
import { DocumentViewer } from "@/components/common/DocumentViewer";
import type {
  DossierDit,
  DossierDitListItem,
} from "../schema/dossierDitSchema";
import {
  fetchDossierDitDetails,
  fetchDossierDitList,
} from "../api/dossierDitapi";
import { useQuery } from "@tanstack/react-query";
import DossierDitItemsSkeletonTable from "./DossierDitItemsSkeletonTable";

function DossierDitTableWithView() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: dossierDitListItem,
    isLoading: isLoagingDossierDitListItem,
    isFetching: isFetchingDossierDitListItem,
  } = useQuery({
    queryKey: ["dossier-dit-list", selectedFilters, currentPage],
    queryFn: () => fetchDossierDitList(selectedFilters, currentPage),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = dossierDitListItem?.data ?? [];
  const lastPage = dossierDitListItem?.totalPages ?? 1;

  // État du DIT sélectionné
  const [selectedDit, setSelectedDit] = useState<DossierDitListItem | null>(
    null,
  );

  const {
    data: dossierDitResponse,
    isLoading: isLoadingDossierDit,
    isFetching: isFetchingDossierDit,
  } = useQuery({
    queryKey: ["dossier-dit-details", selectedDit?.numeroDemandeIntervention],

    queryFn: () =>
      fetchDossierDitDetails(selectedDit?.numeroDemandeIntervention),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const filteredDossiers: DossierDit[] = dossierDitResponse?.data ?? [];

  const handleSelectDit = (dit: DossierDitListItem) => {
    setSelectedDit(dit);
  };

  const viewerFiles = useMemo(async () => {
    const files = filteredDossiers.map(async (document) => {
      const response = await fetch(document.pieceJointe.url!);

      const blob = await response.blob();

      return new File([blob], document.pieceJointe.nom, {
        type: document.pieceJointe.type,
      });
    });
    return Promise.all(files);
  }, [filteredDossiers]);

  return (
    <>
      <div className="flex-col gap-4 space-y-4   ">
        {/* Filtre (inchangé) */}
        <CollapsibleFilterForm
          fields={dossierDitFieldFilter}
          onSearch={(values) => {
            Object.entries(values).forEach(([key, value]) => {
              setFilter(key, String(value ?? ""));
            });
          }}
          onReset={reset}
          className="border-b-0 rounded-t-md "
        />

        {/* Tableau des DIT */}
        <div className="w-full  overflow-auto min-h-40">
          {/* {isLoadingDossierDit || isFetchingDossierDitListItem ? (
            <DossierDitItemsSkeletonTable />
          ) : (
            <Table>
              <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0">
                <TableRow className="hover:bg-brand-dark border-b-0">
                  <TableHead className="wrap-break-word whitespace-normal max-w-20 text-center">
                    Date Demande
                  </TableHead>
                  <TableHead>N° DIT</TableHead>
                  <TableHead className="wrap-break-word whitespace-normal max-w-20">
                    ID mat
                  </TableHead>
                  <TableHead>N° Parc</TableHead>
                  <TableHead>N° Série</TableHead>
                  <TableHead className="wrap-break-word whitespace-normal max-w-10">
                    Designation
                  </TableHead>
                  <TableHead>N° OR</TableHead>
                  <TableHead>Nbr de docs</TableHead>
                  <TableHead>Int / Ext</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dossierDitListItem?.data.map((d, index) => (
                  <TableRow
                    key={index}
                    onClick={() => handleSelectDit(d)}
                    className={cn(
                      "cursor-pointer text-xs font-mono text-gray-600 hover:bg-muted/40 transition",
                      selectedDit?.numeroDemandeIntervention ===
                        d.numeroDemandeIntervention && "bg-brand-primary/40",
                    )}
                  >
                    <TableCell className="text-center py-4 px-4">
                      {d.dateDemande}
                    </TableCell>
                    <TableCell className="font-medium">
                      {d.numeroDemandeIntervention}
                    </TableCell>
                    <TableCell>{d.idMateriel ?? "-"}</TableCell>
                    <TableCell>{d.numParc ?? "-"}</TableCell>
                    <TableCell>{d.numSerie ?? "-"}</TableCell>
                    <TableCell className="max-w-32 truncate">
                      {d.designation ?? "-"}
                    </TableCell>
                    <TableCell>{d.numeroOr ?? "-"}</TableCell>
                    <TableCell className="text-center">
                      {d.nbrPj ?? 0}
                    </TableCell>
                    <TableCell className="text-center">
                      {d.interneExterne ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {dossierDitListItem?.data.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-6 text-gray-500 h-80"
                    >
                      Aucun DIT trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )} */}

          <Table>
            <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0">
              <TableRow className="hover:bg-brand-dark border-b-0">
                <TableHead className="wrap-break-word whitespace-normal max-w-20 text-center">
                  Date Demande
                </TableHead>
                <TableHead>N° DIT</TableHead>
                <TableHead className="wrap-break-word whitespace-normal max-w-20">
                  ID mat
                </TableHead>
                <TableHead>N° Parc</TableHead>
                <TableHead>N° Série</TableHead>
                <TableHead className="wrap-break-word whitespace-normal max-w-10">
                  Designation
                </TableHead>
                <TableHead>N° OR</TableHead>
                <TableHead>Nbr de docs</TableHead>
                <TableHead>Int / Ext</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dossierDitListItemMock?.map((d, index) => (
                <TableRow
                  key={index}
                  onClick={() => handleSelectDit(d)}
                  className={cn(
                    "cursor-pointer text-xs font-mono text-gray-600 hover:bg-muted/40 transition",
                    selectedDit?.numeroDemandeIntervention ===
                      d.numeroDemandeIntervention && "bg-brand-primary/40",
                  )}
                >
                  <TableCell className="text-center py-4 px-4">
                    {d.dateDemande}
                  </TableCell>
                  <TableCell className="font-medium">
                    {d.numeroDemandeIntervention}
                  </TableCell>
                  <TableCell>{d.idMateriel ?? "-"}</TableCell>
                  <TableCell>{d.numParc ?? "-"}</TableCell>
                  <TableCell>{d.numSerie ?? "-"}</TableCell>
                  <TableCell className="max-w-32 truncate">
                    {d.designation ?? "-"}
                  </TableCell>
                  <TableCell>{d.numeroOr ?? "-"}</TableCell>
                  <TableCell className="text-center">{d.nbrPj ?? 0}</TableCell>
                  <TableCell className="text-center">
                    {d.interneExterne ?? "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Titre du dossier sélectionné */}
        <div className="flex flex-col space-y-2 mx-auto">
          <h1 className="text-2xl font-bold tracking-tight">
            Dossier :
            <span className="font-normal mx-2">
              {selectedDit?.numeroDemandeIntervention ?? "Aucun sélectionné"}
            </span>
          </h1>
          <div className="h-1 bg-brand-primary w-1/2"></div>
        </div>

        {/* Tableau des dossiers filtrés */}
        <div className="w-full max-h-150 overflow-auto">
          <Table>
            <TableHeader className="bg-brand-dark [&_th]:text-white sticky top-0">
              <TableRow className="hover:bg-brand-dark border-b-0">
                <TableHead className="text-center">Type</TableHead>
                <TableHead>Nom Document</TableHead>
                <TableHead className="wrap-break-word whitespace-normal max-w-20">
                  N° de document
                </TableHead>
                <TableHead className="wrap-break-word whitespace-normal max-w-10">
                  Date création
                </TableHead>
                <TableHead className="wrap-break-word whitespace-normal max-w-20">
                  Date mise à jour
                </TableHead>
                <TableHead>N° Version</TableHead>
                <TableHead>Nb de pages</TableHead>
                <TableHead>Taille</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* {isLoadingDossierDit || isFetchingDossierDit ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10">
                    Chargement des documents...
                  </TableCell>
                </TableRow>
              ) : filteredDossiers.length > 0 ? (
                filteredDossiers.map((d, index) => (
                  <TableRow
                    key={index}
                    className="cursor-pointer text-xs font-mono text-gray-600 hover:bg-muted/40 transition"
                  >
                    <TableCell className="py-4">
                      <DocTypeBadge type={d.type} />
                    </TableCell>
                    <TableCell className="py-4 px-4 font-medium text-foreground wrap-break-word whitespace-normal">
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
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-4 text-gray-500"
                  >
                    Aucun dossier pour ce DIT
                  </TableCell>
                </TableRow>
              )} */}
              {dossierDitMock.map((d, index) => (
                <TableRow
                  key={index}
                  className="cursor-pointer text-xs font-mono text-gray-600 hover:bg-muted/40 transition"
                >
                  <TableCell className="py-4">
                    <DocTypeBadge type={d.type} />
                  </TableCell>
                  <TableCell className="py-4 px-4 font-medium text-foreground wrap-break-word whitespace-normal">
                    {d.nomDocument}
                  </TableCell>
                  <TableCell className="py-4 px-4">
                    {d.numeroDocument}
                  </TableCell>
                  <TableCell className="py-4 px-4">{d.dateCreation}</TableCell>
                  <TableCell className="py-4 px-4">{d.dateMiseAJour}</TableCell>
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
            </TableBody>
          </Table>
        </div>
      </div>
      <div>
        <DocumentViewer files={viewerFiles} />
      </div>
    </>
  );
}

export default DossierDitTableWithView;
