import { Separator } from "@/components/ui/separator";
import type { StatutLigne } from "@/domains/magasin/dematerialisation/planning/schema/CmdeMagasinSchema";
import { CMDE_MAGASIN_STATUS_CONFIG, cn } from "@/lib/utils";

interface Props {
  title?: string;
  value?: StatutLigne;
  onChange: (value: StatutLigne) => void;
  readOnly?: boolean;
}

export default function CmdesLigneStatusBadge({
  title = "Statuts :",
  value,
  onChange,
}: Props) {
  return (
    <div className="mt-1">
      <div className="text-[0.6rem] text-gray-700">{title}</div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange?.(undefined)}
          className={cn(
            "px-1 py-1 text-xs transition-colors cursor-pointer",
            value === undefined
              ? "font-semibold text-brand-dark"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          Tous
        </button>

        {CMDE_MAGASIN_STATUS_CONFIG.map((status, index) => {
          const isActive = value === status.value;

          return (
            <div key={status.value} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange(status.value)}
                className={cn(
                  "px-1 py-1 text-xs transition-colors cursor-pointer whitespace-nowrap",
                  status.className,
                  isActive && "font-semibold underline underline-offset-4",
                )}
              >
                {status.label}
              </button>

              {index !== CMDE_MAGASIN_STATUS_CONFIG.length - 1 && (
                <Separator orientation="vertical" className="h-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
