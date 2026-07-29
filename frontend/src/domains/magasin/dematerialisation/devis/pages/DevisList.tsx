// import PageHeaderWithAction from "@/layouts/PageHeaderWithAction";

import { useMemo, useState } from "react";
import DevisTable from "../components/DevisTable";
import CollapsibleFilterForm from "@/components/common/filter/CollapSibleFilterForm";
import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import { fetchDevis, getStatutsDevis } from "../api/devisApi";
import { useQuery } from "@tanstack/react-query";
import { buildExcelFilename } from "@/lib/utils";
import GlobalPagination from "@/components/common/pagination/GlobalPagination";
import SimpleNextPreviousPagination from "@/components/common/pagination/SimpleNextPreviousPagination";
import { usePageSearchParams } from "@/hooks/usePageSearchParams";
import { devisFieldfilter } from "../filter/devisFieldfilter";
import { getAgencesWithServices } from "@/domains/agenceService/agenceServiceApi";
import { getPositionsIPS } from "@/domains/positionIPS/positionIpsApi";
import { getStatutsBC } from "@/domains/bc/BCApi";
import { getClientOptions } from "@/domains/client/api/clientApi";

function DevisList() {
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
    data: devis,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["devis-neg", selectedFilters, currentPage],
    queryFn: () => fetchDevis(selectedFilters, currentPage),
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

  const [selectedAgenceEmetteur, setSelectedAgenceEmetteur] = useState<
    string | null
  >(null);

  const [selectedAgenceDebiteur, setSelectedAgenceDebiteur] = useState<
    string | null
  >(null);

  const dynamicFields = useMemo(() => {
    return devisFieldfilter.map((column) =>
      column.map((field) => {
        if (field.name === "agence_emetteur") {
          return {
            ...field,

            queryFn: async () =>
              agenceServices.map((a) => ({
                label: `${a.value} - ${a.label}`,
                value: a.value,
              })),
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

        if (field.name === "code_client") {
          return {
            ...field,
            queryKey: "code_client",
            queryFn: getClientOptions,
          };
        }
        if (field.name === "statut_devis") {
          return {
            ...field,
            queryKey: "statut_devis",
            queryFn: getStatutsDevis,
          };
        }
        if (field.name === "position_ips") {
          return {
            ...field,
            queryKey: "position_ips",
            queryFn: getPositionsIPS,
          };
        }
        if (field.name === "statut_bc") {
          return {
            ...field,
            queryKey: "statut_bc",
            queryFn: getStatutsBC,
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

  const items = devis?.data ?? [];
  const lastPage = devis?.total_pages ?? 1;

  return (
    <div className="px-2 w-full  ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
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

        {/* Simple pagination */}
        <div className="p-4 flex items-center justify-between mx-auto max-w-7xl">
          <div>
            <ExcelDownloadButton
              data={items}
              filename={buildExcelFilename(
                "devis-list",
                selectedFilters,
                devisFieldfilter,
              )}
            ></ExcelDownloadButton>
          </div>
          <div>
            <SimpleNextPreviousPagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={setPage}
            />
          </div>
        </div>

        <DevisTable devis={items} loading={isLoading || isFetching} />
        <div className="p-4 flex">
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

export default DevisList;
