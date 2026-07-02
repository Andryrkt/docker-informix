import { useMutation } from "@tanstack/react-query";
import ValidationAtelierForm from "../components/ValidationAtelierForm";
import { formatErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import { soumettreVerificationPrix } from "../api/verificationOuValidation";

function ValidationAtelierSoumission() {
  const mutation = useMutation({
    mutationFn: soumettreVerificationPrix,

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
          <ValidationAtelierForm mutation={mutation}></ValidationAtelierForm>
        </div>
      </div>
    </div>
  );
}

export default ValidationAtelierSoumission;
