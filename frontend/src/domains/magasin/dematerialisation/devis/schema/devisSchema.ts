export interface Devis {
  date_cde_brute: string;
  statutDw: string | null;
  statutBc: string | null;
  numeroDevis: string;
  dateCreation: string;
  emetteur: string;
  client: string;
  referenceClient: string;
  montantDevis: string;
  dateEnvoiDevisAuClient: string | null;
  stopProgressionGlobal: string | null;
  motifStopGlobal: string | null;
  statutRelance1: string | null;
  statutRelance2: string | null;
  statutRelance3: string | null;
  positionIps: string;
  utilisateurCreateurDevis: string;
  soumisPar: string | null;
  DEVISE: string;
  CONSTRUCTEUR: string;
  numeroPo?: string | null;
  urlPo?: string | null;
}

export type LineItem = {
  numeroLigne: number;
  constructeur: string;
  ref: string;
  designation: string;
  qte: number;
  prixHt: number;
  montantNet: number;
  remise1: number;
  remise2: number;
  ras: boolean;
  qteModifier: boolean;
  nouvelleQte?: number;
  supprimer: boolean;
};
