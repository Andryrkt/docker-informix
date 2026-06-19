import type { PaginatedResponse } from "@/conf/api/PaginatedResponse";
import axiosInstance from "@/conf/axios";
import axios from "axios";

export interface Devis {
  DATE_CDE_BRUTE: string;
  STATUT_DW: string | null;
  STATUT_BC: string | null;
  NUMERO_DEVIS: string;
  DATE_CREATION: string;
  EMETTEUR: string;
  CLIENT: string;
  REFERENCE_CLIENT: string;
  MONTANT_DEVIS: string;
  DATE_ENVOYE_DEVIS_AU_CLIENT: string | null;
  STOP_PROGRESSION_GLOBAL: string | null;
  MOTIF_STOP_GLOBAL: string | null;
  STATUT_RELANCE_1: string | null;
  STATUT_RELANCE_2: string | null;
  STATUT_RELANCE_3: string | null;
  POSITION_IPS: string;
  UTILISATEUR_CREATEUR_DEVIS: string;
  SOUMIS_PAR: string | null;
  DEVISE: string;
  CONSTRUCTEUR: string;
}

export interface DevisParams {
  codeSociete?: string;
  sucNeg?: string;
  skip?: number;
  limit?: number;
}

export const fetchDevis1 = async (
  params: DevisParams = {},
): Promise<Devis[]> => {
  const response = await axiosInstance.get<Devis[]>("/devis", { params });
  return response.data;
};

export async function fetchDevis(
  params: DevisParams = {},
  page = 1,
): Promise<PaginatedResponse<Devis>> {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(([_, val]) => val && val !== "all"),
  );
  const response = await axiosInstance.get<PaginatedResponse<Devis>>("/devis", {
    params: {
      page,
      ...cleanedParams,
    },
  });

  return response.data;
}
