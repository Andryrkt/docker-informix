import type { ApiResponse, PaginatedResponse } from "@/conf/api/Response";
import type { Dit, DitFormValues } from "../schema/ditSchema";
import axiosInstance from "@/conf/axios";

export interface ditParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}
export async function fetchDit(
  params: ditParams = {},
  page = 1,
): Promise<PaginatedResponse<Dit>> {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  const response = await axiosInstance.get<PaginatedResponse<Dit>>(
    "/demande-intervention/liste",
    {
      params: {
        page,
        ...cleanedParams,
      },
    },
  );

  return response.data;
}
export const createDit = async (
  payload: DitFormValues,
): Promise<ApiResponse<Dit>> => {
  const formData = new FormData();

  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (["pieceJoint", "pieceJoint1", "pieceJoint2"].includes(key)) return;

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
  appendFiles("pieceJoint", payload.pieceJoint);
  appendFiles("pieceJoint1", payload.pieceJoint1);
  appendFiles("pieceJoint2", payload.pieceJoint2);

  const { data } = await axiosInstance.post("/createDIT", formData);

  return data;
};
export const duplucateDit = async (
  payload: DitFormValues,
): Promise<ApiResponse<Dit>> => {
  const formData = new FormData();

  // champs simples
  Object.entries(payload).forEach(([key, value]) => {
    if (["pieceJoint", "pieceJoint1", "pieceJoint2"].includes(key)) return;

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
  appendFiles("pieceJoint", payload.pieceJoint);
  appendFiles("pieceJoint1", payload.pieceJoint1);
  appendFiles("pieceJoint2", payload.pieceJoint2);

  const { data } = await axiosInstance.post("/createDIT", formData);

  return data;
};
