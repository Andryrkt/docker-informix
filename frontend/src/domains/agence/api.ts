import axiosInstance from "@/conf/axios";

// Type
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

export type AgenceOption = SelectOption & {
  services: SelectOption[];
};

/**
 * Inclut les services de chaque agence (nécessaire au champ "service
 * débiteur" du formulaire DIT, filtré par agence débiteur côté client sans
 * requête réseau supplémentaire à chaque changement — voir DitForm.tsx).
 */




export const getAgences = async (): Promise<AgenceOption[]> => {
  const { data } = await axiosInstance.get<
    {
      id: number;
      code: string;
      label: string;
      services: { id: number; code: string; label: string }[];
    }[]
  >("/dit/agences");
  return data.map((a) => ({
    ...a,
    label: `${a.code} ${a.label}`,
    value: String(a.id),
    services: a.services.map((s) => ({
      ...s,
      label: `${s.code} ${s.label}`,
      value: String(s.id),
    })),
  }));
};

export const getAgenceById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  const agences = await getAgences();
  return agences.find((a) => a.id === id);
};
