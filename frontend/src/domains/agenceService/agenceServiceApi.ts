import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true; // default to true for demo

// Types
export type SelectOption = {
  id: number;
  code?: string;
  label: string;
  value: string;
};

export interface Company {
  id: number;
  name: string;
  code: string;
}

export interface Service {
  id: number;
  label: string;
  code: string;
}

export interface Agency {
  id: number;
  label: string;
  code: string;
  company: Company;
  services: Service[];
}

export const agenciesMock: Agency[] = [
  {
    id: 1,
    label: "Agence Antananarivo",
    code: "ANT",
    company: {
      id: 1,
      name: "Someca",
      code: "SMC",
    },
    services: [
      { id: 1, label: "Atelier", code: "ATL" },
      { id: 2, label: "Magasin", code: "MAG" },
      { id: 3, label: "Affaire", code: "AFF" },
    ],
  },
  {
    id: 2,
    label: "Agence Tamatave",
    code: "TMT",
    company: {
      id: 1,
      name: "Someca",
      code: "SMC",
    },
    services: [
      { id: 3, label: "Commercial", code: "COM" },
      { id: 4, label: "Maintenance", code: "MNT" },
    ],
  },
  {
    id: 3,
    label: "Agence Mahajanga",
    code: "MHJ",
    company: {
      id: 2,
      name: "Colas",
      code: "COL",
    },
    services: [{ id: 5, label: "Support", code: "SUP" }],
  },
];

export type AgenceOption = {
  label: string;
  code?: string;
  value: string;
  services: SelectOption[];
};

export const getAgencesWithServices = async (): Promise<AgenceOption[]> => {
  const { data } = await axiosInstance.get<Agency[]>("/dit/agences");
  console.log(data);
  return data.map((agency) => ({
    label: agency.label,
    code: agency.code,
    value: String(agency.id),
    services: agency.services.map((service) => ({
      id: service.id,
      code: service.code,
      label: service.label,
      value: String(service.id),
    })),
  }));
};
