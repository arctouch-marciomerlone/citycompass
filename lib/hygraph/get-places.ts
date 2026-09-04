import { contentGraphql } from "@/lib/hygraph/client";
import { CacheTag } from "@/lib/hygraph/enumerations";
import { parsePlaceCards, parseSlugs } from "@/lib/hygraph/parse";
import { PLACE_SLUGS_QUERY, PLACES_QUERY } from "@/lib/hygraph/queries";
import type { PlaceCardView } from "@/lib/hygraph/types";
import { type Locale, localesForQuery } from "@/lib/locale";

export async function getPlaces(options: {
  readonly citySlug: string;
  readonly locale: Locale;
  readonly categorySlug?: string;
  readonly neighborhoodSlug?: string;
  readonly featuredOnly?: boolean;
}): Promise<PlaceCardView[]> {
  const where: Record<string, unknown> = {
    city: { slug: options.citySlug },
  };
  if (options.categorySlug !== undefined && options.categorySlug !== "") {
    where["categories_some"] = { slug: options.categorySlug };
  }
  if (
    options.neighborhoodSlug !== undefined &&
    options.neighborhoodSlug !== ""
  ) {
    where["neighborhood"] = { slug: options.neighborhoodSlug };
  }
  if (options.featuredOnly === true) {
    where["isFeatured"] = true;
  }

  const data = await contentGraphql(PLACES_QUERY, {
    variables: {
      where,
      locales: [...localesForQuery(options.locale)],
    },
    tags: [
      CacheTag.Place,
      CacheTag.Category,
      CacheTag.Neighborhood,
      CacheTag.Map,
    ],
  });
  return parsePlaceCards(data["places"]);
}

export async function getPlaceSlugs(citySlug: string): Promise<string[]> {
  const data = await contentGraphql(PLACE_SLUGS_QUERY, {
    variables: { citySlug },
    tags: [CacheTag.Place],
  });
  return parseSlugs(data["places"]);
}
