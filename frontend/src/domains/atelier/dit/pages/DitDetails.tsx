import { useParams } from "react-router-dom";
import { fetchDitDetails } from "../api/ditApi";
import { useQuery } from "@tanstack/react-query";
import DitView from "../components/DitView";
import { getMateriels } from "@/domains/materiel/api/materielApi";

function DitDetails() {
  const { numeroDemandeIntervention } = useParams();

  const {
    data: dit,
    isPending,
    error,
  } = useQuery({
    queryKey: ["dit-details", numeroDemandeIntervention],
    queryFn: () => fetchDitDetails(numeroDemandeIntervention!),
    enabled: !!numeroDemandeIntervention,
  });

  const { data: materiels = [] } = useQuery({
    queryKey: ["materiels"],
    queryFn: () => getMateriels(),
    enabled: !!dit,
  });

  const materiel = materiels.find((m) => m.idMateriel === dit?.idMateriel) ?? null;

  if (isPending) {
    return <div className="p-4 text-center text-muted-foreground">Chargement...</div>;
  }

  if (error || !dit) {
    return (
      <div className="p-4 text-center text-destructive">
        Impossible de charger cette demande d'intervention.
      </div>
    );
  }

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <div>
          <DitView dit={dit} materiel={materiel}></DitView>
        </div>
      </div>
    </div>
  );
}

export default DitDetails;
