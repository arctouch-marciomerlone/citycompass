import { contentGraphql } from "@/lib/hygraph/client";
import { CacheTag } from "@/lib/hygraph/enumerations";
import { parseCity } from "@/lib/hygraph/parse";
import { CITY_PAGE_QUERY } from "@/lib/hygraph/queries";
import type { CityView } from "@/lib/hygraph/types";
import { type Locale, localesForQuery } from "@/lib/locale";

export async function getCity(options: {
  readonly slug: string;
  readonly locale: Locale;
}): Promise<CityView | undefined> {
  const data = await contentGraphql(CITY_PAGE_QUERY, {
    variables: {
      slug: options.slug,
      locales: [...localesForQuery(options.locale)],
    },
    tags: [CacheTag.City],
  });
  return parseCity(data["city"]);
}
