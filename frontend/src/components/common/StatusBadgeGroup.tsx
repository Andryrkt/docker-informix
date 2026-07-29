import { cn } from "@/lib/utils";
import { getStatutDevisClass, getStatusDitClass } from "@/helper/helper";
import type { StatusCount } from "@/domains/atelier/dit/api/ditApi";

type Props = {
  title?: string;
  items: StatusCount[];
  value?: string;
  onChange?: (value: string) => void;
};

export const ditStatusMock: StatusCount[] = [
  {
    description: "A AFFECTER",
    count: 0,
  },
  {
    description: "AFFECTEE SECTION",
    count: 0,
  },
  {
    description: "CLOTUREE ANNULEE",
    count: 0,
  },
  {
    description: "CLOTUREE HORS DELAI",
    count: 0,
  },
  {
    description: "CLOTUREE VALIDEE",
    count: 0,
  },
  {
    description: "TERMINEE",
    count: 0,
  },
] as const;

export default function StatusBadgeGroup({
  title = "Répartition par statut :",
  items,
  value,
  onChange,
}: Props) {
  return (
    <div className="mt-1">
      <div className="text-[0.6rem] text-gray-700 pb-1">{title}</div>
      <div className="grid grid-cols-3 gap-2 ">
        {items.map((item) => {
          const active = value === item.description;
          const statusClass = getStatusDitClass(item.description);

          return (
            <button
              key={item.description}
              onClick={() => onChange?.(item.description)}
              className={cn(
                "flex items-center gap-2 px-3 rounded-md border text-[0.65rem] transition flex-1 font-semibold cursor-pointer",
                statusClass,
                active
                  ? "ring-2 ring-offset-2 ring-black"
                  : "opacity-90 hover:opacity-100",
              )}
            >
              <span className="px-2 py-0.5 rounded-full">{item.count}</span>
              <span className="whitespace-nowrap">{item.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
