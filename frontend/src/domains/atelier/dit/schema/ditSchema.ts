import * as z from "zod";

export type EtatLivraison = "Non livré" | "Partiellement livré" | "Livré";

export type StatutDemande = "Validé" | "Annulé" | string;

export interface Dit {
  id: number;
  numeroDemandeIntervention: string;

  idStatutDemande: number;

  objetDemande: string;
  detailDemande: string;
  statutDemande: StatutDemande;

  typeDocument: string;
  categorieDemande: string;
  interneExterne: string;
  reparationRealise: string | null;
  worNiveauUrgence: string;

  numSerie: string | null;
  numParc: string | null;

  dateDemande: string;

  agenceEmetteur: string;
  serviceEmmeteur: string;

  agenceDebiteur: string;
  serviceDebiteur: string;

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

const baseSchema = {
  object: z.string().min(1, "Objet requis"),
  details: z.string().min(1, "Détails requis"),

  typeDocument: z.string().min(1, "Type de document requis"),
  categorieDemande: z.string().min(1, "Catégorie demande requise"),

  livraisonPartielle: z.string().min(1, "Livraison partielle requise"),
  avisRecouvrement: z.string().min(1, "Avis de recouvrement requis"),

  agenceEmetteur: z.string().min(1, "Agence émetteur requise"),
  serviceEmmetteur: z.string().min(1, "Service émetteur requis"),

  worNiveauUrgence: z.string().min(1, "Niveau d'urgence requis"),
  datePrevue: z.string().min(1, "Date prévue requise"),

  typeReparation: z.string().min(1, "Type de réparation requis"),
  reparationPar: z.string().min(1, "Réparation par requis"),

  pieceJoint: z.any(),
  pieceJoint1: z.any(),
  pieceJoint2: z.any(),

  idMateriel: z.string().min(1, "ID matériel requis"),
  numParc: z.string().min(1, "Numéro parc requis"),
  numSerie: z.string().min(1, "Numéro de série requis"),
};
export const interneSchema = z.object({
  interneExterne: z.literal("INTERNE"),
  agenceDebiteur: z.string().min(1, "Agence débiteur requise"),
  serviceDebiteur: z.string().min(1, "Service débiteur requis"),

  ...baseSchema,

  demandeDevis: z.string().optional(),
});
export const externeSchema = z.object({
  interneExterne: z.literal("EXTERNE"),
  ...baseSchema,

  demandeDevis: z.string().min(1, "Demande devis requise"),

  numClient: z.string().min(1, "Num client requis"),
  telephoneClient: z.string().min(1, "Téléphone requis"),
  nomClient: z.string().min(1, "Nom client requis"),
  emailClient: z.string().email("Email invalide"),

  clientSousContrat: z.string(),
});

// export const ditFormSchema = z.object({
//   // Demande
//   object: z.string().min(3, "L'objet doit contenir au moins 3 caractères"),
//   details: z
//     .string()
//     .min(10, "Veuillez fournir plus de détails (10 caractères minimum)"),

//   // Traitement
//   typeDocument: z.string().min(1, "Type document requis"),
//   categorieDemande: z.string().min(1, "Catégorie demande requise"),
//   interneExterne: z.enum(["INTERNE", "EXTERNE"], {
//     message: "Veuillez sélectionner INTERNE ou EXTERNE",
//   }),

//   demandeDevis: z
//     .enum(["OUI", "NON"], {
//       message: "Veuillez sélectionner Oui ou Non",
//     })
//     .optional(),

//   livraisonPartielle: z.enum(["OUI", "NON"], {
//     message: "Veuillez sélectionner Oui ou Non",
//   }),

//   avisRecouvrement: z.enum(["OUI", "NON"], {
//     message: "Veuillez sélectionner Oui ou Non",
//   }),

//   // Agence / Service
//   agenceDebiteur: z.string().optional(),
//   serviceDebiteur: z.string().optional(),

//   agenceEmetteur: z.string().min(1, "Veuillez sélectionner une agence"),
//   serviceEmmetteur: z.string().min(1, "Le service émetteur est requis"),

//   // Intervention
//   worNiveauUrgence: z.string().min(1, "Niveau d'urgence requis"),
//   datePrevue: z.string().min(1, "Date prévue requise"),

//   // Réparation
//   typeReparation: z.string().min(1, "Type de réparation requis"),
//   reparationPar: z.string().min(1, "Champ requis"),

//   // Client
//   numClient: z.string().optional(),
//   telephoneClient: z.string().optional(),
//   nomClient: z.string().optional(),
//   emailClient: z.string().email("Email invalide").optional().or(z.literal("")),
//   clientSousContrat: z
//     .enum(["OUI", "NON"], {
//       message: "Veuillez sélectionner Oui ou Non",
//     })
//     .optional(),

//   // Pièces jointes
//   pieceJoint: z.any(),
//   pieceJoint1: z.any(),
//   pieceJoint2: z.any(),

//   // Matériel
//   idMateriel: z.string().min(1, "Id matériel requis"),
//   numParc: z.string().min(1, "Numéro parc requis"),
//   numSerie: z.string().min(1, "Numéro série requis"),
// });

export const ditFormSchema = z.discriminatedUnion("interneExterne", [
  interneSchema,
  externeSchema,
]);

export type DitFormValues = z.infer<typeof ditFormSchema>;
