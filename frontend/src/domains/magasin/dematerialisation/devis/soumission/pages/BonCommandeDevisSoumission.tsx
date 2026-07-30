import { useMutation } from "@tanstack/react-query";
import { formatErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import BonCommandeDevisForm from "../components/BonCommandeDevisForm";
import { soumettreBonCommandeDevis } from "../api/bonCommandeDevisNegApi";
import type { LineItem } from "../../schema/devisSchema";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // default to true for demo

const generateMockLines = (count = 3): LineItem[] => {
  const constructeurs = ["Siemens", "Schneider", "ABB", "GE", "Omron"];
  const refs = ["REF-001", "REF-002", "REF-003", "REF-004", "REF-005"];
  const designations = [
    "Automate programmable",
    "Disjoncteur",
    "Contacteur",
    "Relais thermique",
    "Variateur de vitesse",
  ];

  return Array.from({ length: count }, (_, i) => ({
    numeroLigne: (i + 1) * 10, // 10, 20, 30, ...
    constructeur: constructeurs[i % constructeurs.length],
    ref: refs[i % refs.length],
    designation: designations[i % designations.length],
    qte: Math.floor(Math.random() * 10) + 1,
    prixHt: parseFloat((Math.random() * 500 + 50).toFixed(2)),
    montantNet: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
    remise1: parseFloat((Math.random() * 10).toFixed(2)),
    remise2: parseFloat((Math.random() * 5).toFixed(2)),
    ras: Math.random() > 0.7,
    qteModifier: Math.random() < 0.7,
    nouvelleQte: undefined,
    supprimer: Math.random() < 0.7,
  }));
};

function BonCommandeDevisSoumission() {
  const mutation = useMutation({
    mutationFn: soumettreBonCommandeDevis,
    onSuccess: () => {
      toast.success("Enregistrement effectué avec succès.", {
        position: "top-center",
        duration: 3000,
      });
    },

    onError: async (error) => {
      toast.error(
        await formatErrorMessage(error, "Échec de l'enregistrement."),
        {
          position: "top-center",
          duration: 3000,
        },
      );
    },
  });
  const initialLines = USE_MOCK ? generateMockLines(40) : [];
  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <div>
          <BonCommandeDevisForm
            mutation={mutation}
            initialLines={initialLines}
          ></BonCommandeDevisForm>
        </div>
      </div>
    </div>
  );
}

export default BonCommandeDevisSoumission;
