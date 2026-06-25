import { duplucateDit } from "../api/ditApi";
import DitForm from "../components/DitForm";
import type { DitFormValues } from "../schema/ditSchema";

function DitDuplication() {
  const initialValues: DitFormValues = {
    object: "Copie demande intervention",
    details: "Duplication de la demande existante",

    typeDocument: "TYPE_1",
    interneExterne: "INTERNE",
    demandeDevis: "NON",
    livraisonPartielle: "NON",
    avisRecouvrement: "NON",

    agenceDebiteur: "AG001",
    serviceDebiteur: "SD001",
    agenceEmetteur: "1",
    serviceEmmetteur: "2",

    worNiveauUrgence: "NORMAL",
    datePrevue: "2026-06-24",

    typeReparation: "STANDARD",
    reparationPar: "TECH",

    numClient: "12345",
    telephoneClient: "0340000000",
    nomClient: "John Doe",
    emailClient: "john@mail.com",

    pieceJoint: [],
    pieceJoint1: [],
    pieceJoint2: [],

    idMateriel: "10",
    numParc: "P-001",
    numSerie: "S-999",
    categorieDemande: "",
    clientSousContrat: "",
  };

  const handleSubmit = async (data: DitFormValues) => {
    await duplucateDit(data);
  };

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
