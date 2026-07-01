import { z } from "zod";

export const verificationPrixSchema = z.object({
  numeroDit: z.string().min(1, "Numéro DIT requis"),
  numeroDevis: z.string().min(1, "Numéro devis requis"),

  tachePartsManager: z.enum(["VERIF_PRIX", "VERIF_PRIX_DHL"]),

  pieceJointe: z.any(),
});

export type VerificationPrixPayload = z.infer<typeof verificationPrixSchema>;
