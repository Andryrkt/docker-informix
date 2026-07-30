import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DitView from "../components/DitView";
import { searchMateriels } from "@/domains/materiel/api/materielApi";
import { fetchDitDetails } from "../api/ditApi";

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

  // Récupère uniquement le matériel lié à la DIT (par son ID), sans charger toute la liste.
  const { data: materielResults = [] } = useQuery({
    queryKey: ["materiel-by-id", dit?.idMateriel],
    queryFn: () => searchMateriels(String(dit!.idMateriel)),
    enabled: !!dit?.idMateriel,
  });

  const materiel =
    materielResults.find((m) => m.idMateriel === String(dit?.idMateriel)) ??
    null;

  if (isPending) {
    return (
      <div className="p-4 text-center text-muted-foreground">Chargement...</div>
    );
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
