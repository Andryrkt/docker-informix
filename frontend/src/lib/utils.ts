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
