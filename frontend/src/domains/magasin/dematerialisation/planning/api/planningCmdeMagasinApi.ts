import type { PaginatedResponse } from "@/conf/api/Response";
import type { PlanningCmdeMagasin } from "../schema/planningCmdeMagasinSchema";
import axiosInstance from "@/conf/axios";
import { fetchPlanningCmdeMagasinMock } from "../schema/planningCmdeMagasinMock";

export interface PlanningCmdeMagasinParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // default to true for demo

export async function fetchPlanningCmdeMagasin(
  params: PlanningCmdeMagasinParams = {},
  page = 1,
  perPage: number = 10,
): Promise<PaginatedResponse<PlanningCmdeMagasin>> {
  if (USE_MOCK) {
    return fetchPlanningCmdeMagasinMock(params, page, perPage) as any;
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  const response = await axiosInstance.get<
    PaginatedResponse<PlanningCmdeMagasin>
  >("/planning-cmde-magasin", {
    params: {
      page,
      ...cleanedParams,
    },
  });

  return response.data;
}



