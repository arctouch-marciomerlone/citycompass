import type { Route } from "next";

import { isLocale, type Locale } from "@/lib/locale";

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

export function aboutPath(locale: Locale): Route {
  return requireRoute(`/${locale}/about`);
}

function pathnameFromHref(value: string): string | undefined {
  if (value.startsWith("/")) {
    const path = value.split("?")[0];
    return path;
  }
  try {
    return new URL(value).pathname;
  } catch {
    return undefined;
  }
}

/**
 * Seed used to store `/{locale}/places` without a city slug. Map that, and
 * same-city `/{locale}/{city}/places` URLs, onto the current city listing.
 */
export function editorialPlacesHref(
  raw: string,
  locale: Locale,
  citySlug: string,
): string {
  const pathname = pathnameFromHref(raw);
  if (pathname === undefined) {
    return raw;
  }
  const segments = pathname.split("/").filter((segment) => segment.length > 0);
  const first = segments[0];
  const second = segments[1];
  const third = segments[2];
  if (
    segments.length === 2 &&
    first !== undefined &&
    isLocale(first) &&
    second === "places"
  ) {
    return placesPath(locale, citySlug);
  }
  if (
    segments.length === 3 &&
    first !== undefined &&
    isLocale(first) &&
    second === citySlug &&
    third === "places"
  ) {
    return placesPath(locale, citySlug);
  }
  return raw;
}
