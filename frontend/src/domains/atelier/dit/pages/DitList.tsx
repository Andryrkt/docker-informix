import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { buildExcelFilename } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import DitTable from "../components/DitTable";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import { fetchDits } from "../api/ditApi";
import { ditFieldFilter } from "../filter/DitFieldfilter";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import StatusBadgeGroup, {
  ditStatusMock,
} from "@/components/common/StatusBadgeGroup";

function DitList() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: dit,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["dit", selectedFilters, currentPage],
    queryFn: () => fetchDits(selectedFilters, currentPage),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = dit?.data ?? [];
  const lastPage = dit?.totalPages ?? 1;

  return (
    <div className="px-4 w-full ">
      <div className=" w-full  space-y-6 overflow-x-auto">
        <CollapsibleFilter
          fields={ditFieldFilter}
          onSearch={(values) => {
            Object.entries(values).forEach(([key, value]) => {
              setFilter(key, String(value ?? ""));
            });
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
            data={items}
            filename={buildExcelFilename(selectedFilters, ditMock)}
          ></ExcelDownloadButton>
          <div className="flex items-center gap-2 ">
            <span className="">{dit?.resultat ?? 0}</span>
            <span className="text-muted-foreground text-sm">Résultats</span>
          </div>
          <div className="">
            <SimpleNextPreviousPagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={setPage}
            />
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
