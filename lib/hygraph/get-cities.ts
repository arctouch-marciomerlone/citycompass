import { contentGraphql } from "@/lib/hygraph/client";
import { CacheTag } from "@/lib/hygraph/enumerations";
import { parseCitySummaries } from "@/lib/hygraph/parse";
import { CITIES_QUERY } from "@/lib/hygraph/queries";
import type { CitySummary } from "@/lib/hygraph/types";
import { type Locale, localesForQuery } from "@/lib/locale";

export async function getCities(locale: Locale): Promise<CitySummary[]> {
  const data = await contentGraphql(CITIES_QUERY, {
    variables: {
      locales: [...localesForQuery(locale)],
    },
    tags: [CacheTag.City],
  });
  return parseCitySummaries(data["cities"]);
}
