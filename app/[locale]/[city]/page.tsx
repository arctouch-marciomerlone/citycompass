import Image from "next/image";
import { notFound } from "next/navigation";

import { PageSections } from "@/components/content/PageSections";
import { RichTextHtml } from "@/components/content/RichTextHtml";
import { getCity } from "@/lib/hygraph/get-city";
import { getPlaces } from "@/lib/hygraph/get-places";
import { getUiMessages } from "@/lib/i18n/messages";
import { isLocale } from "@/lib/locale";
import { readPublicMapsConfig } from "@/lib/maps/public-config";
import { fetchCityWeather } from "@/lib/weather/remote-source";

export default async function CityPage({
  params,
}: PageProps<"/[locale]/[city]">) {
  const { locale: localeParam, city: citySlug } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const city = await getCity({ slug: citySlug, locale });
  if (city === undefined) {
    notFound();
  }

  const [featuredFallback, mapPlaces, weather] = await Promise.all([
    getPlaces({ citySlug, locale, featuredOnly: true }),
    getPlaces({ citySlug, locale }),
    fetchCityWeather({
      slug: citySlug,
      locale,
      latitude: city.location.latitude,
      longitude: city.location.longitude,
      timezone: city.timezone,
    }),
  ]);
  const maps = readPublicMapsConfig();
  const messages = getUiMessages(locale);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">{city.name}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {city.country}
        </p>
        <div className="relative aspect-[21/9] overflow-hidden rounded-lg">
          <Image
            src={city.heroImage.url}
            alt={city.name}
            fill
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="object-cover"
          />
        </div>
        <RichTextHtml html={city.introHtml} />
      </section>
      <PageSections
        locale={locale}
        city={city}
        featuredFallback={featuredFallback}
        weather={weather}
        mapPlaces={mapPlaces}
        mapApiKey={maps.apiKey}
        mapId={maps.mapId}
        messages={messages}
      />
    </main>
  );
}
