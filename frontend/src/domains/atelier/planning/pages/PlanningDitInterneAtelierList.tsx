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
  const { data: agenceTravaux = [], isLoading: isLoadingAgencesTravaux } =
    useQuery({
      queryKey: ["agences-travaux"],
      queryFn: getAgencesTravaux,
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

  const [selectedAgenceDebiteur, setSelectedAgenceDebiteur] = useState<
    string | null
  >(null);

  const serviceDebiteurOptions = useMemo(() => {
    if (!selectedAgenceDebiteur) return [];
    return getServicesForAgent(selectedAgenceDebiteur);
  }, [selectedAgenceDebiteur, agenceServices]);

  const dynamicFields = useMemo(() => {
    return planningDitInterneAtelierFieldfilter.map((column) =>
      column.map((field) => {
        // -------- AGENCE DÉBITEUR --------
        if (field.name === "agence_debiteur") {
          return {
            ...field,
            options: agenceOptions,
          };
        }
        // -------- SERVICE DÉBITEUR (depends on agence_debiteur) --------
        if (field.name === "service_debiteur") {
          return {
            ...field,
            placeholder: !selectedAgenceDebiteur
              ? "Sélectionnez d'abord une agence débitrice"
              : "",
            selectAll: true,
            dependsOn: ["agence_debiteur"],
            options: serviceDebiteurOptions,
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
            queryFn: () => getSections("/dit/sections-affectees"),
          };
        }
        return field;
      }),
    );
  }, [selectedAgenceDebiteur]);

  const handleSearch = (values: Record<string, any>) => {
    if (values.agence_debiteur !== undefined) {
      setSelectedAgenceDebiteur(values.agence_debiteur || null);
    }
    Object.entries(values).forEach(([key, value]) => {
      setFilter(key, String(value ?? ""));
    });
  };

  const handleReset = () => {
    setSelectedAgenceDebiteur(null);
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
            if (name === "agence_debiteur") {
              setSelectedAgenceDebiteur(value || null);
            }
          }}
        />
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
