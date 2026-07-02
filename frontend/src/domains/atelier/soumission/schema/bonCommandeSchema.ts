import { z } from "zod";

export const bonCommandeSchema = z.object({
  numeroDit: z.string().min(1, "Numéro DIT requis"),
  numeroDevis: z.string().min(1, "Numéro devis requis"),

  // Dates
  date: z.string(), // 02/07/2026
  dateDevis: z.string(),
  dateBonCommande: z.string().min(1, "Date du bon de commande requise"),

  // Client
  client: z.string().min(1, "Client requis"),
  emailClient: z.string().email("Email client invalide").optional(),

  // Devis info
  montantDevis: z.number(),

  statutDevis: z.string().optional(),

  // Bon de commande
  numeroBonCommande: z.string().min(1, "N° de bon de commande requis"),
  description: z.string().min(1, "Description requise"),

  pieceJointe: z.any(),
});

export type BonCommandePayload = z.infer<typeof bonCommandeSchema>;
