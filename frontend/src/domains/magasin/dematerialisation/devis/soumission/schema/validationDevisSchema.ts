import { z } from "zod";

export const validationDevisSchema = z.object({
  numeroDevis: z.string().min(1, "Numéro devis requis"),
  validationPm: z.boolean().default(false), // <-- now a boolean
  tacheValidateur: z.array(z.string()).optional(),
  pieceJointeDevis: z.any().optional(),
  pieceJointeExcel: z.any().optional(),
  pieceJointes: z.any().optional(),
});
// export const validationSchema = z.object({
//   numeroDit: z.string().min(1, "Numéro DIT requis"),
//   numeroDevis: z.string().min(1, "Numéro devis requis"),

//   pieceJointe: z.any(),
// });

export type ValidationDevisPayload = z.infer<typeof validationDevisSchema>;
// export type ValidationPayload = z.infer<typeof validationSchema>;
