export interface CommandeLigne {
  id: string;
  numBCIrium: string;
  ligne: number;
  numCommande: string;
  statutCtrmrq: string;
  cst: string;
  ref: string;
  designation: string;
  qteDEM: number;
  qteALL: number;
  qteRLQ: number;
  qteLIV: number;
  statut: StatutLigne;
  dateStatut: string;
  etaMaurice: string;
  etaMagasin: string;
}

export type StatutLigne =
  | "DISPO STOCK"
  | "Back Order / Error"
  | "Commande envoyée fournisseur"
  | "Réception Partielle";

export interface CmdesMagasinList {
  numero: string;
  intitule: string;
  delaiClient: string;
  cmdeLignes: CommandeLigne[];
}
