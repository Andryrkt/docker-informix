import axiosInstance from "@/conf/axios";

export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

async function fetchServices(agenceId?: number): Promise<SelectOption[]> {
  const { data } = await axiosInstance.get<{ id: number; code: string; label: string }[]>(
    "/dit/services",
    { params: agenceId ? { agenceId } : {} },
  );
  return data.map((s) => ({ ...s, value: String(s.id) }));
}

export const getServicesDebiteur = async (): Promise<SelectOption[]> => fetchServices();

export const getServiceDebiteurByAgence = async (
  agenceId: number,
): Promise<SelectOption[]> => fetchServices(agenceId);

// Emetteur
const mockServicesEmetteur: SelectOption[] = [
  { id: 10, code: "SE001", label: "Commercial", value: "SE001" },
  { id: 11, code: "SE002", label: "Logistique", value: "SE002" },
  { id: 12, code: "SE003", label: "Facturation", value: "SE003" },
];

export const getServicesEmetteur = async (): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockServicesEmetteur), 500);
  });
};

export const getServiceEmetteurByAgence = async (
  agenceId: number,
): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    const filtered = mockServicesEmetteur.filter(
      (_, i) => i % (agenceId + 1) !== 0,
    );

    setTimeout(() => resolve(filtered), 400);
  });
};
