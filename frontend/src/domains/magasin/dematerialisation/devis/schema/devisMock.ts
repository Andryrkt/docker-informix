import type { Devis } from "./devisSchema";

// ---------- Mock data generation ----------
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return date.toISOString().split("T")[0];
};

const randomItem = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const maybe = <T>(val: T, probability: number = 0.5): T | null =>
  Math.random() < probability ? val : null;

export const generateMockDevis = (count: number = 20): Devis[] => {
  const statutDwList = [
    "A traiter",
    "Prix à confirmer",
    "Prix validé - devis à envoyer au client",
    "Prix validé - devis à soumettre",
    "Prix modifié - devis à envoyer au client",
    "Prix modifié - devis à soumettre",
    "Demande refusée par le PM",
    "A valider chef d'agence",
    "Validé - à envoyer au client",
    "Envoyé au client",
    "Cloturé - A modifier",
    null, // allow null
  ];
  const statutBcList = [
    "Soumis à validation",
    "En attente bc",
    "Validé",
    "A valider PM",
    null,
  ];

  const positions = ["AC", "DE", "RE", "TR"];

  const clients = [
    "Dupont SAS",
    "Martin SARL",
    "Bernard SA",
    "Petit EURL",
    "Durand & Fils",
    "Lefèvre SARL",
    "Moreau SA",
  ];
  const constructeurs = [
    "Caterpillar",
    "Komatsu",
    "Volvo",
    "Hitachi",
    "Liebherr",
    "JCB",
    "Case",
  ];
  const emetteurs = [
    "Agence Antananarivo",
    "Agence Tamatave",
    "Agence Mahajanga",
    "Agence Fianarantsoa",
    "Agence Toliara",
  ];

  return Array.from({ length: count }, (_, i) => ({
    date_cde_brute: randomDate(new Date(2024, 0, 1), new Date()),
    statutDw: randomItem(statutDwList),
    statutBc: randomItem(statutBcList),
    numeroDevis: `DEVIS-${String(i + 1).padStart(4, "0")}`,
    dateCreation: randomDate(new Date(2025, 0, 1), new Date()),
    emetteur: randomItem(emetteurs),
    client: randomItem(clients),
    referenceClient: Math.random().toString(36).substring(2, 8).toUpperCase(),
    montantDevis: String(Math.floor(Math.random() * 50_000_000) + 10_000),
    dateEnvoiDevisAuClient: maybe(
      randomDate(new Date(2025, 0, 1), new Date()),
      0.4,
    ),
    stopProgressionGlobal: maybe("STOP", 0.15),
    motifStopGlobal: maybe("Délai dépassé", 0.1),
    statutRelance1: maybe(randomItem([ "21-10-2026"]), 0.2),
    statutRelance2: maybe(randomItem([ "21-10-2026"]), 0.2),
    statutRelance3: maybe(randomItem([ "21-10-2026"]), 0.2),

    positionIps: randomItem(positions),
    utilisateurCreateurDevis: `Utilisateur ${String.fromCharCode(65 + (i % 26))}${Math.floor(Math.random() * 100)}`,
    soumisPar: maybe(
      `Soumis ${String.fromCharCode(65 + ((i + 10) % 26))}${Math.floor(Math.random() * 100)}`,
      0.6,
    ),
    DEVISE: "Ar",
    CONSTRUCTEUR: randomItem(constructeurs),
    numeroPo: maybe(
      `PO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      0.4,
    ),
    urlPo: maybe(
      `https://example.com/po/${Math.random().toString(36).substring(2, 10)}`,
      0.2,
    ),
  }));
};
