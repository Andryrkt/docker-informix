import { z } from "zod";

export const verificationSchema = z.object({
  numeroDit: z.string().min(1, "Numéro DIT requis"),
  numeroDevis: z.string().min(1, "Numéro devis requis"),

  tachePartsManager: z.enum(["VERIF_PRIX", "VERIF_PRIX_DHL"]),

  pieceJointe: z.any(),
});
export const validationSchema = z.object({
  numeroDit: z.string().min(1, "Numéro DIT requis"),
  numeroDevis: z.string().min(1, "Numéro devis requis"),

  pieceJointe: z.any(),
});

export type VerificationPayload = z.infer<typeof verificationSchema>;
export type ValidationPayload = z.infer<typeof validationSchema>;
