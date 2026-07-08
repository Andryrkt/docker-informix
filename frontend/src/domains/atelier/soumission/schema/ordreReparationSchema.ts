import { z } from "zod";

export const ordreReparationSchema = z.object({
  numeroDit: z.string().min(1, "Numéro DIT requis"),
  numeroDevis: z.string().min(1, "Numéro devis requis"),
  observation: z.string().optional(),

  pieceJointe1: z
    .array(z.instanceof(File))
    .min(1, "Veuillez insérer le fichier requis"),

  pieceJointe2: z.any(),
  pieceJointe3: z.any(),
  pieceJointe4: z.any(),
});

export type OrdreReparationPayload = z.infer<typeof ordreReparationSchema>;
