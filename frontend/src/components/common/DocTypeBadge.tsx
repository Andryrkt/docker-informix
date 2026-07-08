import {
  FileText,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  FileCheck,
  File,
  type LucideIcon,
} from "lucide-react";

// Associates document categories with specific icons and Tailwind colors
const TYPE_CONFIG: Record<string, { icon: LucideIcon; color: string }> = {
  pdf: { icon: FileText, color: "text-red-500 bg-red-50 dark:bg-red-950/40" },
  image: {
    icon: FileImage,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  },
  excel: {
    icon: FileSpreadsheet,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40",
  },
  word: {
    icon: FileText,
    color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
  },
  zip: {
    icon: FileArchive,
    color: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
  },
};

export function DocTypeBadge({ type }: { type: string }) {
  const normalized = type.toLowerCase();

  // Find key matching type descriptor strings
  const configKey = Object.keys(TYPE_CONFIG).find((key) =>
    normalized.includes(key),
  );
  const { icon: Icon, color } = TYPE_CONFIG[configKey || ""] || {
    icon: File,
    color: "text-gray-500 bg-gray-50",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`p-1 py-1.5 rounded-md ${color} shrink-0`}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="capitalize  text-foreground  text-[0.6rem]">{type}</span>
    </div>
  );
}
