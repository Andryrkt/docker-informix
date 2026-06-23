export interface Ri {
  numeroitv: string;
  commentair: string;
}

export type EtatLivraison = "Non livré" | "Partiellement livré" | "Livré";

export type StatutDemande = "Brouillon" | "Validé" | "Annulé" | string;

export interface Dit {
  id: number;
  idStatutDemande: number;
  statutDemande: StatutDemande;

  numeroDemandeIntervention: string;

  reparationRealise: string | null;
  typeDocument: string;
  worNiveauUrgence: string;

  categorieDemande: string;

  numSerie: string | null;
  numParc: string | null;

  dateDemande: string;

  internetExterne: string;

  agenceServiceEmetteur: string;
  agenceServiceDebiteur: string;

  objetDemande: string;

  sectionAffectee: string | null;

  numeroDevisRattache: string | null;
  statutDevis: string | null;

  numeroOr: string | null;
  statutOr: string | null;

  montantOr: number | null;
  dateSoumissionOr: string | null;

  etatFacturation: string | null;

  ri: string | "0/0";

  utilisateurDemandeur: string;

  nbrPj: number;

  estAnnulable: boolean;
  estOrASoumi: boolean;

  quantiteDemanderOr: number;
  quantiteReserverOr: number;
  quantiteLivreeOr: number;
  quantiteReliquatOr: number;
  qteLivOr: number;

  etatLivraison: EtatLivraison;
}
