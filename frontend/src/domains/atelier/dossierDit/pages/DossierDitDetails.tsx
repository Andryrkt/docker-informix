import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import DossierDitView from "../components/DossierDitView";
import { getDossierDit } from "../api/dossierDitapi";
import { dossierDitMock } from "../schema/dossierDitMock";

function DossierDitDetails() {
  const { id } = useParams<{ id: string }>();

  const {
    data: dossierDit,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["dossier-dit", id],
    queryFn: () => getDossierDit(id!),
    enabled: !!id,
    select: (response) => response.data,
  });

  // if (isPending) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       Chargement...
  //     </div>
  //   );
  // }

  // if (isError) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen text-red-500">
  //       {error instanceof Error ? error.message : "Une erreur est survenue."}
  //     </div>
  //   );
  // }

  // if (!dossierDit) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       Dossier DIT introuvable.
  //     </div>
  //   );
  // }

  return (
    <div className="px-4 w-full min-h-screen">
      <div className="w-full h-full space-y-6 overflow-x-auto">
        {/* <DossierDitView dossierDit={dossierDit} /> */}
        <DossierDitView dossierDit={dossierDitMock} />
      </div>
    </div>
  );
}

export default DossierDitDetails;
