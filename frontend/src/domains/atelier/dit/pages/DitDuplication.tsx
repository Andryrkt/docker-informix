import { useNavigate, useParams } from "react-router-dom";
import { duplicateDit, fetchDitDetails } from "../api/ditApi";
import DitForm from "../components/DitForm";
import type { DitFormValues } from "../schema/ditSchema";
import { useQuery } from "@tanstack/react-query";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

function DitDuplication() {
  const { numeroDemandeIntervention } = useParams();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const { data: initialValues, isPending, error } = useQuery({
    queryKey: ["dit-details", numeroDemandeIntervention],
    queryFn: () => fetchDitDetails(numeroDemandeIntervention!),
    enabled: !!numeroDemandeIntervention,
    select: (dit): DitFormValues => ({
      objet: dit.objet ?? "Copie demande intervention",
      details: dit.details ?? "Duplication de la demande existante",
      typeDocument: dit.typeDocument ?? "TYPE_1",
      interneExterne: dit.interneExterne === "INTERNE" ? "INTERNE" : "EXTERNE",
      demandeDevis: dit.demandeDevis ?? "NON",
      livraisonPartielle: dit.livraisonPartielle ?? "NON",
      avisRecouvrement: dit.avisRecouvrement ?? "NON",

      agenceDebiteur: dit.agenceDebiteur ?? "",
      serviceDebiteur: dit.serviceDebiteur ?? "",
      agenceEmetteur: dit.agenceEmetteur ?? "",
      serviceEmmetteur: dit.serviceEmmetteur ?? "",

      worNiveauUrgence: dit.worNiveauUrgence ?? "NORMAL",
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
      confirmText: "dupliquer",
      cancelText: "Annuler",
      variant: "info",
      // icon: < className="w-5 h-5 text-red-500" />,
    });
    if (!confirmed) {
      return;
    }
    const dit = await duplicateDit(values);
    toast.success(`DIT ${dit.numeroDemandeIntervention} créée.`);
    navigate("/atelier/demande-intervention/dit-list");
  };

  if (isPending) {
    return <div className="p-4 text-center text-muted-foreground">Chargement...</div>;
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
