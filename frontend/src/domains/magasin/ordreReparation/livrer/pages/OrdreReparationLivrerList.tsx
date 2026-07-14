import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import OrdreReparationLivrerTable from "../components/OrdreReparationLivrerTable";
import { buildExcelFilename } from "@/lib/utils";
import { ordreReparationFieldsFilters } from "../filter/OrdreReparationLivrerFieldFilter";
import { fetchOrdresReparationLivrer } from "../api/ordreReparationLivrerApi";

function OrdreReparationLivrerList() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: ordreRepartionALivrers,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["or-a-livrer", selectedFilters, currentPage],
    queryFn: () => fetchOrdresReparationLivrer(selectedFilters, currentPage),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = ordreRepartionALivrers?.data ?? [];
  const lastPage = ordreRepartionALivrers?.totalPages;
  const resultat = ordreRepartionALivrers?.resultat;

  return (
    <div className="px-2 w-full ">
      <div className=" w-full  space-y-6 overflow-auto">
        <div className="sticky top-0 space-y-6 ">
          <CollapsibleFilter
            fields={ordreReparationFieldsFilters}
            onSearch={(values) => {
              Object.entries(values).forEach(([key, value]) => {
                setFilter(key, String(value ?? ""));
              });
            }}
            onReset={() => {
              reset();
            }}
          />

          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <ExcelDownloadButton
              data={items}
              filename={buildExcelFilename(
                "or-a-livrer",
                selectedFilters,
                ordreReparationFieldsFilters,
              )}
            ></ExcelDownloadButton>

            <div className="flex items-center gap-2 font-bold text-[0.7rem]   ">
              <span className="">{resultat}</span>
              <span className=" ">Résultats</span>
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

        <OrdreReparationLivrerTable
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

export default OrdreReparationLivrerList;
