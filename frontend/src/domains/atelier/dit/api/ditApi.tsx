import type { ApiResponse, PaginatedResponse } from "@/conf/api/Response";
import type { Dit, DitFormValues } from "../schema/ditSchema";
import axiosInstance from "@/conf/axios";

export interface ditParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}

export async function fetchDits(
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


export async function fetchDitDetails(id: number | string): Promise<Dit> {
  const response = await axiosInstance.get<Dit>(
    `/demande-intervention/details/${id}`,
  );
  return response.data;
}

export interface DitLookupOption {
  code: string;
  label: string;
}

export async function fetchTypesDocument(): Promise<DitLookupOption[]> {
  const { data } = await axiosInstance.get<DitLookupOption[]>("/dit/types-document");
  return data;
}

export async function fetchCategoriesDemande(): Promise<DitLookupOption[]> {
  const { data } = await axiosInstance.get<DitLookupOption[]>("/dit/categories-demande");
  return data;
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

export const duplicateDit = async (
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
export interface CheckDitPayload {
  document: string;
  numeroDemandeIntervention?: string;
}

export interface CheckDitResponse {
  allowed: boolean;
  message?: string;
  data?: any;
}
// export const checkDitSubmission = async (
//   payload: CheckDitPayload,
// ): Promise<ApiResponse<CheckDitResponse>> => {
//   const { data } = await axiosInstance.post<ApiResponse<CheckDitResponse>>(
//     "/demande-intervention/check-submission",
//     payload,
//   );

//   return data;
// };

export const checkDitSubmission = async (
  payload: CheckDitPayload,
): Promise<ApiResponse<CheckDitResponse>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      return resolve({
        data: {
          allowed: true,
          message: "Mock: submission allowed",
          data: null,
        },
        status: 200,
        success: true,
      });
    }, 500);
  });
};
