import axiosInstance from "@/conf/axios";
import type { Client } from "../schema/clientSchema";
import type { SelectOption } from "@/schema/traitFields";

const mockClients: Client[] = [
  {
    numClient: "C001",
    nomClient: "Dupont",
    telephoneClient: "0612345678",
    emailClient: "dupont@example.com",
  },
  {
    numClient: "C002",
    nomClient: "Martin",
    telephoneClient: null, // allowed by the interface
    emailClient: "martin@example.com",
  },
  {
    numClient: "C003",
    nomClient: "Bernard",
    telephoneClient: "0678912345",
    emailClient: null, // allowed by the interface
  },
];
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true" || true;

export const getClients = async (): Promise<Client[]> => {
  if (USE_MOCK) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockClients), 300),
    );
  }
  const { data } = await axiosInstance.get("/dit/clients");
  return data;
};

export const getClientOptions = async (): Promise<SelectOption[]> => {
  const clients = await getClients();

  return clients.map((client) => ({
    id: parseInt(client.numClient.replace(/\D/g, ""), 10) || 0, // fallback if you need numeric id
    code: client.numClient,
    label: `${client.numClient} - ${client.nomClient}`,
    value: client.numClient,
  }));
};
