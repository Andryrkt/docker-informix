import * as z from "zod";

export const loginSchema = z.object({
  userName: z.string().min(1, "Utilisateur obligatoire"),
  password: z.string().min(1, "Mot de passe obligatoire"),
});
export type LoginCredentials = z.infer<typeof loginSchema>;
