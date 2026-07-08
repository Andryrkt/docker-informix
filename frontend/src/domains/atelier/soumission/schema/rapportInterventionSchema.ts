import { z } from "zod";

export const rapportInterventionSchema = z.object({
  numeroDit: z.string().min(1, "Numéro DIT requis"),
  numeroDevis: z.string().min(1, "Numéro devis requis"),

  interventions: z
    .array(z.any())
    .min(1, "Veuillez ajouter au moins une intervention"),

  pieceJointe: z
    .array(z.instanceof(File))
    .min(1, "Veuillez insérer le fichier requis"),
});

export type RapportInterventionPayload = z.infer<
  typeof rapportInterventionSchema
>;
