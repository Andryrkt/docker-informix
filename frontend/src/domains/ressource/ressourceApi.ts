import axiosInstance from "@/conf/axios";
import type { Ressource, RessourceOption } from "./ressourceSchema";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

export const ressourcesMock: Ressource[] = [
  { id: "000000", nom: "RAKOTOSOA" },
  { id: "000001", nom: "ANDRIAMANANGA" },
  { id: "000002", nom: "RAVAOSON" },
  { id: "000003", nom: "RAZAFINDRAMBOA" },
  { id: "000004", nom: "RANDRIANARISOA" },
];

export const getRessources = async (): Promise<RessourceOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return ressourcesMock.map((ressource) => ({
      label: `${ressource.id} - ${ressource.nom}`,
      value: String(ressource.id),
    }));
  }

  const { data } = await axiosInstance.get<Ressource[]>("/dit/ressources");

  return data.map((ressource) => ({
    label: `${ressource.id} - ${ressource.nom}`,
    value: ressource.id,
  }));
};
