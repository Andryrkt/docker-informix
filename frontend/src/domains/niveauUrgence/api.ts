import axiosInstance from "@/conf/axios";

// Type
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

export const getNiveauUrgence = async (): Promise<SelectOption[]> => {
  const { data } = await axiosInstance.get<{ code: string; label: string }[]>(
    "/dit/niveaux-urgence",
  );
  return data.map((n, i) => ({ id: i + 1, code: n.code, label: n.label, value: n.code }));
};

export const getNiveauUrgenceById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  const niveaux = await getNiveauUrgence();
  return niveaux.find((item) => item.id === id);
};

export const getNiveauUrgenceByCode = async (
  code: string,
): Promise<SelectOption | undefined> => {
  const niveaux = await getNiveauUrgence();
  return niveaux.find((item) => item.code === code);
};
