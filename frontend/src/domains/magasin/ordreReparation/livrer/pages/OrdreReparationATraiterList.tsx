import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";

import { buildExcelFilename } from "@/lib/utils";
import { LimitSelector } from "@/components/common/pagination/LimitSelector";
import { queryClient } from "@/lib/queryClient";
import { useCallback } from "react";
import OrdreReparationATraiterTable from "../components/OrdreReparationATraiterTable";
import { fetchOrdresReparationATraiter } from "../api/ordreReparationATraiterApi";
import { ordreReparationATraiterFieldsFilters } from "../filter/ordreReparationATraiterFieldFilter";

function OrdreReparationATraiterList() {
  const {
    currentPage,
    setPage,
    selectedFilters,
    setFilter,
    reset,
    currentLimit,
    setLimit,
  } = usePageSearchParams(1, "", {}, 20);

  const {
    data: ordreRepartionALivrers,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["or-a-livrer", selectedFilters, currentPage],
    queryFn: () => fetchOrdresReparationATraiter(selectedFilters, currentPage),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = ordreRepartionALivrers?.data ?? [];
  const lastPage = ordreRepartionALivrers?.totalPages;
  const totalResults = ordreRepartionALivrers?.resultat;

  const fetchAllOrLivrerForExport = useCallback(async () => {
    const allData = await queryClient.fetchQuery({
      queryKey: [
        "or-a-livrer-export",
        JSON.stringify(selectedFilters),
        totalResults,
      ],
      queryFn: () =>
        fetchOrdresReparationATraiter(selectedFilters, 1, totalResults),
    });
    return allData.data;
  }, [selectedFilters, queryClient]);

  return (
    <div className="px-2 w-full ">
      <div className=" w-full  space-y-4 pb-4 overflow-auto">
        <div className="sticky top-0 space-y-6 ">
          <CollapsibleFilter
            fields={ordreReparationATraiterFieldsFilters}
            onSearch={(values) => {
              Object.entries(values).forEach(([key, value]) => {
                setFilter(key, String(value ?? ""));
              });
            }}
            onReset={() => {
              reset();
            }}
          />

          <div className="max-w-7xl mt-2 mx-auto w-full flex items-center justify-between ">
            <ExcelDownloadButton
              // data={items}
              fetchAllData={fetchAllOrLivrerForExport}
              filename={buildExcelFilename(
                "or-a-traiter-list",
                selectedFilters,
                ordreReparationATraiterFieldsFilters,
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
                options={[10, 20, 50, 100]}
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

        <OrdreReparationATraiterTable
          ordres={items}
          loading={isLoading || isFetching}
        />

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

export default OrdreReparationATraiterList;
