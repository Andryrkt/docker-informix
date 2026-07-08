import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { getMockPlanningDitInterneAtelier } from "../schema/mock/planningDitInterneAtelier";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { planningDitFieldfilter } from "../filter/planningDitFieldfilter";
import PlanningDitInterneAtelierTable from "../components/PlanningDitInterneAtelierTable";
import { planningDitInterneAtelierFieldfilter } from "../filter/planningDitInterneAtelierFieldfilter";

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

  // Pour les filtres dynamique agent > debiteur[]
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
    return planningDitInterneAtelierFieldfilter.map((column) =>
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
        <CollapsibleFilter
          fields={dynamicFields}
          onSearch={handleSearch}
          onReset={handleReset}
          onFieldChange={(name, value) => {
            if (name === "agent_debiteur") {
              setSelectedAgent(value || null);
            }
          }}
        ></CollapsibleFilter>
        {/* <div className="max-w-7xl mx-auto md:flex justify-between">
          <div>
            <LivraisonStatutsList
              value={selectedFilters.etat_livraison}
              onChange={(etat_livraison) => {
                setFilter("etat_livraison", etat_livraison);
              }}
            ></LivraisonStatutsList>
          </div>
        </div> */}
        <PlanningDitInterneAtelierTable
          data={items}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default PlanningDitInterneAtelierList;
