// src/domains/statutOR/statutORApi.ts
import axiosInstance from "@/conf/axios";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Types
export interface StatutOR {
  libelle: string; // no more id
}

export type StatutOROption = {
  label: string;
  value: string;
};

// Mock data – unique libelles, id removed
const statutsORMock: StatutOR[] = [
  // ---- Initial states ----
  { libelle: "En attente" },
  { libelle: "En cours" },
  { libelle: "En commande" },
  { libelle: "En préparation" },
  { libelle: "En transit" },

  // ---- Validation steps ----
  { libelle: "A soumettre validation" },
  { libelle: "Soumis à validation" },
  { libelle: "En révision" },
  { libelle: "Validé" },
  { libelle: "Refusé" },
  { libelle: "Rejeté" },
  { libelle: "Non conforme" },

  // ---- Delivery statuses ----
  { libelle: "En attente de livraison" },
  { libelle: "Livré" },
  { libelle: "Partiellement livré" },
  { libelle: "Livraison complète" },
  { libelle: "Réceptionné" },
  { libelle: "Partiellement reçu" },

  // ---- Quality control ----
  { libelle: "Contrôle qualité" },
  { libelle: "Qualité OK" },
  { libelle: "Qualité KO" },

  // ---- Financial statuses ----
  { libelle: "En attente de facturation" },
  { libelle: "Facturé" },
  { libelle: "Payé" },
  { libelle: "Partiellement payé" },

  // ---- Delays and exceptions ----
  { libelle: "En attente de pièce" },
  { libelle: "En souffrance" },
  { libelle: "Suspendu" },
  { libelle: "En attente de confirmation" },

  // ---- Final states ----
  { libelle: "Clôturé" },
  { libelle: "Annulé" },
  { libelle: "Terminé" },
  { libelle: "Archivé" },
];

// Mapper – label and value both use libelle
const mapStatutORToOption = (statut: StatutOR): StatutOROption => ({
  label: statut.libelle,
  value: statut.libelle,
});

// Fetch function
export const getStatutsOR = async (): Promise<StatutOROption[]> => {
  if (USE_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return statutsORMock.map(mapStatutORToOption);
  }

  const { data } = await axiosInstance.get<StatutOR[]>("/atelier/statuts-or");
  return data.map(mapStatutORToOption);
};
