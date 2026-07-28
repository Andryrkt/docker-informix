import type { PaginatedResponse } from "@/conf/api/Response";
import type {
  PlanningCmdeMagasin,
  ValeurMensuelle,
} from "./planningCmdeMagasinSchema";
import type { PlanningCmdeMagasinParams } from "../api/planningCmdeMagasinApi";

const COMMERCIAUX = [
  "Dupont",
  "Martin",
  "Bernard",
  "Petit",
  "Robert",
  "Richard",
  "Durand",
  "Lefèvre",
];
const AGENCES = [
  "Paris",
  "Lyon",
  "Marseille",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Bordeaux",
];
const SERVICES = [
  "Service A",
  "Service B",
  "Service C",
  "Service D",
  "Service E",
];
const CLIENTS = [
  { code: "CL001", name: "SARL Dupont" },
  { code: "CL002", name: "SA Martin" },
  { code: "CL003", name: "EURL Bernard" },
  { code: "CL004", name: "SAS Petit" },
  { code: "CL005", name: "SCP Robert" },
  { code: "CL006", name: "SAS Richard" },
];

const ETATS = ["Valide", "En attente", "Rejeté"] as const;
const MONTHS = [
  "2025-01",
  "2025-02",
  "2025-03",
  "2025-04",
  "2025-05",
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateValeursMensuelles(): ValeurMensuelle[] {
  return MONTHS.map((date) => ({
    date,
    entries: Array.from({ length: randomInt(1, 4) }, () => ({
      value: randomInt(100, 9999),
      etat: randomPick(ETATS),
    })),
  }));
}

function generateMockPlanningItem(): PlanningCmdeMagasin {
  const client = randomPick(CLIENTS);
  return {
    COMMERCIAUX: randomPick(COMMERCIAUX),
    AGENCE: randomPick(AGENCES),
    SERVICE: randomPick(SERVICES),
    CODE_CLIENT: client.code,
    NOM_CLIENT: client.name,
    MOIS: generateValeursMensuelles(),
  };
}

export function generateMockPlanningData(
  count: number = 50,
): PlanningCmdeMagasin[] {
  return Array.from({ length: count }, generateMockPlanningItem);
}

export async function fetchPlanningCmdeMagasinMock(
  params: PlanningCmdeMagasinParams = {},
  page: number = 1,
  perPage: number = 10,
): Promise<PaginatedResponse<PlanningCmdeMagasin>> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Generate full dataset (or you could cache it globally)
  const allItems = generateMockPlanningData(50);

  // (Optional) Apply simple filtering based on params
  let filtered = allItems;

  // Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const data = filtered.slice(start, end);

  return {
    data,
    current_page: page,
    totalPages,
    resultat: total,
  };
}
