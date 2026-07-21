import { cn } from "@/lib/utils";
import { getStatusDevisClass, getStatusDitClass } from "@/helper/helper";

type StatusItem = {
  label: string;
  value: string;
  count: number;
};

type Props = {
  title?: string;
  items: StatusItem[];
  value?: string;
  onChange?: (value: string) => void;
};

export const ditStatusMock: StatusItem[] = [
  {
    label: "A AFFECTER",
    value: "A AFFECTER",
    count: 764,
  },
  {
    label: "AFFECTEE SECTION",
    value: "AFFECTEE SECTION",
    count: 2103,
  },
  {
    label: "CLOTUREE ANNULEE",
    value: "CLOTUREE ANNULEE",
    count: 1829,
  },
  {
    label: "CLOTUREE HORS DELAI",
    value: "CLOTUREE HORS DELAI",
    count: 9777,
  },
  {
    label: "CLOTUREE VALIDEE",
    value: "CLOTUREE VALIDEE",
    count: 10520,
  },
  {
    label: "TERMINEE",
    value: "TERMINEE",
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
          const active = value === item.value;
          const statusClass = getStatusDitClass(item.value);

          return (
            <button
              key={item.value}
              onClick={() => onChange?.(item.value)}
              className={cn(
                "flex items-center gap-2 px-3 rounded-md border text-[0.65rem] transition flex-1 font-semibold cursor-pointer",
                statusClass,
                active
                  ? "ring-2 ring-offset-2 ring-black"
                  : "opacity-90 hover:opacity-100",
              )}
            >
              <span className="px-2 py-0.5 rounded-full">{item.count}</span>
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
