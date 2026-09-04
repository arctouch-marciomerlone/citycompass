import Link from "next/link";
import { Suspense } from "react";

import { CitySwitcher } from "@/components/layout/CitySwitcher";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import type { CitySummary } from "@/lib/hygraph/types";
import type { UiMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import { homePath, mapPath, placesPath } from "@/lib/routes";

export function SiteHeader({
  locale,
  citySlug,
  cityName,
  cities,
  messages,
}: {
  readonly locale: Locale;
  readonly citySlug: string;
  readonly cityName: string;
  readonly cities: readonly CitySummary[];
  readonly messages: UiMessages;
}) {
  const home = homePath(locale, citySlug);
  const places = placesPath(locale, citySlug);
  const map = mapPath(locale, citySlug);

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href={home} className="text-lg font-semibold tracking-tight">
          CityCompass
          <span className="ml-2 text-sm font-normal text-zinc-600 dark:text-zinc-400">
            {cityName}
          </span>
        </Link>
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-4 text-sm"
        >
          <Link href={home}>{messages.navHome}</Link>
          <Link href={places}>{messages.navPlaces}</Link>
          <Link href={map}>{messages.navMap}</Link>
          <CitySwitcher
            locale={locale}
            cities={cities}
            activeSlug={citySlug}
            label={messages.cityLabel}
          />
          <Suspense fallback={null}>
            <LocaleSwitcher locale={locale} label={messages.localeLabel} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
