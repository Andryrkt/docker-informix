import type { ApiResponse, PaginatedResponse } from "@/conf/api/Response";
import axiosInstance from "@/conf/axios";
import type { DossierDit } from "../schema/dossierDitSchema";
import type { Dit } from "../../dit/schema/ditSchema";

export interface dossierDitParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}
export const fetchDossierDitDetails = async (
  id: string,
): Promise<ApiResponse<DossierDit>> => {
  const { data } = await axiosInstance.get(`/dossier-dit/${id}`);
  return data;
};
export const DossierDitList = async (
  id: string,
): Promise<ApiResponse<DossierDit>> => {
  const { data } = await axiosInstance.get(`/dossier-dit/${id}`);
  return data;
};


