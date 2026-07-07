import type { DossierDit, DossierDitListItem } from "./dossierDitSchema";

//  Mock DIT (à remplacer par votre vraie requête)
export const dossierDitListItemMock: DossierDitListItem[] = [
  {
    dateDemande: "2026-07-01",
    numeroDemandeIntervention: "DIT-0001",
    idMateriel: "MAT-1001",
    numParc: "PARC-2201",
    numSerie: "SER-88421",
    designation: "Maintenance moteur hydraulique",
    numeroOr: "OR-7781",
    nbrPj: 3,
    interneExterne: "Interne",
  },
  {
    dateDemande: "2026-07-01",
    numeroDemandeIntervention: "DIT-0002",
    idMateriel: "MAT-1002",
    numParc: "PARC-2202",
    numSerie: "SER-88422",
    designation: "Maintenance moteur hydraulique 2",
    numeroOr: "OR-7782",
    nbrPj: 2,
    interneExterne: "Interne",
  },
  {
    dateDemande: "2026-07-01",
    numeroDemandeIntervention: "DIT-0003",
    idMateriel: "MAT-1003",
    numParc: "PARC-2203",
    numSerie: "SER-88423",
    designation: "Maintenance moteur hydraulique 3",
    numeroOr: "OR-7783",
    nbrPj: 1,
    interneExterne: "Interne",
  },
];

export const dossierDitMock: DossierDit[] = [
  {
    id: 1,
    type: "pdf",
    nomDocument: "Rapport_Intervention_ITV-001.pdf",
    numeroDocument: "DIT-2026-0001",
    dateCreation: "2026-07-01",
    dateMiseAJour: "2026-07-03",
    numeroVersion: "2",
    nombrePages: 18,
    pieceJointe: {
      id: 1,
      nom: "Rapport_Intervention.pdf",
      taille: 845_312,
      url: "/Ordre de réparation_ - Copie.pdf",
    },
  },
  {
    id: 2,
    type: "image",
    nomDocument: "Constat_Fissures_Façade.jpg",
    numeroDocument: "DIT-2026-0002",
    dateCreation: "2026-07-01",
    dateMiseAJour: "2026-07-03",
    numeroVersion: "1",
    nombrePages: 18,
    pieceJointe: {
      id: 1,
      nom: "Constat_Fissures_Façade.jpg",
      taille: 845_312,
      url: "https://picsum.photos/id/20/1200/800.jpg",
    },
  },
  {
    id: 3,
    type: "excel",
    nomDocument: "Suivi_Budgetaire_DIT.xlsx",
    numeroDocument: "DIT-2026-0003",
    dateCreation: "2026-06-15",
    dateMiseAJour: "2026-07-01",
    numeroVersion: "4",
    nombrePages: 0,
    pieceJointe: {
      id: 103,
      nom: "Suivi_Budgetaire_DIT.xlsx",
      taille: 145200, // ~145 KB
      url: "/files/suivi_budgetaire.xlsx", // Déclenchera le mode téléchargement
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  },
  {
    id: 4,
    type: "word",
    nomDocument: "Cahier_des_Charges_Technique.docx",
    numeroDocument: "DIT-2026-0004",
    dateCreation: "2026-05-20",
    dateMiseAJour: "2026-07-03",
    numeroVersion: "1.2",
    nombrePages: 34,
    pieceJointe: {
      id: 104,
      nom: "Cahier_des_Charges_Technique.docx",
      taille: 4120000, // ~4.1 MB
      url: "/files/Exemple_word.docx", // Déclenchera le mode téléchargement
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  },
];
