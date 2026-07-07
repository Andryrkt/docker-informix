import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import { fetchPlanningDits } from "../api/planningDitApi";
import { planningDitFieldfilter } from "../filter/planningDitFieldfilter";
import PlanningDitTable from "../components/PlanningDitTable";
import { getMockPlanningDits } from "../schema/mock/planningDitMock";

function PlanningDitList() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: planningDit,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["planning-dit", selectedFilters, currentPage],
    queryFn: () => getMockPlanningDits(selectedFilters, currentPage), // ← utiliser le mock
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = planningDit?.data ?? [];
  const lastPage = planningDit?.totalPages ?? 1;

  return (
    <div className="p-4 w-full  h-full">
      <div className="w-full  gap-6 overflow-x-auto ">
        <CollapsibleFilter
          fields={planningDitFieldfilter}
          onSearch={(values) =>
            Object.entries(values).forEach(([key, value]) => {
              setFilter(key, String(value ?? ""));
            })
          }
          onReset={() => {
            reset();
          }}
        ></CollapsibleFilter>
        <div className="max-w-7xl mx-auto md:flex justify-between">
          <div>
            <LivraisonStatutsList
              value={selectedFilters.etat_livraison}
              onChange={(etat_livraison) => {
                setFilter("etat_livraison", etat_livraison);
              }}
            ></LivraisonStatutsList>
          </div>
        </div>
        <PlanningDitTable
          planningDit={items}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default PlanningDitList;
