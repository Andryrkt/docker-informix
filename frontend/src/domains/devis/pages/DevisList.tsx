// import PageHeaderWithAction from "@/layouts/PageHeaderWithAction";

import { useEffect, useState } from "react";
import DevisTable from "../components/DevisTable";
import CollapsibleFilter from "@/components/common/filter/CollapSibleFilter";
import { toast } from "sonner";
import { fields } from "@/components/common/filter/schema/filterSchema";
import { ExcelDownloadButton } from "@/components/common/excel/ExcelDownloadButton";
import { fetchDevis1 } from "../api/devisApi";
import { useQuery } from "@tanstack/react-query";
import { buildExcelFilename } from "@/lib/utils";
import PageHeader from "@/layout/components/PageHeader";

function DevisList() {
  // const [refreshKey, setRefreshKey] = useState(0);

  // const refresh = () => {
  //   setRefreshKey((prev) => prev + 1);
  // };

  const [filters, setFilters] = useState({});

  const {
    data: devis = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["devis", filters],
    queryFn: () => fetchDevis1(filters),
    staleTime: 50 * 60 * 1000,
    gcTime: 50 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <PageHeader
          title="Liste des devis"
          description="Voici la liste des devis."
        />
        <CollapsibleFilter
          fields={fields} // this is an exemple
          onSearch={(values) => {
            setFilters(values);
            toast.success("Search submitted: " + JSON.stringify(values));
          }}
          onReset={() => setFilters({})}
        />
        <ExcelDownloadButton
          data={devis}
          filename={buildExcelFilename(filters, fields)}
        ></ExcelDownloadButton>

        <DevisTable
          // refreshKey={refreshKey}
          // onRefresh={refresh}
          devis={devis}
          loading={isLoading || isFetching}
        />
      </div>
    </div>
  );
}

export default DevisList;
