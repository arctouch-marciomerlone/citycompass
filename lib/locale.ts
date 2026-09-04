import { defineConstObject, type ValueOf } from "@/lib/types/const-object";

export const Locale = defineConstObject({
  EnUs: "en_US",
  PtBr: "pt_BR",
  ZhCn: "zh_CN",
});

export type Locale = ValueOf<typeof Locale>;

export const DEFAULT_LOCALE = Locale.EnUs;

export const SUPPORTED_LOCALES: readonly Locale[] = [
  Locale.EnUs,
  Locale.PtBr,
  Locale.ZhCn,
];

export function isLocale(value: unknown): value is Locale {
  if (typeof value !== "string") {
    return false;
  }

  return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function localesForQuery(locale: Locale): readonly Locale[] {
  if (locale === DEFAULT_LOCALE) {
    return [DEFAULT_LOCALE];
  }
  return [locale, DEFAULT_LOCALE];
}

export function toHtmlLang(locale: Locale): string {
  return locale.replace("_", "-");
}

export function localeFromAcceptLanguage(header: string | undefined): Locale {
  if (header === undefined || header.trim() === "") {
    return DEFAULT_LOCALE;
  }

  const parts = header.split(",");
  for (const part of parts) {
    const token = part.split(";")[0];
    if (token === undefined) {
      continue;
    }
    const tag = token.trim().toLowerCase().replaceAll("_", "-");
    if (tag.startsWith("zh")) {
      return Locale.ZhCn;
    }
    if (tag.startsWith("pt")) {
      return Locale.PtBr;
    }
    if (tag.startsWith("en")) {
      return Locale.EnUs;
    }
  }

  return DEFAULT_LOCALE;
}

export function replaceLocaleInPathname(
  pathname: string,
  nextLocale: Locale,
): string {
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  const first = segments[0];
  if (first !== undefined && isLocale(first)) {
    segments[0] = nextLocale;
    return `/${segments.join("/")}`;
  }
  if (segments.length === 0) {
    return `/${nextLocale}`;
  }
  return `/${nextLocale}/${segments.join("/")}`;
}
