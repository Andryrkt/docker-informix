import axiosInstance from "@/conf/axios";

export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

export const getReparationTypes = async (): Promise<SelectOption[]> => {
  const { data } = await axiosInstance.get<{ code: string; label: string }[]>(
    "/dit/types-reparation",
  );
  return data.map((t, i) => ({ id: i + 1, code: t.code, label: t.label, value: t.code }));
};

export const getReparationTypeByCode = async (
  code: string,
): Promise<SelectOption | undefined> => {
  const types = await getReparationTypes();
  return types.find((t) => t.code === code);
};

// Reparation realisé par
export const reparationRealiseParOptions: SelectOption[] = [
  {
    id: 1,
    code: "ATE_TANA",
    label: "ATE TANA",
    value: "ATE_TANA",
  },
  {
    id: 2,
    code: "ATE_POL_TANA",
    label: "ATE POL TANA",
    value: "ATE_POL_TANA",
  },
  {
    id: 4,
    code: "ATE_STAR",
    label: "ATE STAR",
    value: "ATE_STAR",
  },
  {
    id: 5,
    code: "ATE_MAS",
    label: "ATE MAS",
    value: "ATE_MAS",
  },
  {
    id: 6,
    code: "ATE_TMV",
    label: "ATE TMV",
    value: "ATE_TMV",
  },
  {
    id: 7,
    code: "ATE_FTU",
    label: "ATE FTU",
    value: "ATE_FTU",
  },
];
