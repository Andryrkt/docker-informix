import PageHeader from "@/layout/components/PageHeader";
import React from "react";
import SupportForm from "../components/SupportForm";

function DemandeSupportIT() {
  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        {/* <PageHeader
          title="Demande de support IT"
          description="Vous pouvez faire une demande de support concernant l'intranet."
        /> */}
        <div>
          <SupportForm></SupportForm>
        </div>
      </div>
    </div>
  );
}

export default DemandeSupportIT;
