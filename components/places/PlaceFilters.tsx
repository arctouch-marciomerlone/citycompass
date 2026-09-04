import Link from "next/link";

import type { CategoryView, NeighborhoodView } from "@/lib/hygraph/types";
import type { UiMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import { placesPath } from "@/lib/routes";

function filterHref(
  locale: Locale,
  citySlug: string,
  categorySlug: string | undefined,
  neighborhoodSlug: string | undefined,
) {
  return placesPath(locale, citySlug, {
    category: categorySlug,
    neighborhood: neighborhoodSlug,
  });
}

export function PlaceFilters({
  locale,
  citySlug,
  messages,
  categories,
  neighborhoods,
  selectedCategory,
  selectedNeighborhood,
}: {
  readonly locale: Locale;
  readonly citySlug: string;
  readonly messages: UiMessages;
  readonly categories: readonly CategoryView[];
  readonly neighborhoods: readonly NeighborhoodView[];
  readonly selectedCategory: string | undefined;
  readonly selectedNeighborhood: string | undefined;
}) {
  return (
    <form className="flex flex-col gap-4 md:flex-row" method="get">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {messages.filterCategory}
        </legend>
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <Link
              href={filterHref(
                locale,
                citySlug,
                undefined,
                selectedNeighborhood,
              )}
              className={
                selectedCategory === undefined ? "font-medium underline" : ""
              }
            >
              {messages.filterAll}
            </Link>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={filterHref(
                  locale,
                  citySlug,
                  category.slug,
                  selectedNeighborhood,
                )}
                className={
                  selectedCategory === category.slug
                    ? "font-medium underline"
                    : ""
                }
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-medium">
          {messages.filterNeighborhood}
        </legend>
        <ul className="flex flex-wrap gap-2 text-sm">
          <li>
            <Link
              href={filterHref(locale, citySlug, selectedCategory, undefined)}
              className={
                selectedNeighborhood === undefined
                  ? "font-medium underline"
                  : ""
              }
            >
              {messages.filterAll}
            </Link>
          </li>
          {neighborhoods.map((neighborhood) => (
            <li key={neighborhood.slug}>
              <Link
                href={filterHref(
                  locale,
                  citySlug,
                  selectedCategory,
                  neighborhood.slug,
                )}
                className={
                  selectedNeighborhood === neighborhood.slug
                    ? "font-medium underline"
                    : ""
                }
              >
                {neighborhood.name}
              </Link>
            </li>
          ))}
        </ul>
      </fieldset>
    </form>
  );
}
