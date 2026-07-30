import { z } from "zod";

export const BonCommandeDevisSchema = z.object({
  numeroDevis: z.string().optional(), // can be provided
  numeroBc: z.string().min(1, "Numéro BC requis"),
  dateBc: z.string().min(1, "Date BC requise"),
  montantBc: z.string().min(1, "Montant BC requis"),
  pieceJointeBc: z.any().optional(),
  pieceJointes: z.any().optional(),
  validationPm: z.boolean().default(false),
  tacheValidateur: z.array(z.string()).optional(),
});

export type BonCommandeDevisPayload = z.infer<typeof BonCommandeDevisSchema>;
