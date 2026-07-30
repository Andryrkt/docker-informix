import { z } from "zod";

export const BonCommandeDevisSchema = z.object({
  numeroDevis: z.string(),
  numeroBc: z.string().min(1, "Numéro BC requis"),
  dateBc: z.string().min(1, "Date BC requise"),
  montantBc: z.string().min(1, "Montant BC requis"),

  pieceJointeBc: z.array(z.any()).min(1, "Veuillez joindre un fichier BC"),
  pieceJointes: z.any().optional(),
  lignes: z
    .array(
      z.object({
        numeroLigne: z.number(),
        constructeur: z.string(),
        ref: z.string(),
        designation: z.string(),
        qte: z.number().min(0, "Quantité doit être >= 0"),
        prixHt: z.number().nonnegative(),
        montantNet: z.number().nonnegative(),
        remise1: z.number().min(0).max(100),
        remise2: z.number().min(0).max(100),
        ras: z.boolean(),
        qteModifier: z.boolean(),
        nouvelleQte: z.number().min(0, "Quantité doit être >= 0"),
        supprimer: z.boolean(),
      }),
    )
    .optional(),
});

export type BonCommandeDevisPayload = z.infer<typeof BonCommandeDevisSchema>;
