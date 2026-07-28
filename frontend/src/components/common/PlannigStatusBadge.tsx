import { cn } from "@/lib/utils";
import { FieldSeparator } from "../ui/field";
import { Separator } from "../ui/separator";

type Props = {
  title?: string;
};

export const PLANNING_STATUTS = [
  {
    label: "Planning ",
    className: " text-yellow-500 ",
    dot: "bg-yellow-500",
  },
  {
    label: "Réalisé suivant planning",
    className: " text-green-700 ",
    dot: "bg-green-700",
  },
  {
    label: "Réalisé hors planning",
    className: " text-gray-400 ",
    dot: "bg-gray-400",
  },
] as const;

export default function PlanningStatusBadge({
  title = "Statuts du planning :",
}: Props) {
  return (
    <div className="mt-1">
      {/* TITLE */}
      <div className="text-[0.6rem] text-gray-700">{title}</div>

      {/* LIST */}
      <div className="flex flex-wrap gap-2">
        {PLANNING_STATUTS.map((status, index) => {
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-2 py-1 px-1 transition text-xs cursor-pointer",
                  status.className,
                )}
              >
                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                <span className="whitespace-nowrap">{status.label}</span>
              </div>
              {/* SEPARATOR */}
              {index !== PLANNING_STATUTS.length - 1 && (
                <Separator orientation="vertical" className="text-brand-dark" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
