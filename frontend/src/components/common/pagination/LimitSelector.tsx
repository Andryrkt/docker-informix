import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface LimitSelectorProps {
  currentLimit: number;
  onLimitChange: (limit: number) => void;
  options?: number[];
  className?: string;
}

export function LimitSelector({
  currentLimit,
  onLimitChange,
  options = [10, 20, 50],
  className,
}: LimitSelectorProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 font-bold text-[0.7rem]",
        className,
      )}
    >
      <div className="flex items-center gap-1  font-normal">
        <span>Lignes :</span>
        <Select
          value={String(currentLimit)}
          onValueChange={(val) => onLimitChange(Number(val))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
