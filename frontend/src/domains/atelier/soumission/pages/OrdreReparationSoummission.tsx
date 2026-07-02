import { formatErrorMessage } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import OrdreReparationForm from "../components/OrdreReparationForm";
import { soumettreOrdreReparation } from "../api/ordreReparationApi";

function OrdreReparationSoummission() {
  const mutation = useMutation({
    mutationFn: soumettreOrdreReparation,

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
          <OrdreReparationForm mutation={mutation}></OrdreReparationForm>
        </div>
      </div>
    </div>
  );
}

export default OrdreReparationSoummission;
