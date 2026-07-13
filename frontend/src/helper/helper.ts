import type { CommandeStatut } from "@/domains/commande/commandeMocks";

export const getStatusDevisClass = (status?: string) => {
  if (!status) return "text-gray-800";

  // DATE CASE
  if (isDateLike(status)) {
    return "bg-yellow-400 text-black";
  }

  switch (status) {
    case "A traiter":
      return "bg-red-500 text-white";
    case "A relancer":
      return "bg-red-500 text-white";
    case "Prix validé - devis à envoyer au client":
      return "bg-green-500 text-black";

    case "Envoyé au client":
      return "bg-blue-400 text-white";

    case "Prix à confirmer":
      return "bg-yellow-400 text-black";
    case "En attente bc":
      return "bg-lime-600 text-black";
    case "Validé":
      return "bg-green-800 text-white";
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

export const getEtatPlanningColorMark = (etat?: string | null) => {
  if (!etat) return "text-gray-600";

  switch (etat) {
    case "Valide":
      return "text-green-600 bg-green-100";

    case "En attente":
      return "text-yellow-600 bg-yellow-100";

    case "Rejeté":
      return "text-red-600 bg-red-100";

    default:
      return "text-gray-500 bg-gray-100";
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
  montant: string | number,
  devise: string,
): string => {
  const num = parseFloat(montant);
  return (
    new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num) +
    " " +
    devise
  );
};

export const getOptions = (field: any, optionsQuery: any) => {
  return field.options ?? optionsQuery?.data ?? [];
};
