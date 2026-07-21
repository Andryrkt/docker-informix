import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { buildExcelFilename } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import DitTable from "../components/DitTable";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import { fetchDits } from "../api/ditApi";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import StatusBadgeGroup, {
  ditStatusMock,
} from "@/components/common/StatusBadgeGroup";
import { ditMock } from "../schema/ditMock";
import { ditFieldFilter } from "../filter/DitFieldfilter";
import { LimitSelector } from "@/components/common/pagination/LimitSelector";
import { useCallback, useState } from "react";
import { queryClient } from "@/lib/queryClient";

function DitList() {
  const {
    currentPage,
    setPage,
    selectedFilters,
    setFilter,
    setFilters,
    reset,
    currentLimit,
    setLimit,
  } = usePageSearchParams(1, "", {}, 20);

  const {
    data: dit,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "dit",
      JSON.stringify(selectedFilters),
      currentPage,
      currentLimit,
    ],
    queryFn: () => fetchDits(selectedFilters, currentPage, currentLimit),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = dit?.data ?? [];
  const lastPage = dit?.totalPages ?? 1;
  const totalResults = dit?.resultat ?? 0;

  const fetchAllDitsForExport = useCallback(async () => {
    const allData = await queryClient.fetchQuery({
      queryKey: ["dit-export", JSON.stringify(selectedFilters), totalResults],
      queryFn: () => fetchDits(selectedFilters, 1, totalResults),
    });
    return allData.data;
  }, [selectedFilters, queryClient]);

  return (
    <div className="px-2 w-full ">
      <div className=" w-full  space-y-4 pb-4 overflow-auto">
        <div className="sticky top-0 space-y-6 ">
          <CollapsibleFilter
            fields={ditFieldFilter}
            onSearch={(values) => {
              setFilters(values);
            }}
            onReset={() => {
              reset();
            }}
          />
          <div className="max-w-7xl mx-auto md:flex justify-between">
            <div>
              <LivraisonStatutsList
                value={selectedFilters.etat_livraison}
                onChange={(etat_livraison) => {
                  setFilter("etat_livraison", etat_livraison);
                }}
              ></LivraisonStatutsList>
            </div>
            <div>
              <StatusBadgeGroup
                items={ditStatusMock}
                title="Répartition par statut :"
                value={selectedFilters.status}
                onChange={(status) => {
                  setFilter("status", status);
                }}
              ></StatusBadgeGroup>
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <ExcelDownloadButton
              // data={items}
              fetchAllData={fetchAllDitsForExport}
              filename={buildExcelFilename(
                "dit-list",
                selectedFilters,
                ditFieldFilter,
              )}
              label={
                totalResults === 0
                  ? "Aucune donnée à exporter"
                  : "Exporter tout (filtré)"
              }
              disabled={totalResults === 0 || isLoading || isFetching}
            ></ExcelDownloadButton>
            <div className="flex items-center gap-4 font-bold ">
              <span className="text-[0.7rem]">{totalResults} Résultats</span>
              <LimitSelector
                currentLimit={currentLimit}
                onLimitChange={setLimit}
              />
            </div>

            <div className="">
              <SimpleNextPreviousPagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>

        <DitTable dit={items} loading={isLoading || isFetching} />

        <div className=" flex">
          <div className="m-auto">
            <GlobalPagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DitList;
