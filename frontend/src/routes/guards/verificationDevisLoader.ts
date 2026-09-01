import { checkDevisSubmission } from "@/domains/magasin/dematerialisation/devis/api/devisApi";
import { redirect, type LoaderFunctionArgs } from "react-router-dom";
import { toast } from "sonner";

export const verificationDevisLoader = (documentType: string) => {
  return async ({ params }: LoaderFunctionArgs) => {
    const res = await checkDevisSubmission({
      document: documentType,
      numeroDevis: params.numeroDevis!,
    });

    if (!res.data.allowed) {
      toast.error(
        `${res.data.message ?? "Vous ne pouvez pas faire cela"} ${documentType}`,
      );
      return redirect("/magasin/dematerialisation/liste-devis-neg");
    }

    return res.data;
  };
};
