import type { ApiResponse } from "@/conf/api/Response";

import axiosInstance from "@/conf/axios";
import type { BonCommandePayload } from "../schema/BonCommandeSchema";
import { appendFiles } from "@/lib/utils";

export const soumettreBonCommande = async (
  payload: BonCommandePayload,
): Promise<ApiResponse<any>> => {
  const formData = new FormData();

  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (["pieceJointe"].includes(key)) return;

    formData.append(key, value as string);
  });

  // fichiers
  appendFiles("pieceJointe", payload.pieceJointe, formData);

  const { data } = await axiosInstance.post("/soumettreBonCommande", formData);

  return data;
};
