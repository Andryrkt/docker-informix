import axiosInstance from "@/conf/axios";
import type { Materiel } from "../schema/materielSchema";

const mapMateriel = (m: Materiel & { idMateriel: number | string }): Materiel => ({
  ...m,
  idMateriel: String(m.idMateriel),
});

export const getMateriels = async (): Promise<Materiel[]> => {
  const { data } = await axiosInstance.get("/dit/materiels");
  return data.map(mapMateriel);
};

export const searchMateriels = async (term: string): Promise<Materiel[]> => {
  if (!term || term.trim().length < 2) return [];
  const { data } = await axiosInstance.get("/dit/materiels", {
    params: { search: term.trim() },
  });
  return data.map(mapMateriel);
};
