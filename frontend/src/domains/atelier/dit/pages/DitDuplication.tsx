import { useParams } from "react-router-dom";
import { duplicateDit, fetchDitDetails } from "../api/ditApi";
import DitForm from "../components/DitForm";
import type { DitFormValues } from "../schema/ditSchema";
import { useQuery } from "@tanstack/react-query";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

function DitDuplication() {
  const { numeroDemandeIntervention } = useParams();
  const confirm = useConfirm();

  const initialValues: DitFormValues = {
    object: "Copie demande intervention",
    details: "Duplication de la demande existante, ceci est un test",

    typeDocument: "Autres",
    categorieDemande: "AUTRES",
    // interneExterne: "INTERNE",
    interneExterne: "EXTERNE",
    demandeDevis: "NON",
    livraisonPartielle: "NON",
    avisRecouvrement: "NON",

    // agenceDebiteur: "AG001",
    // serviceDebiteur: "SD001",

    agenceEmetteur: "AG001",
    serviceEmmetteur: "SV001",

    worNiveauUrgence: "P1",
    datePrevue: "2026-06-24",

    typeReparation: "STANDARD",
    reparationPar: "ATE_TANA",

    numClient: "CL-1001",
    telephoneClient: "0340000000",
    nomClient: "Société HME SARL",
    emailClient: "contact@hme.mg",
    clientSousContrat: "NON",

    pieceJoint: [],
    pieceJoint1: [],
    pieceJoint2: [],

    idMateriel: "18837",
    numParc: "1234-HME149",
    numSerie: "S6X02021",
  };

  const { data, isPending, error } = useQuery({
    queryKey: ["dit-details", numeroDemandeIntervention],
    queryFn: () => fetchDitDetails(numeroDemandeIntervention!),
    enabled: !!numeroDemandeIntervention,
    select: (dit): DitFormValues => ({
      object: dit.object ?? "Copie demande intervention",
      details: dit.details ?? "Duplication de la demande existante",
      typeDocument: dit.typeDocument ?? "TYPE_1",
      interneExterne: dit.interneExterne ?? "EXTERNE",
      demandeDevis: dit.demandeDevis ?? "NON",
      livraisonPartielle: dit.livraisonPartielle ?? "NON",
      avisRecouvrement: dit.avisRecouvrement ?? "NON",

      agenceDebiteur: dit.agenceEmetteur ?? "",
      serviceDebiteur: dit.serviceEmmetteur ?? "",
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
      console.log("Action annulée.");
      return;
    }
    toast(JSON.stringify(values));
    console.log(values);
    // await duplicateDit(values);
  };

  // if (isPending) {
  //   return <div>Loading...</div>;
  // }

  // if (error || !data) {
  //   return <div>Unable to load DIT.</div>;
  // }

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
