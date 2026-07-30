import type { ApiResponse } from "@/conf/api/Response";
import axiosInstance from "@/conf/axios";
import { appendFiles } from "@/lib/utils";
import type { VerificationPrixDevisPayload } from "../schema/VerificationPrixDevisSchema";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const soumettreVerificationPrixDevisNeg = async (
  payload: VerificationPrixDevisPayload,
): Promise<ApiResponse<any>> => {
  if (USE_MOCK) {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Return a success mock response
    return {
      success: true,
      message: `Soumission vérification prix effectuée pour le devis ${payload.numeroDevis}`,
      data: {
        numeroDevis: payload.numeroDevis,
        validationPm: payload.validationPm,
        tacheValidateur: payload.tacheValidateur,
        files: {
          pieceJointeDevis: payload.pieceJointeDevis ? "fichier_reçu" : null,
          pieceJointeExcel: payload.pieceJointeExcel ? "fichier_reçu" : null,
          pieceJointes: payload.pieceJointes ? "fichiers_reçus" : null,
        },
      },
    };
  }

  // ---------- Real API call ----------
  const formData = new FormData();

  // Simple fields (skip file fields)
  Object.entries(payload).forEach(([key, value]) => {
    // Skip file fields – they are handled separately
    if (["pieceJointeDevis", "pieceJointeExcel", "pieceJointes"].includes(key))
      return;

    // Only append if value is defined and not a file
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  // Append files (using the correct field names from schema)
  appendFiles("pieceJointeDevis", payload.pieceJointeDevis, formData);
  appendFiles("pieceJointeExcel", payload.pieceJointeExcel, formData);
  appendFiles("pieceJointes", payload.pieceJointes, formData);

  const { data } = await axiosInstance.post(
    "/soumettre-verification-prix-devis-neg/VP",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return data;
};
