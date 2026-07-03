import type { ApiResponse } from "@/conf/api/Response";
import axiosInstance from "@/conf/axios";
import type { DossierDit } from "../schema/dossierDitSchema";

export const getDossierDit = async (
  id: string,
): Promise<ApiResponse<DossierDit>> => {
  const { data } = await axiosInstance.get(`/dossier-dit/${id}`);
  return data;
};
