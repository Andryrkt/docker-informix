// src/features/planning/mock/planningDitDetailMockUtils.ts

import type {
  CessionInterStock,
  Materiel,
  OrdreReparation,
  PlanningDitDetail,
} from "../planningDitDetailleSchema";

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pickOne = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateDate = (start: Date, end: Date): string => {
  const d = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
};

const generateMonth = (offset: number = 0): string => {
  const d = new Date(2025, offset, 1);
  return d.toISOString().slice(0, 7); // YYYY-MM
};

// src/features/planning/mock/planningDitDetailMock.ts

const generateMateriel = (): Materiel => ({
  marque: pickOne(["Volvo", "Scania", "MAN", "Mercedes", "Renault"]),
  modele: pickOne(["FH", "R-Series", "TGS", "Actros", "T"]),
  id: `MAT-${String(randomInt(1000, 9999))}`,
  numSerie: `SER${String(randomInt(100000, 999999))}`,
  numParc: `PARC-${String(randomInt(100, 999))}`,
  casier: `C${randomInt(1, 20)}`,
  intituleTravaux: pickOne([
    "Révision moteur",
    "Remplacement freins",
    "Vidange",
    "Réparation boîte",
    "Entretien général",
  ]),
  numeroORItv: `OR-${String(randomInt(1000, 9999))}`,
  datePlanning: generateDate(new Date(2025, 0, 1), new Date(2025, 11, 31)),
  cst: `CST-${String(randomInt(100, 999))}`,
  ref: `REF-${String(randomInt(1000, 9999))}`,
  designation: pickOne([
    "Moteur",
    "Châssis",
    "Freins",
    "Transmission",
    "Carrosserie",
  ]),
});

const generateOrdreReparation = (): OrdreReparation => ({
  qteCde: randomInt(1, 10),
  qteAll: randomInt(0, 5),
  qteReliq: randomInt(0, 3),
  qteLiv: randomInt(0, 8),
  statut: pickOne(["En attente", "Validé", "Rejeté", "Partiel"]),
  dateStatut: generateDate(new Date(2025, 0, 1), new Date(2025, 11, 31)),
  ctrMarque: pickOne(["CTR-A", "CTR-B", "CTR-C"]),
  cdeFrn: `FRN-${String(randomInt(100, 999))}`,
  statutCtrmrq: pickOne(["OK", "NOK", "En cours"]),
});

const generateCessionInterStock = (): CessionInterStock => ({
  numCIS: `CIS-${String(randomInt(1000, 9999))}`,
  qteCde: randomInt(1, 15),
  qteAll: randomInt(0, 10),
  qteRel: randomInt(0, 5),
  qteLiv: randomInt(0, 12),
  statut: pickOne(["En attente", "Validé", "Rejeté"]),
  dateStatut: generateDate(new Date(2025, 0, 1), new Date(2025, 11, 31)),
});

export const generatePlanningDitDetailMock = (
  count: number = 1,
): PlanningDitDetail[] => {
  const agences = ["Dakar", "Thiès", "Saint-Louis", "Ziguinchor"];
  const services = ["Travaux", "Maintenance", "Électricité"];

  return Array.from({ length: count }, () => ({
    agence: pickOne(agences),
    service: pickOne(services),
    materiels: Array.from({ length: randomInt(1, 3) }, generateMateriel),
    ordresReparation: Array.from(
      { length: randomInt(0, 4) },
      generateOrdreReparation,
    ),
    cessionsInterStock: Array.from(
      { length: randomInt(0, 3) },
      generateCessionInterStock,
    ),
    etaIvato: pickOne(["Livré", "En transit", "En attente", "Non disponible"]),
    etatMagasin: pickOne(["Stock ok", "Rupture", "Commande en cours"]),
    message: pickOne([
      "",
      "Contrôle qualité demandé",
      "Pièce à commander",
      "Délai à respecter",
    ]),
  }));
};

export const getMockPlanningDitDetail = (
  filters: Record<string, string>,
  page: number,
  pageSize: number = 10,
): Promise<{ data: PlanningDitDetail[]; totalPages: number }> => {
  // Générer toutes les données (par exemple 50 éléments)
  const allData = generatePlanningDitDetailMock(50);

  // Appliquer des filtres simulés (exemple sur agence)
  let filtered = allData;
  if (filters.agence) {
    filtered = filtered.filter((p) =>
      p.agence.toLowerCase().includes(filters.agence.toLowerCase()),
    );
  }
  // Ajoutez d'autres filtres selon vos besoins...

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = filtered.slice(start, end);

  return Promise.resolve({ data, totalPages });
};
