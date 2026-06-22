import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import PlanningTable from "../components/PlanningTable";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import { fetchPlanning } from "../api/planningApi";
import { planningFieldsFilter } from "../filter/planningFiedfilter";
import { planningMock } from "../schema/planningMook";

function PlanningList() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
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
  const lastPage = planning?.totalPages ?? 1;

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        {/* <PageHeader
          title="Liste des devis"
          description="Voici la liste des devis."
        /> */}
        <CollapsibleFilter
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

        <PlanningTable planning={items} loading={isLoading || isFetching} />
      </div>
    </div>
  );
}

export default PlanningList;
