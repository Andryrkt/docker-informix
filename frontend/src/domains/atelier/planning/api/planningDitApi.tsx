import type { PaginatedResponse } from "@/conf/api/Response";
import type { ditParams } from "../../dit/api/ditApi";
import type { Dit } from "../../dit/schema/ditSchema";
import axiosInstance from "@/conf/axios";

export async function fetchPlanningDits(
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
