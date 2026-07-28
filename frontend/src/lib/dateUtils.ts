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
