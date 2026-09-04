import { type Locale, toHtmlLang } from "@/lib/locale";

export function formatDateInTimeZone(
  isoDate: string,
  timeZone: string,
  locale: Locale,
): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(toHtmlLang(locale), {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone,
  }).format(date);
}

export function formatDateTimeInTimeZone(
  isoDateTime: string,
  timeZone: string,
  locale: Locale,
): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime;
  }
  return new Intl.DateTimeFormat(toHtmlLang(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

export function formatVerifiedDate(
  isoDate: string,
  timeZone: string,
  locale: Locale,
): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(toHtmlLang(locale), {
    dateStyle: "medium",
    timeZone,
  }).format(date);
}
