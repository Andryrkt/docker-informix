import * as z from "zod";

export const supportFormSchema = z.object({
  // Section Demande
  object: z.string().min(3, "L'objet doit contenir au moins 3 caractères"),
  details: z.string().min(10, "Veuillez fournir plus de détails (10 car. min)"),

  // Section Agence
  agenceDebiteur: z.string().min(1, "Veuillez sélectionner une agence"),
  serviceDebiteur: z.string().min(1, "Le service débiteur est requise"),

  agenceEmetteur: z.string().min(1, "Veuillez sélectionner une agence"),
  serviceEmmetteur: z.string().min(1, "Le service emetteur est requise"),

  // Section Autre Info
  categorie: z.string().min(1, "Veuillez choisir une catégorie"),
  dateFinSouhaite: z.string().min(1, "La date souhaitée est requise"),
  parcInformatique: z.string().min(1),
  codeSociete: z.string().min(1, "Le code société est requis"),

  // Section Pièces Jointes
  pieceJointes: z.any(),
});

export type SupportFormValues = z.infer<typeof supportFormSchema>;
