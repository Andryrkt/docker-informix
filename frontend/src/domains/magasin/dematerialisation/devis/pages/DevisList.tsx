// import PageHeaderWithAction from "@/layouts/PageHeaderWithAction";

import { useState } from "react";
import DevisTable from "../components/DevisTable";
import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import { toast } from "sonner";
import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import { fetchDevis } from "../api/devisApi";
import { useQuery } from "@tanstack/react-query";
import { buildExcelFilename } from "@/lib/utils";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { devisFieldfilter } from "../filter/devisFieldfilter";

function DevisList() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: devis,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["devis", selectedFilters, currentPage],
    queryFn: () => fetchDevis(selectedFilters, currentPage),
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = devis?.data ?? [];
  const lastPage = devis?.totalPages ?? 1;

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        {/* <PageHeader
          title="Liste des devis"
          description="Voici la liste des devis."
        /> */}
        <CollapsibleFilter
          fields={devisFieldfilter}
          onSearch={(values) => {
            Object.entries(values).forEach(([key, value]) => {
              setFilter(key, String(value ?? ""));
            });
          }}
          onReset={() => {
            reset();
          }}
        />
        <ExcelDownloadButton
          data={items}
          filename={buildExcelFilename(
            "devis",
            selectedFilters,
            devisFieldfilter,
          )}
        ></ExcelDownloadButton>

        {/* Simple pagination */}
        <div className="p-4 flex">
          <div className="ml-auto">
            <SimpleNextPreviousPagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>

        <DevisTable devis={devis} loading={isLoading || isFetching} />
        <div className="p-4 flex">
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

export default DevisList;
