import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import PlanningMagasinTable from "../components/PlanningMagasinTable";
import { fetchPlanning } from "../api/planningApi";
import { planningFieldsFilter } from "../filter/planningMagasinFiedfilter";

function PlanningMagasinList() {
  const { currentPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: planning,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["planning", selectedFilters, currentPage],
    queryFn: () => fetchPlanning(selectedFilters, currentPage),
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = planning?.data ?? [];

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        {/* <PageHeader
          title="Liste des devis"
          description="Voici la liste des devis."
        /> */}
        <CollapsibleFilterForm
          fields={planningFieldsFilter}
          onSearch={(values) => {
            Object.entries(values).forEach(([key, value]) => {
              setFilter(key, String(value ?? ""));
            });
          }}
          onReset={() => {
            reset();
          }}
        />

        <PlanningMagasinTable
          planningMagasin={items}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default PlanningMagasinList;
