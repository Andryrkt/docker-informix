import { FieldSeparator } from "../ui/field";
import { Separator } from "../ui/separator";

type Props = {
  title?: string;
  value?: string;
  onChange: (status: string) => void;
};

export const LIVRAISON_STATUTS = [
  {
    label: "Partiellement dispo",
    value: "Partiellement dispo",
    className: " text-blue-400 ",
    dot: "bg-blue-400",
  },
  {
    label: "Complet non livré",
    value: "Complet non livré",
    className: " text-blue-800 ",
    dot: "bg-blue-800",
  },
  {
    label: "Partiellement livré",
    value: "Partiellement livré",
    className: " text-yellow-500 ",
    dot: "bg-yellow-500",
  },
  {
    label: "Tout livré",
    value: "Tout livré",
    className: " text-green-600 ",
    dot: "bg-green-600",
  },
] as const;

export default function LivraisonStatutsList({
  title = "Statuts de livraison :",
  value,
  onChange,
}: Props) {
  return (
    <div className="mt-1">
      {/* TITLE */}
      <div className="text-[0.6rem] text-gray-700">{title}</div>

      {/* LIST */}
      <div className="flex flex-wrap gap-2">
        {LIVRAISON_STATUTS.map((status, index) => {
          const isActive = value === status.value;

          return (
            <div key={status.value} className="flex items-center gap-2">
              <button
                onClick={() => onChange(status.value)}
                className={`
                  flex items-center gap-2
                 py-1 px-1 transition text-xs cursor-pointer
                  ${status.className}
                  ${isActive ? "ring-1 ring-gray-200" : "opacity-90 hover:opacity-100"}
                `}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                <span className="whitespace-nowrap">{status.label}</span>
              </button>

              {/* SEPARATOR */}
              {index !== LIVRAISON_STATUTS.length - 1 && (
                <Separator orientation="vertical" className="text-brand-dark" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
