// mocks/ordreReparationATraiterMock.ts
import type { PaginatedResponse } from "@/conf/api/Response";
import type {
  OrdreReparationATraiter,
  OrAtraiterlignes,
  NiveauUrgence,
} from "../schema/ordreReparationATraiterSchema"; // adjust path as needed
import type { Materiel } from "@/domains/materiel/schema/materielSchema";

// Reuse urgency levels
const urgencyLevels: NiveauUrgence[] = ["P1", "P2", "P3", "P4", "P5", null];

const agences = ["Agence A", "Agence B", "Agence C", "Agence D", "Agence E"];
const services = [
  "Service 1",
  "Service 2",
  "Service 3",
  "Service 4",
  "Service 5",
];
const constructeurs = [
  "Constructeur A",
  "Constructeur B",
  "Constructeur C",
  "Constructeur D",
  null,
];
const modeles = ["Modèle X", "Modèle Y", "Modèle Z", null];
const designations = [
  "Moteur",
  "Pompe",
  "Vanne",
  "Compresseur",
  "Échangeur",
  null,
];

const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
const randomNumber = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals: number = 2): number =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomDate = (daysBack: number): string => {
  const d = new Date(
    Date.now() - Math.random() * daysBack * 24 * 60 * 60 * 1000,
  );
  return d.toISOString().split("T")[0];
};
const randomNullable = <T>(
  value: T,
  nullProbability: number = 0.2,
): T | null => (Math.random() < nullProbability ? null : value);

// Generate a random Materiel (optional per order)
const generateMockMateriel = (): Materiel | null =>
  Math.random() < 0.7 // 70% chance to have a materiel
    ? {
        idMateriel: `MAT-${String(randomNumber(1000, 9999))}`,
        constructeur: randomItem(constructeurs),
        designation: randomItem(designations),
        km: randomNullable(randomNumber(0, 200000), 0.15),
        numParc: randomNullable(`PARC-${randomNumber(100, 999)}`, 0.1),
        modele: randomItem(modeles),
        casier: randomNullable(`CAS-${randomNumber(1, 50)}`, 0.2),
        heures: randomNullable(randomNumber(0, 10000), 0.15),
        numSerie: randomNullable(`SN-${randomNumber(100000, 999999)}`, 0.1),
      }
    : null;

// Generate a single line (OrAtraiterlignes)
const generateMockLigne = (index: number): OrAtraiterlignes => ({
  numeroLigne: index + 1,
  constructeur: randomItem(constructeurs),
  reference: `REF-${randomNumber(1000, 9999)}`,
  designation: `Pièce ${randomNumber(1, 100)}`,
  quantiteDemander: randomFloat(1, 20),
  utilisateur: `User${randomNumber(1, 50)}`,
});

// Generate a single order group (OrdreReparationATraiter)
const generateMockOrderATraiter = (index: number): OrdreReparationATraiter => {
  const lineCount = randomNumber(1, 4); // 1 to 4 lines per order
  const lignes = Array.from({ length: lineCount }, (_, i) =>
    generateMockLigne(i),
  );

  return {
    // Header fields (grouping columns)
    numeroDit: `DIT-${String(1000 + index).padStart(4, "0")}`,
    numeroOr: `OR-${String(2000 + index).padStart(4, "0")}`,
    datePlanning: randomDate(30),
    niveauUrgence: randomItem(urgencyLevels),
    dateOr: randomDate(15),
    agenceEmetteur: randomItem(agences),
    serviceEmetteur: randomItem(services),
    agenceDebiteur: randomItem(agences),
    serviceDebiteur: randomItem(services),
    numeroItv: `ITV-${randomNumber(1000, 9999)}`,
    materiel: generateMockMateriel(),
    // Lines
    lignes,
  };
};

// Generate all orders (default total = 500)
export const generateAllMockOrdresATraiter = (
  total: number = 500,
): OrdreReparationATraiter[] => {
  return Array.from({ length: total }, (_, i) => generateMockOrderATraiter(i));
};

// Get a paginated slice
export const getPaginateMockOrdresATraiter = (
  page: number,
  limit: number,
  total: number = 500,
): PaginatedResponse<OrdreReparationATraiter> => {
  const all = generateAllMockOrdresATraiter(total);
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
