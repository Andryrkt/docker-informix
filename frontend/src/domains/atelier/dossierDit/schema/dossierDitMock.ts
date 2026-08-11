import type {
  DossierDit,
  DossierDitListItem,
  PieceJointe,
} from "./dossierDitSchema";

const randomDate = (start: Date, end: Date) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    .toISOString()
    .split("T")[0];

const mockPieces: PieceJointe[] = [
  {
    id: 1,
    nom: "contrat.pdf",
    taille: 204800,
    type: "application/pdf",
    url: "/uploads/contrat.pdf",
  },
  {
    id: 2,
    nom: "facture.jpg",
    taille: 512000,
    type: "image/jpeg",
    url: "/uploads/facture.jpg",
  },
  {
    id: 3,
    nom: "specs.docx",
    taille: 153600,
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    url: "/uploads/specs.docx",
  },
];

// Generate many list items for pagination demo
export const mockDossierDitList: DossierDitListItem[] = Array.from(
  { length: 25 },
  (_, i) => ({
    dateDemande: randomDate(new Date(2024, 0, 1), new Date(2025, 0, 1)),
    numeroDemandeIntervention: `DI-2025-${String(i + 1).padStart(3, "0")}`,
    idMateriel: `MAT-${1000 + i}`,
    numParc: `P-${String(i + 1).padStart(3, "0")}`,
    numSerie: `SN-${Math.floor(Math.random() * 1000000)}`,
    designation:
      [
        "Imprimante HP",
        "Serveur Dell",
        "PC Lenovo",
        "Switch Cisco",
        "Routeur Juniper",
      ][i % 5] + (i % 3 === 0 ? " Pro" : ""),
    numeroOr: i % 2 === 0 ? `OR-${1000 + i}` : null,
    nbrPj: i % 3,
    interneExterne: i % 3 === 0 ? "Interne" : i % 3 === 1 ? "Externe" : null,
  }),
);

// Generate details for each possible ID (up to 25)
export const mockDossierDitDetailsAll: DossierDit[] = Array.from(
  { length: 30 },
  (_, i) => ({
    id: i + 1,
    type: ["Demande", "Rapport", "Attestation", "Facture", "Devis"][i % 5],
    nomDocument: `Document_${i + 1}`,
    numeroDocument: `DOC-${String(i + 1).padStart(4, "0")}`,
    dateCreation: randomDate(new Date(2024, 0, 1), new Date(2025, 0, 1)),
    dateMiseAJour: randomDate(new Date(2024, 6, 1), new Date(2025, 6, 1)),
    numeroVersion: `v${i + 1}.0`,
    nombrePages: Math.floor(Math.random() * 20) + 1,
    pieceJointe: mockPieces[i % mockPieces.length],
  }),
);
