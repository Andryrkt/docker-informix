import type { FilterField } from "@/components/common/filter/schema/filterSchema";
import type { StatutLigne } from "@/domains/magasin/dematerialisation/planning/schema/CmdeMagasinSchema";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export async function formatErrorMessage(
  error: any,
  fallback = "Une erreur est survenue.",
) {
  try {
    if (error?.response?.data instanceof Blob) {
      const text = await error.response.data.text();
      const json = JSON.parse(text);
      return json.message || fallback;
    }
    return error?.response?.data?.message || error?.message || fallback;
  } catch {
    return fallback;
  }
}
// ✅ Type guard for nested fields
function isNestedFields(
  fields: FilterField[] | FilterField[][],
): fields is FilterField[][] {
  return Array.isArray(fields[0]);
}

export function buildExcelFilename(
  base: string,
  filters: Record<string, any>,
  fields: FilterField[] | FilterField[][],
) {
  const date = new Date().toISOString().split("T")[0];

  // ✅ Use the type guard to safely flatten
  const flatFields: FilterField[] = isNestedFields(fields)
    ? fields.flat()
    : fields;

  const parts: string[] = [base];

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    const field = flatFields.find((f) => f.name === key);

    if (!field) continue;

    const cleanValue = String(value)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");

    parts.push(`${key}-${cleanValue}`);
  }

  parts.push(date);

  return parts.join("_") + ".xlsx";
}

// Format date au format JJ/MM/AAAA (affichage) — accepte une date ISO
// ("2026-06-25" ou "2026-06-25T00:00:00") ou un objet Date.
export function formatDate(value?: string | Date | null): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const formatLabel = (segment: string) => {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
export function format(value: any, formatter?: (v: any) => string): string {
  return value == null ? "-" : formatter ? formatter(value) : String(value);
}

// File viewer utils
const urlCache = new WeakMap<File, string>();

export function getFileUrl(file: File | undefined): string | null {
  if (!file) return null;
  if (!urlCache.has(file)) {
    const rawUrl = URL.createObjectURL(file);
    const cleanUrl =
      file.type === "application/pdf"
        ? `${rawUrl}#toolbar=0&navpanes=0&statusbar=0&messages=0&view=FitH`
        : rawUrl;

    urlCache.set(file, cleanUrl);
  }
  return urlCache.get(file) || null;
}

// Format file size
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
};

// Helper pour fichiers

export const appendFiles = (key: string, files: any, formData: any) => {
  if (!files) return;

  const list = Array.isArray(files) ? files : [files];

  list.forEach((file) => {
    if (file instanceof File) {
      formData.append(`${key}[]`, file);
    }
  });
};

// Helper function to safely convert any input into a File array
export const normalizeFiles = (val: any): File[] => {
  if (Array.isArray(val)) return val;
  if (val instanceof File) return [val];
  return [];
};

export const CMDE_MAGASIN_STATUS_CONFIG: {
  value: StatutLigne;
  label: string;
  className: string;
}[] = [
  {
    value: "DISPO STOCK",
    label: "DISPO STOCK",
    className: "text-yellow-700 hover:text-yellow-800",
  },
  {
    value: "Back Order / Error",
    label: "Back Order / Error",
    className: "text-red-700 hover:text-red-800",
  },
  {
    value: "Commande envoyée fournisseur",
    label: "Commande envoyée fournisseur",
    className: "text-green-500 hover:text-green-600",
  },
  {
    value: "Réception Partielle",
    label: "Réception Partielle",
    className: "text-yellow-400 hover:text-yellow-500",
  },
];

export function getCmdeMagasinStatusClass(status?: StatutLigne | null): string {
  if (!status) return "text-gray-500";

  return (
    CMDE_MAGASIN_STATUS_CONFIG.find((item) => item.value === status)
      ?.className ?? "text-gray-500"
  );
}
