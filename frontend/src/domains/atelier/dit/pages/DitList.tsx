import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { buildExcelFilename } from "@/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import DitTable from "../components/DitTable";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import { fetchCategoriesDemande, fetchDits } from "../api/ditApi";
import LivraisonStatutsList from "@/components/common/LivraisonStatusBadge";
import StatusBadgeGroup, {
  ditStatusMock,
} from "@/components/common/StatusBadgeGroup";

import { ditFieldFilters } from "../filter/DitFieldfilter";
import { LimitSelector } from "@/components/common/pagination/LimitSelector";
import { useCallback, useMemo, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { getAgencesWithServices } from "@/domains/agenceService/agenceServiceApi";
import { getAteliers } from "../../atelierApi";
import { getNiveauUrgences } from "@/domains/niveauUrgence/niveauUrgenceApi";
import { getSections } from "@/domains/section/sectionApi";
import { getStatutsFacture } from "@/domains/facture/factureApi";
import { getStatutsOR } from "@/domains/or/statutOrApi";
import { getCategories } from "../api/categorieApi";

function DitList() {
  const {
    currentPage,
    setPage,
    selectedFilters,
    setFilter,
    setFilters,
    reset,
    currentLimit,
    setLimit,
  } = usePageSearchParams(1, "", {}, 20);

  const {
    data: dits,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      "dits-list",
      JSON.stringify(selectedFilters),
      currentPage,
      currentLimit,
    ],
    queryFn: () => fetchDits(selectedFilters, currentPage, currentLimit),
    placeholderData: keepPreviousData,
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

  const [selectedAgenceEmetteur, setSelectedAgenceEmetteur] = useState<
    string | null
  >(null);

  const [selectedAgenceDebiteur, setSelectedAgenceDebiteur] = useState<
    string | null
  >(null);

  const dynamicFields = useMemo(() => {
    return ditFieldFilters.map((column) =>
      column.map((field) => {
        if (
          field.name === "agence_emetteur" ||
          field.name === "agence_debiteur"
        ) {
          return {
            ...field,

            queryFn: async () =>
              agenceServices.map((a) => ({
                label: `${a.value} - ${a.label}`,
                value: a.value,
              })),
          };
        }

        if (field.name === "service_debiteur") {
          return {
            ...field,
            placeholder: !selectedAgenceDebiteur
              ? "Sélectionnez d'abord un agent débiteur"
              : "",
            selectAll: true,
            dependsOn: ["agence_debiteur"], // ✅ clears services when agent changes
            queryKey: `service_debiteur_${selectedAgenceDebiteur || "none"}`,
            queryFn: async () => {
              if (!selectedAgenceDebiteur) return [];
              return getServicesForAgent(selectedAgenceDebiteur);
            },
          };
        }

        if (field.name === "service_emetteur") {
          return {
            ...field,
            placeholder: !selectedAgenceEmetteur
              ? "Sélectionnez d'abord un agence débiteur"
              : "",
            selectAll: false,
            dependsOn: ["agence_emetteur"],
            queryFn: async () => {
              if (!selectedAgenceEmetteur) return [];
              return getServicesForAgent(selectedAgenceEmetteur);
            },
          };
        }

        if (field.name === "realise_par") {
          return {
            ...field,
            queryFn: getAteliers,
          };
        }

        if (field.name === "niveau_urgence") {
          return {
            ...field,
            queryFn: getNiveauUrgences,
          };
        }

        if (field.name === "section_affectee") {
          return {
            ...field,
            queryFn: async () => getSections("/dit/sectionAffectee"),
          };
        }
        if (field.name === "section_support1") {
          return {
            ...field,
            queryKey: "section_support1",
            queryFn: async () => getSections("/dit/sectionAffectee"),
          };
        }
        if (field.name === "section_support2") {
          return {
            ...field,
            queryKey: "section_support2",
            queryFn: async () => getSections("/dit/sectionAffectee"),
          };
        }
        if (field.name === "section_support3") {
          return {
            ...field,
            queryKey: "section_support3",
            queryFn: async () => getSections("/dit/sectionAffectee"),
          };
        }
        if (field.name === "statut_facture") {
          return {
            ...field,
            queryKey: "statut_facture",
            queryFn: getStatutsFacture,
          };
        }
        if (field.name === "statut_or") {
          return {
            ...field,
            queryKey: "statut_or",
            queryFn: getStatutsOR,
          };
        }
        if (field.name === "categorie_demande") {
          return {
            ...field,
            queryKey: "categorie_demande",
            queryFn: getCategories,
          };
        }

        return field;
      }),
    );
  }, [selectedAgenceDebiteur, selectedAgenceEmetteur]);

  const handleSearch = (values: Record<string, any>) => {
    if (values.agence_debiteur !== undefined) {
      setSelectedAgenceDebiteur(values.agence_debiteur || null);
    }
    if (values.agence_emetteur !== undefined) {
      setSelectedAgenceEmetteur(values.agence_emetteur || null);
    }
    setFilters(values);
  };

  const handleReset = () => {
    setSelectedAgenceDebiteur(null);
    setSelectedAgenceEmetteur(null);
    reset();
  };

  const items = dits?.data ?? [];
  const lastPage = dits?.totalPages ?? 1;
  const totalResults = dits?.resultat ?? 0;
  const statusCounts = dits?.statusCounts ?? [];

  const fetchAllDitsForExport = useCallback(async () => {
    const allData = await queryClient.fetchQuery({
      queryKey: ["dit-export", JSON.stringify(selectedFilters), totalResults],
      queryFn: () => fetchDits(selectedFilters, 1, totalResults),
    });
    return allData.data;
  }, [selectedFilters, queryClient]);

  return (
    <div className="px-2 w-full ">
      <div className=" w-full  space-y-4 pb-4 overflow-auto">
        <div className="sticky top-0 space-y-6 ">
          <CollapsibleFilterForm
            fields={dynamicFields}
            onSearch={handleSearch}
            onReset={handleReset}
            onFieldChange={(name, value) => {
              if (name === "agence_debiteur") {
                setSelectedAgenceDebiteur(value || null);
              }
              if (name === "agence_emetteur") {
                setSelectedAgenceEmetteur(value || null);
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
            <div>
              <StatusBadgeGroup
                items={statusCounts}
                title="Répartition par statut :"
                value={selectedFilters.status}
                onChange={(status) => {
                  setFilter("status", status);
                }}
              ></StatusBadgeGroup>
            </div>
          </div>

          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <ExcelDownloadButton
              // data={items}
              fetchAllData={fetchAllDitsForExport}
              filename={buildExcelFilename(
                "dit-list",
                selectedFilters,
                ditFieldFilters,
              )}
              label={
                totalResults === 0
                  ? "Aucune donnée à exporter"
                  : "Exporter tout (filtré)"
              }
              disabled={totalResults === 0 || isLoading || isFetching}
            ></ExcelDownloadButton>
            <div className="flex items-center gap-4 font-bold ">
              <span className="text-[0.7rem]">{totalResults} Résultats</span>
              <LimitSelector
                currentLimit={currentLimit}
                onLimitChange={setLimit}
              />
            </div>

            <div className="">
              <SimpleNextPreviousPagination
                currentPage={currentPage}
                lastPage={lastPage}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>

        <DitTable dit={items} loading={isLoading || isFetching} />

        <div className=" flex">
          <div className="m-auto">
            <GlobalPagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DitList;
