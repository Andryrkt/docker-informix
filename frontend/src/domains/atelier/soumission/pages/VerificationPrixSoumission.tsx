import { useMutation } from "@tanstack/react-query";
import { soumettreVerificationPrix } from "../api/verificationOuValidation";
import VerificationPrixForm from "../components/VerificationPrixForm";
import { formatErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

function VerificationPrixSoumission() {
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
          <VerificationPrixForm mutation={mutation}></VerificationPrixForm>
        </div>
      </div>
    </div>
  );
}

export default VerificationPrixSoumission;
