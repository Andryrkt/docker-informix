import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import { fetchPlanningDits } from "../api/planningDitApi";
import { planningDitFieldfilter } from "../filter/planningDitFieldfilter";
import PlanningDitTable from "../components/PlanningDitTable";
import { getMockPlanningDits } from "../schema/mock/planningDitMock";
import { useMemo, useState } from "react";

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

  const agents = [
    {
      label: "Agent 1",
      value: "1",
      services: [
        { label: "Service A", value: "A" },
        { label: "Service B", value: "B" },
      ],
    },
    {
      label: "Agent 2",
      value: "2",
      services: [{ label: "Service C", value: "C" }],
    },
  ];

  const getServicesForAgent = (agentValue: string) => {
    const agent = agents.find((a) => a.value === agentValue);
    return agent ? agent.services : [];
  };

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const dynamicFields = useMemo(() => {
    return planningDitFieldfilter.map((column) =>
      column.map((field) => {
        if (field.name === "agent_debiteur") {
          return {
            ...field,

            queryFn: async () =>
              agents.map((a) => ({ label: a.label, value: a.value })),
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
            <LivraisonStatutsList
              value={selectedFilters.etat_livraison}
              onChange={(etat_livraison) => {
                setFilter("etat_livraison", etat_livraison);
              }}
            ></LivraisonStatutsList>
          </div>
        </div>
        <PlanningDitTable data={items} loading={isLoading || isFetching} />
      </div>
    </div>
  );
}

export default PlanningDitList;
