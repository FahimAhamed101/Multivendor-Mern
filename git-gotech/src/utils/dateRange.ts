// utils/dateRange.ts
export function parseDDMMYY(input: string): Date | null {
  // expects DD/MM/YY or DD/MM/YYYY
  const parts = input.split("/").map((p) => p.trim());
  if (parts.length !== 3) return null;

  const [dd, mm, yy] = parts.map(Number);
  if (!dd || !mm || !yy) return null;

  const year = yy < 100 ? 2000 + yy : yy; // 26 -> 2026
  const date = new Date(year, mm - 1, dd);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
