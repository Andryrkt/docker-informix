// src/domains/constructeur/constructeurApi.ts
import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

// Type (can be imported from a shared file)
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

// Mock data – adapt to your actual data
const constructeursMock: { id: number; nom: string; code?: string }[] = [
  { id: 1, nom: "Airbus EXEMPLE", code: "AIR" },
  { id: 2, nom: "Boeing EXEMPLE", code: "BOE" },
  { id: 3, nom: "Dassault EXEMPLE", code: "DAS" },
  { id: 4, nom: "Embraer EXEMPLE", code: "EMB" },
  // Add more as needed
];

export const getConstructeurs = async (): Promise<SelectOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return constructeursMock.map((item) => ({
      id: item.id,
      label: item.nom,
      value: String(item.id), // or item.code if that's the identifier
    }));
  }

  // Real API call – adjust endpoint
  const { data } = await axiosInstance.get<
    { id: number; nom: string; code?: string }[]
  >(
    "/constructeurs", // or "/dit/constructeurs" depending on your backend
  );
  return data.map((item) => ({
    id: item.id,
    label: item.nom,
    value: String(item.id),
  }));
};

export const getConstructeurById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  const constructeurs = await getConstructeurs();
  return constructeurs.find((item) => item.id === id);
};
