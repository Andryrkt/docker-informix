import axiosInstance from "@/conf/axios";
import type { StatutFacture, StatutFactureOption } from "./factureSchema";

// const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// const statutsFactureMock: StatutFacture[] = [
//   { libelle: "A valider client interne", id: "0001" },
//   { libelle: "Completement facturé ", id: "0002" },
//   { libelle: "Partiellement payée", id: "0003" },
// ];

const mapStatutFactureToOption = (
  statut: StatutFacture,
): StatutFactureOption => ({
  label: statut.libelle,
  value: statut.id,
});

export const getStatutsFacture = async (): Promise<StatutFactureOption[]> => {
  // if (!USE_MOCK) {
  //   await new Promise((resolve) => setTimeout(resolve, 200));

  //   return statutsFactureMock.map(mapStatutFactureToOption);
  // }

  const { data } = await axiosInstance.get<StatutFacture[]>("/statuts-facture");

  return data.map(mapStatutFactureToOption);
};
