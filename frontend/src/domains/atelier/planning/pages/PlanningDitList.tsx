import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";
import { fetchPlanningDits } from "../api/planningDitApi";
import { planningDitFieldfilter } from "../filter/planningDitFieldfilter";
import PlanningDitTable from "../components/PlanningDitTable";
import { getMockPlanningDits } from "../schema/mock/planningDitMock";
import { useMemo, useState } from "react";
import { getAgencesWithServices } from "@/domains/agenceService/agenceServiceApi";
import { getNiveauUrgences } from "@/domains/niveauUrgence/niveauUrgenceApi";
import { getSections } from "@/domains/section/sectionApi";
import { getAteliers } from "../../atelierApi";

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
    return planningDitFieldfilter.map((column) =>
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
        if (field.name === "realise_par") {
          return { ...field, queryFn: getAteliers };
        }
        if (field.name === "niveau_urgence") {
          return { ...field, queryFn: getNiveauUrgences };
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
