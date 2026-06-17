// Type
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

// Mock
const mockAgences: SelectOption[] = [
  { id: 1, code: "AG001", label: "Agence 1", value: "AG001" },
  { id: 2, code: "AG002", label: "Agence 2", value: "AG002" },
  { id: 3, code: "AG003", label: "Agence 3", value: "AG003" },
];

// Query

export const getAgences = async (): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAgences), 400);
  });
};

export const getAgenceById = async (
  id: number,
): Promise<SelectOption | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockAgences.find((a) => a.id === id)), 300);
  });
};
