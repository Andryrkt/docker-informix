import type { ApiResponse, PaginatedResponse } from "@/conf/api/Response";
import axiosInstance from "@/conf/axios";
import type {
  DossierDit,
  DossierDitListItem,
} from "../schema/dossierDitSchema";

export interface dossierDitParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}
export const fetchDossierDitList = async (
  params: dossierDitParams = {},
  page = 1,
): Promise<PaginatedResponse<DossierDitListItem>> => {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  const response = await axiosInstance.get<
    PaginatedResponse<DossierDitListItem>
  >("/dossier-dit-liste", {
    params: {
      page,
      ...cleanedParams,
    },
  });

  return response.data;
};

export const fetchDossierDitDetails = async (
  id: string,
): Promise<ApiResponse<DossierDit[]>> => {
  const { data } = await axiosInstance.get(`/dossier-dit/${id}`);
  return data;
};
