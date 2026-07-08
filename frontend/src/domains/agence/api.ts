import axiosInstance from "@/conf/axios";

// Type
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

export const getAgences = async (): Promise<SelectOption[]> => {
  const { data } = await axiosInstance.get<{ id: number; code: string; label: string }[]>(
    "/dit/agences",
  );
  return data.map((a) => ({ ...a, value: String(a.id) }));
};

export const getAgenceById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  const agences = await getAgences();
  return agences.find((a) => a.id === id);
};
