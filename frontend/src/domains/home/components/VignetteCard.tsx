import { cn } from "@/lib/utils";
import { BookAIcon, BookIcon } from "lucide-react";

export function VignetteCard({
  title,
  icon,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xs border bg-white p-5",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
      )}
    >
      {/* SHINY EFFECT */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-[200%] transition-all duration-700" />
      </div>

      {/* CONTENT */}
      <div className="flex items-center gap-3">
        {/* ICON WITH ROTATION */}
        <div
          className={cn(
            "text-primary transition-transform duration-300",
            "group-hover:rotate-12 group-hover:scale-110",
          )}
        >
          <BookIcon className="size-40"></BookIcon>
        </div>

        <div className="font-medium text-gray-800">{title}</div>
      </div>
    </div>
  );
}
