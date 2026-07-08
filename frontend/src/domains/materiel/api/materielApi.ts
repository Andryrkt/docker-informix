import axiosInstance from "@/conf/axios";
import type { Materiel } from "../schema/materielSchema";

export const getMateriels = async (): Promise<Materiel[]> => {
  const { data } = await axiosInstance.get("/dit/materiels");
  return data.map((m: Materiel & { idMateriel: number | string }) => ({
    ...m,
    idMateriel: String(m.idMateriel),
  }));
};
