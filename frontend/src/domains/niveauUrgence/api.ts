// Type
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

// Mock
const mockNiveauUrgence: SelectOption[] = [
  {
    id: 1,
    code: "P1",
    label: "P1 - Critique",
    value: "P1",
  },
  {
    id: 2,
    code: "P2",
    label: "P2 - Très élevée",
    value: "P2",
  },
  {
    id: 3,
    code: "P3",
    label: "P3 - Élevée",
    value: "P3",
  },
  {
    id: 4,
    code: "P4",
    label: "P4 - Normale",
    value: "P4",
  },
  {
    id: 5,
    code: "P5",
    label: "P5 - Faible",
    value: "P5",
  },
];

// Queries
export const getNiveauUrgence = async (): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockNiveauUrgence), 400);
  });
};

export const getNiveauUrgenceById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(mockNiveauUrgence.find((item) => item.id === id)),
      300,
    );
  });
};

export const getNiveauUrgenceByCode = async (
  code: string,
): Promise<SelectOption | undefined> => {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(mockNiveauUrgence.find((item) => item.code === code)),
      300,
    );
  });
};
