import { checkDitSubmission } from "@/domains/atelier/dit/api/ditApi";
import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import { toast } from "sonner";

export const verificationDitLoader = (documentType: string) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const res = await checkDitSubmission({
      document: documentType,
      numeroDemandeIntervention: params.numeroDemandeIntervention!,
    });

    if (!res.data.allowed) {
      toast.error(
        `${res.data.message ?? "Vous ne pouvez pas soumettre ce document"} ${documentType}`,
      );
      return redirect("/atelier/demande-intervention/dit-list");
    }

    return res.data;
  };
};
