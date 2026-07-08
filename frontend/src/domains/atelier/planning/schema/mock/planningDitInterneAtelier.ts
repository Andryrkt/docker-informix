import type {
  DayDetail,
  PlanningDitInterneAtelier,
} from "../planningDitInterneAtelierSchema";
import { faker } from "@faker-js/faker";

const AGENCES = [
  "Agence Paris",
  "Agence Lyon",
  "Agence Marseille",
  "Agence Toulouse",
];
const SECTIONS = ["Section A", "Section B", "Section C", "Section D"];
const RESSOURCES = ["Ressource 1", "Ressource 2", "Ressource 3", "Ressource 4"];

function generateDays(count: number): DayDetail[] {
  const days: DayDetail[] = [];
  const startDate = faker.date.recent({ days: 30 });
  for (let i = 0; i < count; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const matin = faker.number.float({ min: 0, max: 4, fractionDigits: 1 });
    const apresmidi = faker.number.float({ min: 0, max: 4, fractionDigits: 1 });
    days.push({
      date: d.toISOString().split("T")[0],
      heureMatin: matin,
      heureMidi: apresmidi,
      total: matin + apresmidi,
      isCheckedMatin: true,
      isCheckedMidi: false,
    });
  }
  return days;
}

function generateOne(): PlanningDitInterneAtelier {
  const nbJours = faker.number.int({ min: 1, max: 6 });
  const jours = generateDays(nbJours);
  const totalHeures = jours.reduce((sum, d) => sum + d.total, 0);

  return {
    id: faker.string.uuid(),
    agence: faker.helpers.arrayElement(AGENCES),
    section: faker.helpers.arrayElement(SECTIONS),
    intitule: faker.company.catchPhrase(),
    or: faker.string.numeric(8),
    itv: `${faker.number.int({ min: 1, max: 12 })} mois`,
    ressource: faker.helpers.arrayElement(RESSOURCES),
    nbJours,
    totalHeures: parseFloat(totalHeures.toFixed(1)),
    jours,
  };
}

export function getMockPlanningDitInterneAtelier(
  filters: Record<string, any> = {},
  page: number = 1,
  pageSize: number = 10,
): {
  data: PlanningDitInterneAtelier[];
  total: number;
  totalPages: number;
  currentPage: number;
} {
  // Generate a fixed set of mock items (e.g., 50)
  const allItems = Array.from({ length: 50 }, () => generateOne());

  // Apply basic filtering (example: filter by agence if present)
  let filtered = allItems;
  if (filters.agence) {
    filtered = filtered.filter((item) =>
      item.agence.toLowerCase().includes(filters.agence.toLowerCase()),
    );
  }
  if (filters.section) {
    filtered = filtered.filter((item) =>
      item.section.toLowerCase().includes(filters.section.toLowerCase()),
    );
  }
  // Add more filters as needed...

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    total,
    totalPages,
    currentPage: page,
  };
}
