import { z } from "zod";

export const factureSchema = z.object({
  numeroDit: z.string().min(1, "Numéro DIT requis"),
  numeroDevis: z.string().min(1, "Numéro devis requis"),

  pieceJointes: z
    .array(z.instanceof(File))
    .max(4, "Vous ne pouvez pas dépasser 4 fichiers")
    .min(1, "Veuillez insérer au moins un fichier"),
});

export type FacturePayload = z.infer<typeof factureSchema>;
