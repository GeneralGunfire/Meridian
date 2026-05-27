/** Returns ISO week string like "2026-w22" for a given date */
export function getWeekString(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-w${String(weekNum).padStart(2, "0")}`;
}

/** Returns quarter string like "2026-q1" */
export function getQuarterString(date: Date = new Date()): string {
  const q = Math.ceil((date.getMonth() + 1) / 3);
  return `${date.getFullYear()}-q${q}`;
}

/** Returns month string like "2026-05" */
export function getMonthString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Returns year string like "2025" (previous year for annual data) */
export function getAnnualPeriod(date: Date = new Date()): string {
  // Annual datasets release the prior year's data
  return String(date.getFullYear() - 1);
}

/** ISO date string e.g. "2026-05-27" */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}
