import axiosInstance from "@/conf/axios";

export interface Tache {
  id: number;
  titre: string;
  dateTache: string;
  ticketRef: string | null;
  termine: boolean;
  createdAt: string;
  intervenant: {
    id: number;
    nom: string;
    prenoms: string;
  } | null;
}

export interface TachePayload {
  titre: string;
  dateTache: string;
  intervenantId: number | undefined;
  ticketRef?: string;
}

export const fetchTaches = async (): Promise<Tache[]> => {
  const { data } = await axiosInstance.get("/it/taches");
  return data;
};

export const createTache = async (data: TachePayload): Promise<Tache> => {
  const { data: res } = await axiosInstance.post("/it/taches", data);
  return res;
};

export const updateTache = async (id: number, data: TachePayload): Promise<Tache> => {
  const { data: res } = await axiosInstance.put(`/it/taches/${id}`, data);
  return res;
};

export const toggleTache = async (id: number): Promise<Tache> => {
  const { data } = await axiosInstance.post(`/it/taches/${id}/toggle`);
  return data;
};

export const deleteTache = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/it/taches/${id}`);
};
