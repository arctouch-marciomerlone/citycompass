import type { MetadataRoute } from "next";

import { readSiteUrl } from "@/lib/env";
import { getCities } from "@/lib/hygraph/get-cities";
import { getPlaceSlugs } from "@/lib/hygraph/get-places";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/locale";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = readSiteUrl().replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = [];

  let citySlugs: string[] = [];
  try {
    citySlugs = (await getCities(DEFAULT_LOCALE)).map((city) => city.slug);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "sitemap city query failed";
    console.error(message);
  }

  for (const locale of SUPPORTED_LOCALES) {
    entries.push({
      url: `${origin}/${locale}`,
      changeFrequency: "daily",
      priority: 1,
    });
    for (const citySlug of citySlugs) {
      entries.push({
        url: `${origin}/${locale}/${citySlug}`,
        changeFrequency: "daily",
        priority: 1,
      });
      entries.push({
        url: `${origin}/${locale}/${citySlug}/places`,
        changeFrequency: "daily",
        priority: 0.8,
      });
      entries.push({
        url: `${origin}/${locale}/${citySlug}/map`,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  for (const citySlug of citySlugs) {
    try {
      const slugs = await getPlaceSlugs(citySlug);
      for (const locale of SUPPORTED_LOCALES) {
        for (const slug of slugs) {
          entries.push({
            url: `${origin}/${locale}/${citySlug}/places/${slug}`,
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "sitemap place query failed";
      console.error(message);
    }
  }

  return entries;
}
