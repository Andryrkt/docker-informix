// Type
export type SelectOption = {
  id: number;
  label: string;
  value: string;
  code?: string;
};

export const mockCategories = [
  { id: 1, value: "incident_technique", label: "Incident technique" },
  { id: 2, value: "demande_service", label: "Demande de service" },
  { id: 3, value: "maintenance", label: "Maintenance" },
];
export const getCategories = async (): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockCategories), 400);
  });
};
