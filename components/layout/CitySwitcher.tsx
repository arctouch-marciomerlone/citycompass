import Link from "next/link";

import type { CitySummary } from "@/lib/hygraph/types";
import type { Locale } from "@/lib/locale";
import { homePath } from "@/lib/routes";

export function CitySwitcher({
  locale,
  cities,
  activeSlug,
  label,
}: {
  readonly locale: Locale;
  readonly cities: readonly CitySummary[];
  readonly activeSlug: string;
  readonly label: string;
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2 text-sm">
      {cities.map((city) => {
        const active = city.slug === activeSlug;
        return (
          <Link
            key={city.slug}
            href={homePath(locale, city.slug)}
            className={
              active
                ? "font-medium underline underline-offset-4"
                : "text-zinc-600 hover:underline dark:text-zinc-400"
            }
            aria-current={active ? "page" : undefined}
          >
            {city.name}
          </Link>
        );
      })}
    </nav>
  );
}
