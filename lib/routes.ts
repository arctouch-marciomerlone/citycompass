import type { Route } from "next";

import type { Locale } from "@/lib/locale";

export function isAppRoute(value: string): value is Route {
  return value.startsWith("/") && !value.startsWith("//");
}

function requireRoute(value: string): Route {
  if (!isAppRoute(value)) {
    throw new Error(`Invalid app route: ${value}`);
  }
  return value;
}

export function localeHomePath(locale: Locale): Route {
  return requireRoute(`/${locale}`);
}

export function homePath(locale: Locale, citySlug: string): Route {
  return requireRoute(`/${locale}/${citySlug}`);
}

export function placesPath(
  locale: Locale,
  citySlug: string,
  query?: { readonly category?: string; readonly neighborhood?: string },
): Route {
  const params = new URLSearchParams();
  if (query?.category !== undefined) {
    params.set("category", query.category);
  }
  if (query?.neighborhood !== undefined) {
    params.set("neighborhood", query.neighborhood);
  }
  const encoded = params.toString();
  const path = `/${locale}/${citySlug}/places`;
  return encoded.length > 0
    ? requireRoute(`${path}?${encoded}`)
    : requireRoute(path);
}

export function placePath(
  locale: Locale,
  citySlug: string,
  slug: string,
): Route {
  return requireRoute(`/${locale}/${citySlug}/places/${slug}`);
}

export function mapPath(locale: Locale, citySlug: string): Route {
  return requireRoute(`/${locale}/${citySlug}/map`);
}
