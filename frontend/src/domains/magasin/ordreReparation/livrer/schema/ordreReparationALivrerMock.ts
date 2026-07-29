// mocks/ordreReparationMock.ts
import type { PaginatedResponse } from "@/conf/api/Response";
import type {
  OrdreReparationALivrer,
  NiveauUrgence,
} from "./ordreReparationALivrerSchema";

const urgencyLevels: NiveauUrgence[] = ["P1", "P2", "P3", "P4", "P5"];
const etatOrOptions = ["COMPLETS", "EN_COURS", "SOUMIS", "VALIDE", "REJETE"];
const typeLigneOptions = ["PIÈCES MAGASIN", "MAINTENANCE", "PRESTATION"];
const constructeurs = [
  "Constructeur A",
  "Constructeur B",
  "Constructeur C",
  "Constructeur D",
];

const agences = ["Agence A", "Agence B", "Agence C", "Agence D", "Agence E"];
const services = [
  "Service 1",
  "Service 2",
  "Service 3",
  "Service 4",
  "Service 5",
];

const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomDate = (daysBack: number): string => {
  const d = new Date(
    Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000,
  );
  return d.toISOString().split("T")[0];
};

// Generate a single mock order
const generateMockOrder = (index: number): OrdreReparationALivrer => ({
  numeroDit: `DIT-${String(1000 + index).padStart(4, "0")}`,
  numeroOr: `OR-${String(2000 + index).padStart(4, "0")}`,
  datePlanning: randomDate(30),
  niveauUrgence: randomItem(urgencyLevels),
  dateOr: randomDate(15),
  agenceEmetteur: randomItem(agences),
  serviceEmetteur: randomItem(services),
  agenceDebiteur: randomItem(agences),
  serviceDebiteur: randomItem(services),
  numeroItv: `ITV-${Math.floor(Math.random() * 9000 + 1000)}`,
  numeroLigne: Math.floor(Math.random() * 20) + 1,
  constructeur: `CST-${Math.floor(Math.random() * 1000)}`,
  reference: `REF-${Math.floor(Math.random() * 10000)}`,
  designation: `Pièce ${Math.floor(Math.random() * 100)}`,
  quantiteDemandee: parseFloat((Math.random() * 10 + 1).toFixed(2)),
  quantiteALivrer: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
  quantiteDejaLivree: parseFloat((Math.random() * 3).toFixed(2)),
  utilisateur: `User${Math.floor(Math.random() * 50) + 1}`,
});

// Generate all orders (total = default 500)
export const generateAllMockOrders = (
  total: number = 500,
): OrdreReparationALivrer[] => {
  return Array.from({ length: total }, (_, i) => generateMockOrder(i));
};

// Get a paginated slice
export const getPaginateMockOrdresALivrer = (
  page: number,
  limit: number,
  total: number = 500,
): PaginatedResponse<OrdreReparationALivrer> => {
  const all = generateAllMockOrders(total);
  const start = (page - 1) * limit;
  const end = Math.min(start + limit, all.length);
  const data = all.slice(start, end);
  return {
    data,
    current_page: page,
    total_pages: Math.ceil(total / limit),
    resultat: data.length,
  };
};
