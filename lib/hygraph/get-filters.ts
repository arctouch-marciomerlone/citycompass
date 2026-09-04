import { contentGraphql } from "@/lib/hygraph/client";
import { CacheTag } from "@/lib/hygraph/enumerations";
import { parseCategories, parseNeighborhoods } from "@/lib/hygraph/parse";
import { FILTERS_QUERY } from "@/lib/hygraph/queries";
import type { CategoryView, NeighborhoodView } from "@/lib/hygraph/types";
import { type Locale, localesForQuery } from "@/lib/locale";

export interface PlaceFilterOptions {
  readonly categories: readonly CategoryView[];
  readonly neighborhoods: readonly NeighborhoodView[];
}

export async function getPlaceFilters(options: {
  readonly citySlug: string;
  readonly locale: Locale;
}): Promise<PlaceFilterOptions> {
  const data = await contentGraphql(FILTERS_QUERY, {
    variables: {
      citySlug: options.citySlug,
      locales: [...localesForQuery(options.locale)],
    },
    tags: [CacheTag.Category, CacheTag.Neighborhood],
  });
  return {
    categories: parseCategories(data["categories"]),
    neighborhoods: parseNeighborhoods(data["neighborhoods"]),
  };
}
