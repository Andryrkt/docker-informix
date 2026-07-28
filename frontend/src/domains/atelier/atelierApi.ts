import axiosInstance from "@/conf/axios";
import type { Atelier, AtelierOption } from "./atelierSchema";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

export const ateliersMock: Atelier[] = [
  { id: "AT01", nom_atelier: "ATELIER MÉCANIQUE" },
  { id: "AT02", nom_atelier: "ATELIER SOUDURE" },
  { id: "AT03", nom_atelier: "ATELIER PEINTURE" },
  { id: "AT04", nom_atelier: "ATELIER ÉLECTRONIQUE" },
  { id: "AT05", nom_atelier: "ATELIER MONTAGE" },
];

export const getAteliers = async (): Promise<AtelierOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return ateliersMock.map((atelier) => ({
      label: atelier.nom_atelier,
      value: atelier.id,
    }));
  }

  const { data } = await axiosInstance.get<Atelier[]>("/dit/list-ateliers");

  return data.map((atelier) => ({
    label: atelier.nom_atelier,
    value: atelier.id,
  }));
};
