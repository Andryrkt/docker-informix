import type { ApiResponse, PaginatedResponse } from "@/conf/api/Response";
import axiosInstance from "@/conf/axios";
import type { Devis } from "../schema/devisSchema";
import { generateMockDevis } from "../schema/devisMock";

interface DevisParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
  [key: string]: any;
}
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function fetchDevis(
  params: DevisParams = {},
  page = 1,
  limit: number = 20,
): Promise<PaginatedResponse<Devis>> {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const mockData = generateMockDevis(50);
    return {
      data: mockData,
      total_pages: 1,
      current_page: 1,
      resultat: mockData.length,
    };
  }

  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  const response = await axiosInstance.get<PaginatedResponse<Devis>>("/devis", {
    params: {
      page,
      limit,
      ...cleanedParams,
    },
  });

  return response.data;
}

// STATUT_DEVIS

// Types
export interface StatutDevis {
  libelle: string; // no id – just a label
}

export type StatutDevisOption = {
  label: string;
  value: string;
};

// ------------------------------------------------------------------
// Mock data – typical quote life‑cycle statuses
// ------------------------------------------------------------------
const statutsDevisMock: StatutDevis[] = [
  // ---- Initial / draft ----
  { libelle: "Brouillon" },
  { libelle: "En cours de rédaction" },

  // ---- Sent to client ----
  { libelle: "Envoyé" },
  { libelle: "En attente de signature" },

  // ---- Client feedback ----
  { libelle: "En négociation" },
  { libelle: "Accepté" },
  { libelle: "Refusé" },
  { libelle: "Contre-proposition" },

  // ---- Internal validation ----
  { libelle: "À valider" },
  { libelle: "En validation" },
  { libelle: "Validé" },
  { libelle: "Rejeté" },

  // ---- Converted to order ----
  { libelle: "Transformé en commande" },
  { libelle: "Commande en cours" },

  // ---- Final / archive ----
  { libelle: "Clôturé" },
  { libelle: "Annulé" },
  { libelle: "Archivé" },
];

// ------------------------------------------------------------------
// Mapper – label and value both use libelle
// ------------------------------------------------------------------
const mapStatutDevisToOption = (statut: StatutDevis): StatutDevisOption => ({
  label: statut.libelle,
  value: statut.libelle,
});

// ------------------------------------------------------------------
// Fetch function – returns SelectOption[]
// ------------------------------------------------------------------
export const getStatutsDevis = async (): Promise<StatutDevisOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200)); // simulate network
    return statutsDevisMock.map(mapStatutDevisToOption);
  }

  // Real API call – adjust endpoint to your backend
  const { data } = await axiosInstance.get<StatutDevis[]>("/devis/statuts");
  return data.map(mapStatutDevisToOption);
};

export const submitRelanceDevis = async (params: {
  numeroDevis: string;
  dateRelance: string;
}) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 8000)); // simulate network
    return { success: true, message: "Relance enregistrée (mock)" };
  }
  const { data } = await axiosInstance.post("/devis/relance", params);
  return data;
};

export const updateStopProgression = async (params: {
  numeroDevis: string;
  stop: boolean;
}) => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      data: {
        numeroDevis: params.numeroDevis,
        stopProgressionGlobal: params.stop ? "STOP" : null,
      },
    };
  }
  const { data } = await axiosInstance.put(
    `/devis-stop-progression/${params.numeroDevis}/stop`,
    { stop: params.stop },
  );
  return data;
};

export interface CheckDevisPayload {
  document: string;
  numeroDevis?: string;
}

export interface CheckDevisResponse {
  allowed: boolean;
  message?: string;
  data?: any;
}

export const checkDevisSubmission = async (
  payload: CheckDevisPayload,
): Promise<ApiResponse<CheckDevisResponse>> => {
  if (USE_MOCK) {
    // Use the mock you provided
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            allowed: true,
            message: "Mock: submission allowed",
            data: null,
          },
          status: 200,
          success: true,
        });
      }, 500);
    });
  }
  const { data } = await axiosInstance.post<ApiResponse<CheckDevisResponse>>(
    "/devis/check-submission",
    payload,
  );
  return data;
};
