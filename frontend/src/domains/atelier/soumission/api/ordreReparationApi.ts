import type { ApiResponse } from "@/conf/api/Response";

import axiosInstance from "@/conf/axios";
import type { BonCommandePayload } from "../schema/BonCommandeSchema";
import { appendFiles } from "@/lib/utils";

export const soumettreOrdreReparation = async (
  payload: BonCommandePayload,
): Promise<ApiResponse<any>> => {
  const formData = new FormData();

  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (
      ["pieceJointe1", "pieceJointe2", "pieceJointe3", "pieceJointe4"].includes(
        key,
      )
    )
      return;

    formData.append(key, value as string);
  });

  // fichiers
  appendFiles("pieceJointe1", payload.pieceJointe, formData);
  appendFiles("pieceJointe2", payload.pieceJointe, formData);
  appendFiles("pieceJointe3", payload.pieceJointe, formData);
  appendFiles("pieceJointe4", payload.pieceJointe, formData);

  const { data } = await axiosInstance.post("/soumettreBonCommande", formData);

  return data;
};
