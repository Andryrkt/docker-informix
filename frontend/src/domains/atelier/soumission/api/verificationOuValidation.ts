import type { ApiResponse } from "@/conf/api/Response";
import type {
  ValidationPayload,
  VerificationPayload,
} from "../schema/verificationOuValidationSchema";
import axiosInstance from "@/conf/axios";
import { appendFiles } from "@/lib/utils";

export const soumettreVerificationPrix = async (
  payload: VerificationPayload,
): Promise<ApiResponse<any>> => {
  const formData = new FormData();

  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (["pieceJointe"].includes(key)) return;

    formData.append(key, value as string);
  });

  // helper pour fichiers
  const appendFiles = (key: string, files: any) => {
    if (!files) return;

    const list = Array.isArray(files) ? files : [files];

    list.forEach((file) => {
      if (file instanceof File) {
        formData.append(`${key}[]`, file);
      }
    });
  };

  // fichiers
  appendFiles("pieceJointe", payload.pieceJointe);

  const { data } = await axiosInstance.post(
    "/soumettreVerificationPrix",
    formData,
  );

  return data;
};
export const soumettreValidationAtelier = async (
  payload: ValidationPayload,
): Promise<ApiResponse<any>> => {
  const formData = new FormData();

  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (["pieceJoint"].includes(key)) return;

    formData.append(key, value as string);
  });

  // fichiers
  appendFiles("pieceJointe", payload.pieceJointe, formData);

  const { data } = await axiosInstance.post(
    "/soumettreValidationAtelier",
    formData,
  );

  return data;
};
