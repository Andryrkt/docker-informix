import type { CommandeStatut } from "@/domains/commande/commandeMocks";

export const getStatutDevisClass = (status?: string) => {
  if (!status) return "text-gray-800";
  if (isDateLike(status)) return "bg-yellow-400 text-black font-semibold";

  switch (status) {
    // ---- Devis statuses (from your CSS) ----
    case "Prix à confirmer":
      return "bg-yellow-400 text-black"; // #ffc107

    case "Prix validé - devis à envoyer au client":
    case "Prix validé - devis à soumettre":
      return "bg-green-500 text-black"; // #28a745

    case "Prix modifié - devis à envoyer au client":
      return "bg-red-500 text-white"; // #dc3545
    case "Prix modifié - devis à soumettre":
      return "bg-red-500 text-black"; // #dc3545

    case "Demande refusée par le PM":
      return "bg-gray-500 text-white"; // #6c757d

    case "A valider chef d'agence":
      return "bg-yellow-400 text-black"; // #ffc107

    case "Validé - à envoyer au client":
      return "bg-green-500 text-black"; // #28a745

    case "Envoyé au client":
      return "bg-blue-600 text-black"; // #007bff

    case "Cloturé - A modifier":
      return "bg-gray-500 text-white"; // #6c757d

    case "A traiter":
      return "bg-rose-500 text-white"; // #fb335b

    // ---- BC statuses (from your CSS) ----
    case "Soumis à validation":
      return "bg-yellow-400 text-black"; // #ffc107

    case "En attente bc":
      return "bg-emerald-300 text-black"; // #00ff9d (close to lime-400)

    case "Validé":
      return "bg-green-600 text-white"; // #198754

    case "A valider PM":
      return "bg-indigo-500 text-white"; // custom, not in CSS but used earlier

    default:
      return "text-gray-600";
  }
};

export const getStatutRelanceClass = (status?: string) => {
  if (!status) return "text-gray-800";
  if (isDateLike(status))
    return "bg-yellow-400 text-black font-semibold border";

  switch (status) {
    case "A relancé":
      return "bg-green-500 text-white";
    case "En cours":
      return "bg-blue-400 text-black";
    case "Terminé":
      return "bg-green-600 text-white";
    case "Stop":
      return "bg-red-500 text-white";
    case "Stoppé":
      return "bg-gray-500 text-white";
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
  // ISO: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return true;
  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}/.test(value)) return true;
  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}/.test(value)) return true;
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
