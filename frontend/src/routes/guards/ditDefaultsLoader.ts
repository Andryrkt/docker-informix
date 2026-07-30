import { getAgences } from "@/domains/agence/api";
import { fetchDitDefaults } from "@/domains/atelier/dit/api/ditApi";
import { queryClient } from "@/lib/queryClient";

/**
 * Précharge l'agence/service émetteur par défaut ainsi que la liste
 * agences+services (nécessaire pour préremplir l'agence/service débiteur —
 * cf. DitForm.tsx) avant l'affichage du formulaire de création DIT — évite
 * le flash "champ vide" le temps que ces requêtes repartent en arrière-plan
 * une fois le formulaire monté. Mêmes queryKey que dans DitForm.tsx pour
 * partager le cache React Query.
 */
export const ditDefaultsLoader = () =>
  Promise.all([
    queryClient.ensureQueryData({
      queryKey: ["dit", "defaults"],
      queryFn: fetchDitDefaults,
    }),
    queryClient.ensureQueryData({
      queryKey: ["filter-options", "agences"],
      queryFn: getAgences,
    }),
  ]);
