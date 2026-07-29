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
  name: string;
  code: string;
}

export interface Agency {
  id: number;
  name: string;
  code: string;
  company: Company;
  services: Service[];
}

export const agenciesMock: Agency[] = [
  {
    id: 1,
    name: "Agence Antananarivo",
    code: "ANT",
    company: {
      id: 1,
      name: "Someca",
      code: "SMC",
    },
    services: [
      { id: 1, name: "Atelier", code: "ATL" },
      { id: 2, name: "Magasin", code: "MAG" },
      { id: 3, name: "Affaire", code: "AFF" },
    ],
  },
  {
    id: 2,
    name: "Agence Tamatave",
    code: "TMT",
    company: {
      id: 1,
      name: "Someca",
      code: "SMC",
    },
    services: [
      { id: 3, name: "Commercial", code: "COM" },
      { id: 4, name: "Maintenance", code: "MNT" },
    ],
  },
  {
    id: 3,
    name: "Agence Mahajanga",
    code: "MHJ",
    company: {
      id: 2,
      name: "Colas",
      code: "COL",
    },
    services: [{ id: 5, name: "Support", code: "SUP" }],
  },
];
export type AgenceOption = {
  label: string;
  value: string;
  services: SelectOption[];
};

export const getAgencesWithServices = async (): Promise<AgenceOption[]> => {
  if (USE_MOCK) {
    // await new Promise((resolve) => setTimeout(resolve, 000));
    return agenciesMock.map((agency) => ({
      label: agency.name,
      value: String(agency.id),
      services: agency.services.map((service) => ({
        id: service.id,
        code: service.code,
        label: service.name,
        value: String(service.id),
      })),
    }));
  }

  const { data } = await axiosInstance.get<Agency[]>("/dit/agences");

  return data.map((agency) => ({
    label: agency.name,
    value: String(agency.id),
    services: agency.services.map((service) => ({
      id: service.id,
      code: service.code,
      label: service.name,
      value: String(service.id),
    })),
  }));
};
