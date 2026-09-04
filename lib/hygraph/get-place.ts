import { contentGraphql } from "@/lib/hygraph/client";
import { CacheTag } from "@/lib/hygraph/enumerations";
import { parsePlaceDetail } from "@/lib/hygraph/parse";
import { PLACE_DETAIL_QUERY } from "@/lib/hygraph/queries";
import type { PlaceDetailView } from "@/lib/hygraph/types";
import { type Locale, localesForQuery } from "@/lib/locale";

export async function getPlace(options: {
  readonly citySlug: string;
  readonly locale: Locale;
  readonly slug: string;
}): Promise<PlaceDetailView | undefined> {
  const data = await contentGraphql(PLACE_DETAIL_QUERY, {
    variables: {
      slug: options.slug,
      locales: [...localesForQuery(options.locale)],
    },
    tags: [
      CacheTag.Place,
      CacheTag.Category,
      CacheTag.Neighborhood,
      CacheTag.Map,
    ],
  });
  const place = parsePlaceDetail(data["place"]);
  if (place?.citySlug !== options.citySlug) {
    return undefined;
  }
  return place;
}
