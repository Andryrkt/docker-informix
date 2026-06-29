export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};
const mockReparationTypes: SelectOption[] = [
  {
    id: 1,
    code: "STANDARD",
    label: "Standard",
    value: "STANDARD",
  },
  {
    id: 2,
    code: "URGENTE",
    label: "Urgente",
    value: "URGENTE",
  },
  {
    id: 3,
    code: "PREVENTIVE",
    label: "Préventive",
    value: "PREVENTIVE",
  },
  {
    id: 4,
    code: "CORRECTIVE",
    label: "Corrective",
    value: "CORRECTIVE",
  },
];
export const getReparationTypes = async (): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockReparationTypes), 400);
  });
};

export const getReparationTypeByCode = async (
  code: string,
): Promise<SelectOption | undefined> => {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(mockReparationTypes.find((t) => t.code === code)),
      300,
    );
  });
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

export const reparationOptions = {
  types: mockReparationTypes,
  realisePar: reparationRealiseParOptions,
};
