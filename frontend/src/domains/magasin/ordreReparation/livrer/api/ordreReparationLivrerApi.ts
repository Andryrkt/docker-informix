import { type PaginatedResponse } from "@/conf/api/Response";
import type { OrdreReparationALivrer } from "../schema/ordreReparationLivrerSchema";
import { getPaginatedMockOrders } from "../schema/ordreReparationLivrerMock";
import axiosInstance from "@/conf/axios";

// Use environment variable to toggle real API vs mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // default to true for demo
interface OrdreReparationALivrerParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}
export const fetchOrdresReparationLivrer = async (
  params: OrdreReparationALivrerParams = {},
  page: number = 1,
  limit: number = 50,
): Promise<PaginatedResponse<OrdreReparationALivrer>> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // simulate network
    const paginated = getPaginatedMockOrders(page, limit);
    return paginated;
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  // Real API call (replace with your actual endpoint)
  const response = await await axiosInstance.get<
    PaginatedResponse<OrdreReparationALivrer>
  >("/or-a-livrer-liste", {
    params: {
      page,
      limit,
      ...cleanedParams,
    },
  });
  return response.data;
};

// You could also add other API methods (create, update, delete)
