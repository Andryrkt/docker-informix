import { fetchDitDefaults } from "@/domains/atelier/dit/api/ditApi";
import { queryClient } from "@/lib/queryClient";

/**
 * Précharge l'agence/service émetteur par défaut avant l'affichage du
 * formulaire de création DIT — évite le flash "champ vide" le temps que la
 * requête reparte en arrière-plan une fois le formulaire monté.
 */
export const ditDefaultsLoader = () =>
  queryClient.ensureQueryData({
    queryKey: ["dit", "defaults"],
    queryFn: fetchDitDefaults,
  });
