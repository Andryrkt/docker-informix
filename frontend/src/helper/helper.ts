import type { CommandeStatut } from "@/domains/commande/commandeMocks";

export const getStatutDevisClass = (status?: string) => {
  if (!status) return "text-gray-800";

  if (isDateLike(status)) {
    return "bg-yellow-400 text-black";
  }

  switch (status) {
    case "A traiter":
      return "bg-red-500 text-white";

    case "Prix à confirmer":
      return "bg-yellow-400 text-black";

    case "Prix validé - devis à envoyer au client":
      return "bg-green-500 text-black";

    case "Prix validé - devis à soumettre":
      return "bg-emerald-600 text-white";

    case "Prix modifié - devis à envoyer au client":
      return "bg-amber-400 text-black";

    case "Prix modifié - devis à soumettre":
      return "bg-amber-600 text-white";

    case "Demande refusée par le PM":
      return "bg-rose-600 text-white";

    case "A valider chef d'agence":
      return "bg-purple-500 text-white";

    case "Validé - à envoyer au client":
      return "bg-teal-500 text-black";

    case "Envoyé au client":
      return "bg-blue-400 text-black";

    case "Cloturé - A modifier":
      return "bg-gray-500 text-white";

    // BC statuses (if also used here)
    case "En attente bc":
      return "bg-lime-600 text-black";
    case "Validé":
      return "bg-green-800 text-white";
    case "Soumis à validation":
      return "bg-amber-400 text-black";
    case "A valider PM":
      return "bg-indigo-600 text-white";

    default:
      return "text-gray-600";
  }
};
export const getStatusDitClass = (status?: string) => {
  if (!status) return "text-gray-600";

  // DATE CASE
  if (isDateLike(status)) {
    return "bg-yellow-400 text-black";
  }

  switch (status) {
    case "A AFFECTER":
      return "bg-red-500 text-white";
    case "AFFECTEE SECTION":
      return "bg-orange-500 text-white";
    case "CLOTUREE ANNULEE":
      return "bg-gray-500 text-white";

    case "CLOTUREE HORS DELAI":
      return "bg-yellow-700 text-white";

    case "CLOTUREE VALIDEE":
      return "bg-green-600 text-white";
    case "TERMINEE":
      return "bg-blue-600 text-white";

    default:
      return "text-gray-600";
  }
};

export const getEtatPlanningCmdeMagasinColorMark = (etat?: string | null) => {
  if (!etat) return "text-gray-600";

  switch (etat) {
    case "Valide":
      return "text-green-600 ";

    case "En attente":
      return "text-yellow-600";

    case "Rejeté":
      return "text-red-600";

    default:
      return "text-gray-500";
  }
};

export function getCommandeStatusStyle(statut: CommandeStatut) {
  switch (statut) {
    case "VALIDEE":
      return "text-green-600 bg-green-50";
    case "LIVREE":
      return "text-blue-600 bg-blue-50";
    case "EN_ATTENTE":
      return "text-yellow-600 bg-yellow-50";
    case "ANNULEE":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

const isDateLike = (value?: string) => {
  if (!value) return false;
  // matches DD/MM/YYYY
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
};
export const formatMontant = (
  montantOrOptions:
    | string
    | number
    | { montant: string | number; devise?: string },
  deviseParam?: string,
): string => {
  let montant: string | number;
  let devise: string | undefined;

  // Detect if called with an object
  if (typeof montantOrOptions === "object" && montantOrOptions !== null) {
    ({ montant, devise } = montantOrOptions);
  } else {
    montant = montantOrOptions as string | number;
    devise = deviseParam;
  }

  const num = typeof montant === "number" ? montant : parseFloat(montant);
  if (isNaN(num)) return "-";

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return devise ? `${formatted} ${devise}` : formatted;
};

export const getOptions = (field: any, optionsQuery: any) => {
  return field.options ?? optionsQuery?.data ?? [];
};

export const displayValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return value;
};
