import { getISOWeek } from "date-fns";

export function getWeeksOfYear(year: number = new Date().getFullYear()) {
  const jan4 = new Date(year, 0, 4);
  const dec31 = new Date(year, 11, 31);
  const firstWeek = getISOWeek(jan4); // usually 1
  const lastWeek = getISOWeek(dec31); // 52 or 53

  const weeks = [];
  for (let i = firstWeek; i <= lastWeek; i++) {
    weeks.push({
      value: String(i), // ✅ convert to string
      label: `Semaine ${i}`,
    });
  }
  return weeks;
}

export const formatMonthDisplay = (
  monthStr: string,
  locale: string,
): string => {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleString(locale, { month: "short", year: "numeric" });
};

// Format date au format JJ/MM/AAAA (affichage) — accepte une date ISO
// ("2026-06-25" ou "2026-06-25T00:00:00") ou un objet Date.
export function formatApprorpiateDate(value?: string | Date | null): string {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
