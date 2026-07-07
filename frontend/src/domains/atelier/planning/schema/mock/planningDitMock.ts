import type { PlanningDit, ValeurMensuelleEntry } from "../planningDitSchema";

const generateMockEntries = (count: number): ValeurMensuelleEntry[] => {
  const etats: ("Valide" | "En attente" | "Rejeté" | null)[] = [
    "Valide",
    "En attente",
    "Rejeté",
    null,
  ];
  return Array.from({ length: count }, () => ({
    value: Math.floor(Math.random() * 1000),
    etat: etats[Math.floor(Math.random() * etats.length)],
  }));
};

export const generatePlanningDitMock = (count: number): PlanningDit[] => {
  const startDate = new Date(2025, 0, 1);
  const endDate = new Date(2025, 11, 1);

  const months: string[] = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    months.push(current.toISOString().slice(0, 7));
    current.setMonth(current.getMonth() + 1);
  }

  const agences = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor"];
  const services = ["Travaux", "Maintenance", "Électricité"];

  return Array.from({ length: count }, (_, i) => ({
    id: `PLAN-${String(i + 1).padStart(4, "0")}`,
    agence: agences[i % agences.length],
    service: services[i % services.length],
    marque: `Marque ${String.fromCharCode(65 + (i % 3))}`,
    model: `Model ${i + 100}`,
    numSerie: `SER${String(i + 1).padStart(6, "0")}`,
    numParc: `PARC${String(i + 1).padStart(4, "0")}`,
    casier: `C${i + 1}`,
    mois: months.map((date) => ({
      date,
      entries: generateMockEntries(Math.floor(Math.random() * 3) + 1),
    })),
  }));
};

// Cette fonction simule la réponse de l'API
export const getMockPlanningDits = (
  filters: Record<string, string>,
  page: number,
): Promise<{ data: PlanningDit[]; totalPages: number }> => {
  // Générer toutes les données mockées (par exemple 50 éléments)
  const allData = generatePlanningDitMock(50); // on passera le nombre d'éléments

  // Appliquer un filtre simulé (optionnel)
  let filtered = allData;
  if (filters.agence) {
    filtered = filtered.filter((p) =>
      p.agence.toLowerCase().includes(filters.agence.toLowerCase()),
    );
  }
  // Ajouter d'autres filtres si nécessaire...

  // Pagination simulée (10 par page)
  const pageSize = 10;
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);

  return Promise.resolve({ data, totalPages });
};
