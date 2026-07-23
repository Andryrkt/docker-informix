import { type PaginatedResponse } from "@/conf/api/Response";
import type { OrdreReparationALivrer } from "../schema/ordreReparationALivrerSchema";
import { getPaginateMockOrdresALivrer } from "../schema/ordreReparationALivrerMock";
import axiosInstance from "@/conf/axios";
import type { OrdreReparationATraiter } from "../schema/ordreReparationATraiterSchema";
import { getPaginateMockOrdresATraiter } from "../schema/ordreReparationATraiterMock";

// Use environment variable to toggle real API vs mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // default to true for demo
interface OrdreReparationATraiterParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}
export const fetchOrdresReparationATraiter = async (
  params: OrdreReparationATraiterParams = {},
  page: number = 1,
  limit: number = 50,
): Promise<PaginatedResponse<OrdreReparationATraiter>> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // simulate network
    const paginated = getPaginateMockOrdresATraiter(page, limit);
    return paginated;
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  // Real API call (replace with your actual endpoint)
  const response = await await axiosInstance.get<
    PaginatedResponse<OrdreReparationATraiter>
  >("/or-a-traiter-liste", {
    params: {
      page,
      limit,
      ...cleanedParams,
    },
  });
  return response.data;
};
