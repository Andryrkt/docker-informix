import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import { planningDitFieldfilter } from "../filter/planningDitFieldfilter";
import { getMockPlanningDitDetail } from "../schema/mock/planningDitDetailleMock";
import PlanningDitDetailleTable from "../components/PlanningDitDetailleTable";
import { useEffect, useMemo, useState } from "react";
import { getAgencesWithServices } from "@/domains/agenceService/agenceServiceApi";

function PlanningDitListDetaille() {
  const {
    currentPage,
    setPage,
    selectedFilters,
    setFilter,
    setFilters,
    reset,
  } = usePageSearchParams(1);

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
  const { data: agenceServices = [], isLoading: isLoadingAgences } = useQuery({
    queryKey: ["dit-agences-and-services"],
    queryFn: getAgencesWithServices,
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = planningDit?.data ?? [];
  const lastPage = planningDit?.totalPages ?? 1;

  const getServicesForAgent = (agentValue: string) => {
    const agent = agenceServices.find((a) => a.value === agentValue);
    return agent ? agent.services : [];
  };

  // ---- State for the currently selected agent (sync with URL) ----
  const [selectedAgent, setSelectedAgent] = useState<string | null>(
    selectedFilters.agent_debiteur || null,
  );

  // ---- Keep state in sync when URL changes (e.g., after search or reset) ----
  useEffect(() => {
    setSelectedAgent(selectedFilters.agent_debiteur || null);
  }, [selectedFilters.agent_debiteur]);

  const all = { label: "Tous", value: "all" };
  console.log([all, ...agenceServices]);

  const dynamicFields = useMemo(() => {
    return planningDitFieldfilter.map((column) =>
      column.map((field) => {
        if (field.name === "agent_debiteur") {
          return {
            ...field,
            queryFn: async () => {
              return [all, ...agenceServices];
            },
          };
        }
        if (field.name === "service_debiteur") {
          return {
            ...field,
            placeholder: !selectedAgent
              ? "Sélectionnez d'abord un agent débiteur"
              : "",
            selectAll: true,
            dependsOn: ["agent_debiteur"], // ✅ clears services when agent changes
            options: selectedAgent ? getServicesForAgent(selectedAgent) : [],
          };
        }
        return field;
      }),
    );
  }, [selectedAgent]);

  const handleSearch = (values: Record<string, any>) => {
    console.log("Search values ", values);
    setFilters(values);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className="p-0 w-full  h-full">
      <div className="w-full  gap-6 overflow-x-auto ">
        <CollapsibleFilterForm
          fields={dynamicFields}
          onSearch={handleSearch}
          onReset={handleReset}
          onFieldChange={(name, value) => {
            if (name === "agent_debiteur") {
              setSelectedAgent(value || null);
            }
          }}
        ></CollapsibleFilterForm>
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
          data={items}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default PlanningDitListDetaille;
