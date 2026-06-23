import type { PaginatedResponse } from "@/conf/api/PaginatedResponse";
import type { Dit } from "../schema/ditSchema";
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
