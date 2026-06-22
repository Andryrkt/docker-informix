export const getStatusClass = (status?: string) => {
  if (!status) return "text-gray-600";

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

const isDateLike = (value?: string) => {
  if (!value) return false;
  // matches DD/MM/YYYY
  return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
};
export const formatMontant = (montant: string, devise: string): string => {
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
