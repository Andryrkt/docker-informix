// import PageHeaderWithAction from "@/layouts/PageHeaderWithAction";

import { useState } from "react";
import DevisTable from "../components/DevisTable";

function DevisList() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        {/* <PageHeaderWithAction
          icon={<Newspaper size={28} className="text-primary" />}
          title="Liste des articles back-office"
          description="Liste des articles pour le back-office."
          action={<ArticleFormDialog onCreated={refresh} />}
        /> */}

        <DevisTable refreshKey={refreshKey} onRefresh={refresh} />
      </div>
    </div>
  );
}

export default DevisList;
