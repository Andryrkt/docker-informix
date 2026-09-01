import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { useQuery } from "@tanstack/react-query";

import { buildExcelFilename } from "@/lib/utils";
import { LimitSelector } from "@/components/common/pagination/LimitSelector";
import { queryClient } from "@/lib/queryClient";
import { useCallback, useMemo, useState } from "react";
import OrdreReparationATraiterTable from "../components/OrdreReparationATraiterTable";
import { fetchOrdresReparationATraiter } from "../api/ordreReparationATraiterApi";
import { ordreReparationATraiterFieldsFilters } from "../filter/ordreReparationATraiterFieldFilter";
import { useTranslation } from "react-i18next";
import { useHasAction } from "@/hooks/useHasAction";
import { getAgencesWithServices } from "@/domains/agenceService/agenceServiceApi";
import { getNiveauUrgences } from "@/domains/niveauUrgence/niveauUrgenceApi";
import { getPieces } from "../api/piecesApi";
import { getConstructeurs } from "../api/constructeurApi";

function OrdreReparationATraiterList() {
  const { t } = useTranslation("common");
  const {
    currentPage,
    setPage,
    selectedFilters,
    setFilter,
    reset,
    setFilters,
    currentLimit,
    setLimit,
  } = usePageSearchParams(1, "", {}, 20);

  const {
    data: ordreRepartionATraiter,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["or-a-traiter", selectedFilters, currentPage],
    queryFn: () => fetchOrdresReparationATraiter(selectedFilters, currentPage),
    staleTime: 0 * 60 * 1000,
    gcTime: 0 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const items = ordreRepartionATraiter?.data ?? [];
  const lastPage = ordreRepartionATraiter?.total_pages;
  const totalResults = ordreRepartionATraiter?.resultat;

  const fetchAllOrTraiterForExport = useCallback(async () => {
    const allData = await queryClient.fetchQuery({
      queryKey: [
        "or-a-traiter-export",
        JSON.stringify(selectedFilters),
        totalResults,
      ],
      queryFn: () =>
        fetchOrdresReparationATraiter(selectedFilters, 1, totalResults),
    });
    return allData.data;
  }, [selectedFilters, queryClient]);

  const canExportPdf = useHasAction("export");

  const { data: agenceServices = [], isLoading: isLoadingAgences } = useQuery({
    queryKey: ["filter-options", "agences"],
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

  const [selectedAgenceDebiteur, setSelectedAgenceDebiteur] = useState<
    string | null
  >(null);

  const agenceOptions = useMemo(() => {
    return agenceServices.map((a) => ({
      label: `${a.code} - ${a.label}`,
      value: a.value,
    }));
  }, [agenceServices]);

  const serviceDebiteurOptions = useMemo(() => {
    if (!selectedAgenceDebiteur) return [];
    return getServicesForAgent(selectedAgenceDebiteur);
  }, [selectedAgenceDebiteur, agenceServices]);

  const dynamicFields = useMemo(() => {
    return ordreReparationATraiterFieldsFilters.map((row) =>
      row.map((field) => {
        // -------- AGENCE ÉMETTEUR --------
        if (field.name === "agence_emetteur") {
          return {
            ...field,
            options: agenceOptions,
          };
        }

        // -------- AGENCE DÉBITEUR --------
        if (field.name === "agence_debiteur") {
          return {
            ...field,
            options: agenceOptions,
          };
        }

        // -------- SERVICE DÉBITEUR (dépend de agence_debiteur) --------
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

        // -------- CONSTRUCTEUR --------
        if (field.name === "constructeur") {
          return {
            ...field,
            queryFn: getConstructeurs,
          };
        }

        // -------- NIVEAU D'URGENCE --------
        if (field.name === "niveau_urgence") {
          return {
            ...field,
            queryFn: getNiveauUrgences, // fonction existante
          };
        }

        // -------- PIÈCE --------
        if (field.name === "piece") {
          return {
            ...field,
            queryFn: getPieces,
          };
        }

        return field;
      }),
    );
  }, [
    selectedAgenceDebiteur,
    agenceOptions,
    serviceDebiteurOptions,
  ]);
  
  const handleSearch = (values: Record<string, any>) => {
    if (values.agence_debiteur !== undefined) {
      setSelectedAgenceDebiteur(values.agence_debiteur || null);
    }
    setFilters(values);
  };

  const handleReset = () => {
    setSelectedAgenceDebiteur(null);

    reset();
  };

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
            }}
          />

          <div className="max-w-7xl mt-2 mx-auto w-full flex items-center justify-between ">
            <ExcelDownloadButton
              // data={items}
              fetchAllData={fetchAllOrTraiterForExport}
              filename={buildExcelFilename(
                "or-a-traiter-list",
                selectedFilters,
                ordreReparationATraiterFieldsFilters,
              )}
              label={
                totalResults === 0
                  ? t("aucune-donnee-a-exporter")
                  : t("exporter-tout-filtre")
              }
              disabled={
                totalResults === 0 || isLoading || isFetching || !canExportPdf
              }
            ></ExcelDownloadButton>
            <div className="flex items-center gap-4 font-bold ">
              <span className="text-[0.7rem]">
                {totalResults} {t("resultats")}
              </span>
              <LimitSelector
                currentLimit={currentLimit}
                onLimitChange={setLimit}
                options={[10, 20, 50, 100]}
              />
            </div>

            <div className="">
              <SimpleNextPreviousPagination
                currentPage={currentPage}
                lastPage={lastPage ?? 1}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>

        <OrdreReparationATraiterTable
          ordres={items}
          loading={isLoading || isFetching}
        />

        <div className=" flex">
          <div className="m-auto">
            <GlobalPagination
              currentPage={currentPage}
              lastPage={lastPage ?? 1}
              onPageChange={setPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrdreReparationATraiterList;
