import type { PaginatedResponse } from "@/conf/api/Response";
import type { Planning } from "../schema/planningSchema";
import axiosInstance from "@/conf/axios";

export interface PlanningParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}
export async function fetchPlanning(
  params: PlanningParams = {},
  page = 1,
): Promise<PaginatedResponse<Planning>> {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  const response = await axiosInstance.get<PaginatedResponse<Planning>>(
    "/planning",
    {
      params: {
        page,
        ...cleanedParams,
      },
    },
  );

  return response.data;
}
