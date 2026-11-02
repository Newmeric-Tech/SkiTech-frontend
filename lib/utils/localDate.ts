/**
 * Local calendar dates, as the backend's KRA task routes expect them.
 * Never use toISOString() for these: it converts to UTC, which is the previous
 * day for the first 5h30 of an Indian morning.
 */

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** The local calendar date as YYYY-MM-DD */
export function localDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The Monday of the local week containing date */
export function localWeekStart(date: Date = new Date()): Date {
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diffToMonday);
}

export type DateRangePreset = "week" | "month" | "quarter";

/** From the start of the local week/month/quarter containing today, to today */
export function localRangeFor(
  preset: DateRangePreset,
  today: Date = new Date()
): { from: string; to: string } {
  let start: Date;
  if (preset === "week") {
    start = localWeekStart(today);
  } else if (preset === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
  } else {
    start = new Date(today.getFullYear(), today.getMonth() - today.getMonth() % 3, 1);
  }
  return { from: localDateString(start), to: localDateString(today) };
}

/**
 * Formats a KRA task timestamp in the viewer's time zone. These columns are UTC
 * stored without a suffix, and new Date() would read that as local time.
 */
export function formatServerTime(value: string): string {
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const parsed = new Date(hasZone ? value : `${value}Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}
