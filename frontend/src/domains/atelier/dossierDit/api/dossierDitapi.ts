import type { ApiResponse, PaginatedResponse } from "@/conf/api/Response";
import axiosInstance from "@/conf/axios";
import type {
  DossierDit,
  DossierDitListItem,
} from "../schema/dossierDitSchema";
import { mockDossierDitList } from "../schema/dossierDitMock";

const mockDelay = (ms = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface dossierDitParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // default to true for demo

export const fetchDossierDitList = async (
  params: dossierDitParams = {},
  page = 1,
): Promise<PaginatedResponse<DossierDitListItem>> => {
  if (USE_MOCK) {
    await mockDelay(10);

    // Apply filters (if needed)
    let filtered = [...mockDossierDitList];
    // Example: if you had codeSociete on list items, you'd filter here

    const limit = params.limit || 10;
    const skip = params.skip ?? (page - 1) * limit;
    const paginatedItems = filtered.slice(skip, skip + limit);
    const total = filtered.length;

    return {
      data: paginatedItems,
      current_page: page,
      total_pages: Math.ceil(total / limit),
      resultat: total, // total count of items
    };
  }

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
