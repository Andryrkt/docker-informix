import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export type StatutBCOption = {
  label: string;
  value: string;
};

// ------------------------------------------------------------------
// Mock data – array of objects with libelle (same as statutOR)
// ------------------------------------------------------------------
const statutsBCMock: { libelle: string }[] = [
  { libelle: "Soumis à validation" },
  { libelle: "En attente bc" },
  { libelle: "Validé" },
  { libelle: "A valider PM" },
];

// ------------------------------------------------------------------
// Mapper – label and value both use libelle
// ------------------------------------------------------------------
const mapStatutBCToOption = (item: { libelle: string }): StatutBCOption => ({
  label: item.libelle,
  value: item.libelle,
});

// ------------------------------------------------------------------
// Static constant – directly mapped from mock (for direct use)
// ------------------------------------------------------------------
export const STATUT_BC: StatutBCOption[] =
  statutsBCMock.map(mapStatutBCToOption);

// ------------------------------------------------------------------
// Fetcher – returns options (mock or real API)
// ------------------------------------------------------------------
export const getStatutsBC = async (): Promise<StatutBCOption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200)); // simulate latency
    return STATUT_BC;
  }

  // Real API call – adjust endpoint as needed
  const { data } =
    await axiosInstance.get<StatutBCOption[]>("/devis/statuts-bc");
  return data;
};
