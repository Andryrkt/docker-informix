import type { ApiResponse } from "@/conf/api/Response";

import axiosInstance from "@/conf/axios";
import { appendFiles } from "@/lib/utils";
import type { BonCommandeDevisPayload } from "../schema/bcDevisSchema";

export const soumettreBonCommandeDevis = async (
  payload: BonCommandeDevisPayload,
): Promise<ApiResponse<any>> => {
  const formData = new FormData();

  // Simple fields (skip file fields)
  Object.entries(payload).forEach(([key, value]) => {
    // Skip file fields – they are handled separately
    if (["pieceJointeBc", "pieceJointes"].includes(key)) return;

    // Only append if value is defined and not a file
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // fichiers
  // Append files (using the correct field names from schema)
  appendFiles("pieceJointeBc", payload.pieceJointeBc, formData);
  appendFiles("pieceJointes", payload.pieceJointes, formData);

  const { data } = await axiosInstance.post("/soumettre-bc-devis", formData);

  return data;
};
