const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const shortDate = (date: Date): string => `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

const pad = (value: number): string => String(value).padStart(2, "0");

export const clockTime = (date: Date): string => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const isoDay = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function shortDay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return shortDate(new Date(year!, month! - 1, day!));
}

export const dayAndMonth = (isoDate: string): string => shortDay(isoDate).replace(/ \d{4}$/, "");
