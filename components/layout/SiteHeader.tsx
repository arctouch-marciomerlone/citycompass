import Link from "next/link";
import { Suspense } from "react";

import { CitySwitcher } from "@/components/layout/CitySwitcher";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import type { CitySummary } from "@/lib/hygraph/types";
import type { UiMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import {
  aboutPath,
  homePath,
  localeHomePath,
  mapPath,
  placesPath,
} from "@/lib/routes";

export function SiteHeader({
  locale,
  citySlug,
  cityName,
  cities,
  messages,
}: {
  readonly locale: Locale;
  readonly citySlug?: string;
  readonly cityName?: string;
  readonly cities: readonly CitySummary[];
  readonly messages: UiMessages;
}) {
  const brandHref =
    citySlug === undefined
      ? localeHomePath(locale)
      : homePath(locale, citySlug);
  const about = aboutPath(locale);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href={brandHref} className="text-lg font-semibold tracking-tight">
          CityCompass
          {cityName !== undefined ? (
            <span className="ml-2 text-sm font-normal text-zinc-600 dark:text-zinc-400">
              {cityName}
            </span>
          ) : null}
        </Link>
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-4 text-sm"
        >
          {citySlug !== undefined ? (
            <>
              <Link href={homePath(locale, citySlug)}>{messages.navHome}</Link>
              <Link href={placesPath(locale, citySlug)}>
                {messages.navPlaces}
              </Link>
              <Link href={mapPath(locale, citySlug)}>{messages.navMap}</Link>
            </>
          ) : null}
          <Link href={about}>{messages.navAbout}</Link>
          {cities.length > 0 ? (
            <CitySwitcher
              locale={locale}
              cities={cities}
              activeSlug={citySlug}
              label={messages.cityLabel}
            />
          ) : null}
          <Suspense fallback={null}>
            <LocaleSwitcher locale={locale} label={messages.localeLabel} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
