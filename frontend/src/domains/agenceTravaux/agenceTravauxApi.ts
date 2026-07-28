import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // default to true for demo
export interface AgenceTravaux {
  id: number;
  name: string;
  code: string;
}

export const agenciesMock: AgenceTravaux[] = [
  {
    id: 1,
    name: "Agence Antananarivo",
    code: "ANT",
  },
  {
    id: 2,
    name: "Agence Tamatave",
    code: "TMT",
  },
  {
    id: 3,
    name: "Agence Mahajanga",
    code: "MHJ",
  },
];

export type AgenceTravauxOption = {
  label: string;
  value: string;
};

export const getAgencesTravaux = async (): Promise<AgenceTravauxOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return agenciesMock.map((agenceTravaux) => ({
      label: agenceTravaux.name,
      value: String(agenceTravaux.id),
    }));
  }

  const { data } = await axiosInstance.get<AgenceTravaux[]>(
    "/dit/agences-travaux",
  );

  return data.map((agenceTravaux) => ({
    label: agenceTravaux.name,
    value: String(agenceTravaux.id),
  }));
};
