import { useMutation } from "@tanstack/react-query";
import { formatErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import RapportInterventionForm from "../components/RapportInterventionForm";
import { soumettreRapportIntervention } from "../api/rapportInterventionApi";

function RapportInterventionSoumission() {
  const mutation = useMutation({
    mutationFn: soumettreRapportIntervention,

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

  return (
    <div className="p-4 w-full min-h-screen ">
      <div className=" w-full h-full space-y-6 overflow-x-auto">
        <div>
          <RapportInterventionForm
            mutation={mutation}
          ></RapportInterventionForm>
        </div>
      </div>
    </div>
  );
}

export default RapportInterventionSoumission;
