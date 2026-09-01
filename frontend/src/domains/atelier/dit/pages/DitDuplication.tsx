import { useNavigate, useParams } from "react-router-dom";
import DitForm from "../components/DitForm";
import type { DitFormValues } from "../schema/ditSchema";
import { useQuery } from "@tanstack/react-query";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import { getDitDetails, duplicateDit } from "../api/ditApi";
import Swal from "sweetalert2";

function DitDuplication() {
  const { numeroDemandeIntervention } = useParams();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const {
    data: initialValues,
    isPending,
    error,
  } = useQuery({
    queryKey: ["dit-details", numeroDemandeIntervention],
    queryFn: () => getDitDetails(numeroDemandeIntervention!),
    enabled: !!numeroDemandeIntervention,
    select: (dit): DitFormValues => ({
      objet: dit.objet,
      details: dit.details,
      typeDocument: dit.typeDocument,
      interneExterne: dit.interneExterne === "INTERNE" ? "INTERNE" : "EXTERNE",
      demandeDevis: dit.demandeDevis ?? "NON",
      livraisonPartielle: dit.livraisonPartielle ?? "NON",
      avisRecouvrement: dit.avisRecouvrement ?? "NON",

      agenceDebiteur: dit.agenceDebiteur,
      serviceDebiteur: dit.serviceDebiteur,

      agenceEmetteur: dit.agenceEmetteur,
      serviceEmmetteur: dit.serviceEmmetteur,

      worNiveauUrgence: dit.worNiveauUrgence,
      datePrevue: dit.datePrevue ?? "",

      typeReparation: dit.typeReparation ?? "",
      reparationPar: dit.reparationPar ?? "",

      numClient: dit.numClient ?? "",
      telephoneClient: dit.telephoneClient ?? "",
      nomClient: dit.nomClient ?? "",
      emailClient: dit.emailClient ?? "",

      idMateriel: dit.idMateriel ?? "",
      numParc: dit.numParc ?? "",
      numSerie: dit.numSerie ?? "",
      categorieDemande: dit.categorieDemande ?? "",
      clientSousContrat: dit.clientSousContrat ?? "",

      // Never duplicate uploaded files
      pieceJoint: [],
      pieceJoint1: [],
      pieceJoint2: [],
    }),
  });

  const handleSubmit = async (values: DitFormValues) => {
    const confirmed = await confirm({
      title: "Dupliquer la demande?",
      description: "Cette action est définitive.",
      confirmText: "Dupliquer",
      cancelText: "Annuler",
      variant: "info",
      // icon: < className="w-5 h-5 text-red-500" />,
    });
    if (!confirmed) return;

    try {
      const response = await duplicateDit(values);
      await Swal.fire({
        title: "Succès !",
        text: response.message || "DIT créée avec succès !",
        icon: "success",
        confirmButtonColor: "#22c55e",
        confirmButtonText: "OK",
        timer: 3000,
        timerProgressBar: true,
      });

      // Optionnel : Rediriger ici après la fermeture de SweetAlert
      navigate("/atelier/demande-intervention/dit-list");
    } catch (error) {
      Swal.close(); // Fermer le loader
      await Swal.fire({
        title: "Erreur",
        text: error.message || "Une erreur est survenue lors de la création.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "OK",
      });
    }
  };

  if (isPending) {
    return (
      <div className="p-4 text-center text-muted-foreground">Chargement...</div>
    );
  }

  if (error || !initialValues) {
    return (
      <div className="p-4 text-center text-destructive">
        Impossible de charger la demande d'intervention à dupliquer.
      </div>
    );
  }

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <div>
          <DitForm
            mode="duplication"
            initialValues={initialValues}
            onSubmitDit={handleSubmit}
          ></DitForm>
        </div>
      </div>
    </div>
  );
}

export default DitDuplication;
