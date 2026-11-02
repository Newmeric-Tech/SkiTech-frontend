import type { KraFrequency } from "@/lib/api/kraTasks";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parts(value: string): { year: number; month: number; day: number; weekday: string } {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  // Date.UTC only to find the weekday of these exact parts; no zone is involved
  const weekday = WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return { year, month, day, weekday };
}

const shortMonth = (month: number) => MONTHS[month - 1].slice(0, 3);

/**
 * daily "Mon 3 Nov 2026", weekly "Mon 3 – Sun 9 Nov", monthly "November 2026",
 * quarterly "Q4 2026". period_start and period_end are read as written, with no
 * time zone conversion, so the label is the same for every viewer.
 */
export function formatPeriodLabel(frequency: KraFrequency, periodStart: string, periodEnd: string): string {
  const start = parts(periodStart);
  const end = parts(periodEnd);

  if (frequency === "weekly") {
    const startMonth = start.month === end.month ? "" : ` ${shortMonth(start.month)}`;
    return `${start.weekday} ${start.day}${startMonth} – ${end.weekday} ${end.day} ${shortMonth(end.month)}`;
  }
  if (frequency === "monthly") return `${MONTHS[start.month - 1]} ${start.year}`;
  if (frequency === "quarterly") return `Q${Math.floor((start.month - 1) / 3) + 1} ${start.year}`;
  return `${start.weekday} ${start.day} ${shortMonth(start.month)} ${start.year}`;
}
