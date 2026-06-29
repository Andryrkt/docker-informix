import { useParams } from "react-router-dom";
import { duplicateDit, fetchDitDetails } from "../api/ditApi";
import type { Dit, DitFormValues } from "../schema/ditSchema";
import { useQuery } from "@tanstack/react-query";
import { useConfirm } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";
import DitView from "../components/DitView";
import type { BilanFinancier } from "../components/atom/BilanFinanciereCard";
import type { Materiel } from "@/domains/materiel/schema/materielSchema";

function DitDetails() {
  const { numeroDemandeIntervention } = useParams();

  const mockDit: Dit = {
    objet: "Copie demande intervention",
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

    pieceJoint: [
      {
        nom: "devis_initial.pdf",
        url: "/files/devis_initial.pdf",
        type: "pdf",
      },
    ],
    pieceJoint1: [
      {
        nom: "photo_equipement.jpg",
        url: "/files/photo_equipement.jpg",
        type: "image",
      },
    ],
    pieceJoint2: [
      {
        nom: "schema_installation.png",
        url: "/files/schema_installation.png",
        type: "image",
      },
    ],

    idMateriel: "18837",
    numParc: "1234-HME149",
    numSerie: "S6X02021",
    id: 0,
    numeroDemandeIntervention: "DIT26068682",
    idStatutDemande: 0,
    statutDemande: "",
    reparationRealise: null,
    dateDemande: "2025-12-20",
    agenceDebiteur: "",
    serviceDebiteur: "",
    sectionAffectee: null,
    numeroDevisRattache: null,
    statutDevis: null,
    numeroOr: null,
    statutOr: null,
    montantOr: null,
    dateSoumissionOr: null,
    etatFacturation: null,
    ri: "",
    utilisateurDemandeur: "",
    nbrPj: 0,
    estAnnulable: false,
    estOrASoumi: false,
    quantiteDemanderOr: 0,
    quantiteReserverOr: 0,
    quantiteLivreeOr: 0,
    quantiteReliquatOr: 0,
    qteLivOr: 0,
    etatLivraison: "Non livré",
  };

  // Mock
  const mockBilanFinancier: BilanFinancier = {
    chiffreAffaire: 259391638.1,
    chargeEntretien: 80920998.58,
    chargeLocative: 0,
    resultatExploitation: 178470639.52,
    coutAcquisition: 0,
    amortissement: 0,
    vnc: 0,
  };

  const mockMateriel: Materiel = {
    idMateriel: "MAT-00921",
    constructeur: "Toyota",
    designation: "Véhicule utilitaire de service",
    km: 84500,
    numParc: "PARC-VEH-102",
    modele: "Hilux 2.4 D-4D",
    casier: "Parking-Depot-A",
    heures: 0,
    numSerie: "JT1234X9AB5678901",
  };

  const { data, isPending, error } = useQuery({
    queryKey: ["dit-details", numeroDemandeIntervention],
    queryFn: () => fetchDitDetails(numeroDemandeIntervention!),
    enabled: !!numeroDemandeIntervention,
    select: (dit): DitFormValues => ({
      objet: dit.objet ?? "Copie demande intervention",
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
          <DitView
            dit={mockDit}
            bilanFinancier={mockBilanFinancier}
            materiel={mockMateriel}
          ></DitView>
        </div>
      </div>
    </div>
  );
}

export default DitDetails;
