import axiosInstance from "@/conf/axios";
import type { SupportFormValues } from "../schema/demandeSupportSchema";

export interface SupportResponse {
  id: string;
  object: string;
  details: string;
  agenceDebiteur: string;
  serviceDebiteur: string;
  agenceEmetteur: string;
  serviceEmmetteur: string;
  categorie: string;
  dateFinSouhaite: string;
  parcInformatique: string;
  codeSociete: string;
  pieceJointes?: string[];
}
export const getSupports = async (): Promise<SupportResponse[]> => {
  const { data } = await axiosInstance.get("/supports");
  return data;
};
export const getSupport = async (id: string): Promise<SupportResponse> => {
  const { data } = await axiosInstance.get(`/supports/${id}`);
  return data;
};

export const createSupport = async (
  payload: SupportFormValues,
): Promise<SupportResponse> => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "pieceJointes") return;

    formData.append(key, value as string);
  });

  if (payload.pieceJointes) {
    const files = Array.isArray(payload.pieceJointes)
      ? payload.pieceJointes
      : [payload.pieceJointes];

    files.forEach((file) => {
      if (file instanceof File) {
        formData.append("pieceJointes[]", file);
      }
    });
  }

  const { data } = await axiosInstance.post("/supports", formData);

  return data;
};
