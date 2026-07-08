import type { FilterField } from "@/components/common/filter/schema/filterSchema";
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

export function buildExcelFilename(
  filters: Record<string, any>,
  fields: FilterField[],
) {
  const date = new Date().toISOString().split("T")[0];

  const parts: string[] = ["devis"];

  for (const [key, value] of Object.entries(filters)) {
    if (!value) continue;

    const field = fields.find((f) => f.name === key);

    if (!field) continue;

    // clean value
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

export const customLabels: Record<string, string> = {
  "liste-devis-neg": "Devis",
};

export const formatLabel = (segment: string) => {
  if (customLabels[segment]) {
    return customLabels[segment];
  }

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

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

export const formatMonthDisplay = (
  monthStr: string,
  locale: string,
): string => {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString(locale, { month: "short", year: "numeric" });
};
