import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import { planningDitFieldfilter } from "../filter/planningDitFieldfilter";
import { getMockPlanningDitDetail } from "../schema/mock/planningDitDetailleMock";
import PlanningDitDetailleTable from "../components/PlanningDitDetailleTable";

function PlanningDitListDetaille() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: planningDit,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["planning-dit-detaille", selectedFilters, currentPage],
    queryFn: () => getMockPlanningDitDetail(selectedFilters, currentPage, 10),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = planningDit?.data ?? [];
  const lastPage = planningDit?.totalPages ?? 1;

  return (
    <div className="p-0 w-full  h-full">
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
        <PlanningDitDetailleTable
          planningDitDetail={items}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default PlanningDitListDetaille;
