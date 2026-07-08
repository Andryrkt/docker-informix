import type { ApiResponse } from "@/conf/api/Response";
import axiosInstance from "@/conf/axios";
import { appendFiles } from "@/lib/utils";
import type { RapportInterventionPayload } from "../schema/rapportInterventionSchema";

export const soumettreRapportIntervention = async (
  payload: RapportInterventionPayload,
): Promise<ApiResponse<any>> => {
  const formData = new FormData();

  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (["pieceJointe"].includes(key)) return;

    formData.append(key, value as string);
  });

  // fichiers
  appendFiles("pieceJointe", payload.pieceJointe, formData);

  const { data } = await axiosInstance.post(
    "/soumettreRapportIntervention",
    formData,
  );

  return data;
};
