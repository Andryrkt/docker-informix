// src/domains/niveauUrgence/niveauUrgenceApi.ts
import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

// Type
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

// Mock data with P1 to P5 priorities
const niveauxUrgenceMock: { code: string; label: string }[] = [
  { code: "P1", label: "P1" },
  { code: "P2", label: "P2" },
  { code: "P3", label: "P3" },
  { code: "P4", label: "P4" },
  { code: "P5", label: "P5" },
];

export const getNiveauUrgences = async (): Promise<SelectOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return niveauxUrgenceMock.map((item, index) => ({
      id: index + 1,
      code: item.code,
      label: item.label,
      value: item.code, // "P1", "P2", ...
    }));
  }

  const { data } = await axiosInstance.get<{ code: string; label: string }[]>(
    "/dit/niveaux-urgence",
  );
  return data.map((item, index) => ({
    id: index + 1,
    code: item.code,
    label: item.label,
    value: item.code,
  }));
};

export const getNiveauUrgenceById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  const niveaux = await getNiveauUrgences();
  return niveaux.find((item) => item.id === id);
};

export const getNiveauUrgenceByCode = async (
  code: string,
): Promise<SelectOption | undefined> => {
  const niveaux = await getNiveauUrgences();
  return niveaux.find((item) => item.code === code);
};
