export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

// Debiteur
const mockServicesDebiteur: SelectOption[] = [
  { id: 1, code: "SD001", label: "Comptabilité", value: "SD001" },
  { id: 2, code: "SD002", label: "Recouvrement", value: "SD002" },
  { id: 3, code: "SD003", label: "Audit interne", value: "SD003" },
];

export const getServicesDebiteur = async (): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockServicesDebiteur), 500);
  });
};

export const getServiceDebiteurByAgence = async (
  agenceId: number,
): Promise<SelectOption[]> => {
  return new Promise((resolve) => {
    const filtered = mockServicesDebiteur.filter((_, i) => i % agenceId !== 0);

    setTimeout(() => resolve(filtered), 400);
  });
};

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
