import { useMutation } from "@tanstack/react-query";
import { soumettreVerificationPrixDevisNeg } from "../api/verificationPrixDevisNegApi";
import { formatErrorMessage } from "@/lib/utils";
import { toast } from "sonner";
import VerificationPrixDevisForm from "../components/VerificationPrixDevisForm";

function VerificationPrixDevisSoumission() {
  const mutation = useMutation({
    mutationFn: soumettreVerificationPrixDevisNeg,

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
          <VerificationPrixDevisForm
            mutation={mutation}
          ></VerificationPrixDevisForm>
        </div>
      </div>
    </div>
  );
}

export default VerificationPrixDevisSoumission;
