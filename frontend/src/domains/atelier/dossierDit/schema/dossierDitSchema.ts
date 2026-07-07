export interface PieceJointe {
  id?: string | number;
  nom: string;
  taille: number; // en octets
  type?: string;
  url?: string;
}

export interface DossierDit {
  id: string | number;

  type: string;

  nomDocument: string;

  numeroDocument: string;

  dateCreation: string;

  dateMiseAJour: string;

  numeroVersion: string;

  nombrePages: number;

  pieceJointe: PieceJointe;
}

export interface DossierDitListItem {
  dateDemande: string;
  numeroDemandeIntervention: string;

  idMateriel: string;
  numParc: string;
  numSerie: string;

  designation: string | null;

  numeroOr: string | null;

  nbrPj: number;

  interneExterne: "Interne" | "Externe" | null;

  // dossierDit: DossierDit[];
}
