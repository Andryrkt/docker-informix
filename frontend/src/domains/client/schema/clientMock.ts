import type { Client } from "./clientSchema";

export const mockClients: Client[] = [
  {
    numClient: "CL-1001",
    nomClient: "Société HME SARL",
    telephoneClient: "+261 34 12 345 67",
    emailClient: "contact@hme.mg",
  },
  {
    numClient: "CL-1002",
    nomClient: "Madagascar Mining Co",
    telephoneClient: "+261 32 98 765 43",
    emailClient: "info@mmc.mg",
  },
  {
    numClient: "CL-1003",
    nomClient: "Logistique Express MG",
    telephoneClient: "+261 33 11 223 34",
    emailClient: "support@lemg.mg",
  },
  {
    numClient: "CL-1004",
    nomClient: "BTP Construction Plus",
    telephoneClient: "+261 34 55 667 88",
    emailClient: "admin@btpplus.mg",
  },
];
