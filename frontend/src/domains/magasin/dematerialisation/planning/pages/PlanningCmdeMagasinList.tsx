import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import PlanningCmdeMagasinTable from "../components/PlanningCmdeMagasinTable";
import { fetchPlanningCmdeMagasin } from "../api/planningCmdeMagasinApi";
import { planningCmdeMagasinFieldsFilter } from "../filter/planningCmdeMagasinFiedfilter";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import { useEffect, useMemo, useState } from "react";
import { getAgencesWithServices } from "@/domains/agenceService/agenceServiceApi";

function PlanningMagasinList() {
  const { currentPage, selectedFilters, setFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: planningCmdeMagasin,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "planning-cmde-magasin",
      JSON.stringify(selectedFilters),
      currentPage,
    ],
    queryFn: () => fetchPlanningCmdeMagasin(selectedFilters, currentPage),
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
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

  const dynamicFields = useMemo(() => {
    return planningCmdeMagasinFieldsFilter.map((column) =>
      column.map((field) => {
        if (field.name === "agence") {
          return {
            ...field,
            queryFn: async () => {
              return [all, ...agenceServices];
            },
          };
        }
        if (field.name === "services") {
          return {
            ...field,
            placeholder: !selectedAgent ? "Sélectionnez d'abord un agent" : "",
            selectAll: true,
            dependsOn: ["agence"], // ✅ clears services when agent changes
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

  const items = planningCmdeMagasin?.data ?? [];

  return (
    <div className="px-2 w-full  ">
      <div className=" w-full  space-y-4 pb-4 overflow-auto">
        <div className="sticky top-0 space-y-6 ">
          <CollapsibleFilterForm
            fields={dynamicFields}
            onSearch={handleSearch}
            onReset={handleReset}
            onFieldChange={(name, value) => {
              if (name === "agence") {
                setSelectedAgent(value || null);
              }
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
          </div>
        </div>

        <PlanningCmdeMagasinTable
          planningMagasin={items}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default PlanningMagasinList;
