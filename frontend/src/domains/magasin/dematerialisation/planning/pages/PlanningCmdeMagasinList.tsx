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
    queryKey: ["filter-options", "agences"],
    queryFn: getAgencesWithServices,
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  const agenceOptions = useMemo(() => {
    return agenceServices.map((a) => ({
      label: `${a.code} - ${a.label}`,
      value: a.value,
    }));
  }, [agenceServices]);

  const getServicesForAgent = (agentValue: string) => {
    const agent = agenceServices.find((a) => a.value === agentValue);
    return agent ? agent.services : [];
  };
  // ---- State for the currently selected agent (sync with URL) ----
  const [selectedAgent, setSelectedAgent] = useState<string | null>(
    selectedFilters.agent_debiteur || null,
  );
  const serviceDebiteurOptions = useMemo(() => {
    if (!selectedAgent) return [];
    return getServicesForAgent(selectedAgent);
  }, [selectedAgent, agenceServices]);

  const dynamicFields = useMemo(() => {
    return planningCmdeMagasinFieldsFilter.map((column) =>
      column.map((field) => {
        // -------- AGENCE  --------
        if (field.name === "agence") {
          return {
            ...field,
            options: agenceOptions,
          };
        }
        // -------- SERVICE  (depends on agence) --------
        if (field.name === "services") {
          return {
            ...field,
            placeholder: !selectedAgent
              ? "Sélectionnez d'abord une agence"
              : "",
            selectAll: true,
            dependsOn: ["agence"],
            options: serviceDebiteurOptions,
          };
        }
        return field;
      }),
    );
  }, [selectedAgent]);

  const handleSearch = (values: Record<string, any>) => {
    if (values.agence !== undefined) {
      setSelectedAgent(values.agence || null);
    }
    Object.entries(values).forEach(([key, value]) => {
      setFilter(key, String(value ?? ""));
    });
  };

  const handleReset = () => {
    setSelectedAgent(null);
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
