import type { ApiResponse } from "@/conf/api/Response";

import axiosInstance from "@/conf/axios";
import { appendFiles } from "@/lib/utils";
import type { FacturePayload } from "../schema/factureSchema";

export const soumettreFacture = async (
  payload: FacturePayload,
): Promise<ApiResponse<any>> => {
  const formData = new FormData();
  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (["pieceJointes"].includes(key)) return;
    formData.append(key, value as string);
  });

  // fichiers
  appendFiles("pieceJointes", payload.pieceJointes, formData);

  const { data } = await axiosInstance.post("/soumettreBonCommande", formData);

  return data;
};
