import axiosInstance from "@/conf/axios";
import type { Client } from "../schema/clientSchema";

export const getClients = async (): Promise<Client[]> => {
  const { data } = await axiosInstance.get("/dit/clients");
  return data;
};
