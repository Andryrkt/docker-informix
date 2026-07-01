import { mockClients } from "../schema/clientMock";
import type { Client } from "../schema/clientSchema";

export const getClients = async (): Promise<Client[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockClients);
    }, 300);
  });
};
