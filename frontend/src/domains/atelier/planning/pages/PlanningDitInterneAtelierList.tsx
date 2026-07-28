import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { getMockPlanningDitInterneAtelier } from "../schema/mock/planningDitInterneAtelier";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { planningDitFieldfilter } from "../filter/planningDitFieldfilter";
import PlanningDitInterneAtelierTable from "../components/PlanningDitInterneAtelierTable";
import { planningDitInterneAtelierFieldfilter } from "../filter/planningDitInterneAtelierFieldfilter";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import { getAgencesWithServices } from "@/domains/agenceService/agenceServiceApi";
import { getAgencesTravaux } from "@/domains/agenceTravaux/agenceTravauxApi";
import { getWeeksOfYear } from "@/lib/dateUtils";
import { getRessources } from "@/domains/ressource/ressourceApi";
import { getSections } from "@/domains/section/sectionApi";
import PlanningStatusBadge from "@/components/common/PlannigStatusBadge";

function PlanningDitInterneAtelierList() {
  const { currentPage, setPage, selectedFilters, setFilter, reset } =
    usePageSearchParams(1);

  const {
    data: planningDitInterneAtelier,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["planning-interne-atelier", selectedFilters, currentPage],
    queryFn: () =>
      getMockPlanningDitInterneAtelier(selectedFilters, currentPage, 10),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = planningDitInterneAtelier?.data ?? [];

  const { data: agenceServices = [], isLoading: isLoadingAgences } = useQuery({
    queryKey: ["dit-agences-and-services"],
    queryFn: getAgencesWithServices,
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: agenceTravaux = [], isLoading: isLoadingAgencesTravaux } =
    useQuery({
      queryKey: ["dit-agences-travaux"],
      queryFn: getAgencesTravaux,
      staleTime: 50 * 60 * 1000,
      gcTime: 50 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    });

  const getServicesForAgent = (agentValue: string) => {
    const agent = agenceServices.find((a) => a.value === agentValue);
    return agent ? agent.services : [];
  };

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const dynamicFields = useMemo(() => {
    return planningDitInterneAtelierFieldfilter.map((column) =>
      column.map((field) => {
        if (field.name === "agent_debiteur") {
          return {
            ...field,

            queryFn: async () =>
              agenceServices.map((a) => ({ label: a.label, value: a.value })),
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
            queryKey: `service_debiteur_${selectedAgent || "none"}`,
            queryFn: async () => {
              if (!selectedAgent) return [];
              return getServicesForAgent(selectedAgent);
            },
          };
        }
        if (field.name === "agent_travaux") {
          return {
            ...field,

            queryFn: async () =>
              agenceTravaux.map((a) => ({ label: a.label, value: a.value })),
          };
        }
        if (field.name === "num_semaine") {
          return {
            ...field,
            options: getWeeksOfYear(),
          };
        }
        if (field.name === "ressource") {
          return {
            ...field,
            queryFn: getRessources,
          };
        }
        if (field.name === "section_affectee") {
          return {
            ...field,
            queryFn: getSections,
          };
        }
        return field;
      }),
    );
  }, [selectedAgent]);

  const handleSearch = (values: Record<string, any>) => {
    if (values.agent_debiteur !== undefined) {
      setSelectedAgent(values.agent_debiteur || null);
    }
    Object.entries(values).forEach(([key, value]) => {
      setFilter(key, String(value ?? ""));
    });
  };

  const handleReset = () => {
    setSelectedAgent(null);
    reset();
  };

  return (
    <div className="p-4 w-full  h-full">
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
            <PlanningStatusBadge></PlanningStatusBadge>
          </div>
        </div>
        <PlanningDitInterneAtelierTable
          data={items}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default PlanningDitInterneAtelierList;
