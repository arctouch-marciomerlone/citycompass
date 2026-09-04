import { notFound } from "next/navigation";

import { CityMap } from "@/components/maps/CityMap";
import { getCity } from "@/lib/hygraph/get-city";
import { getPlaces } from "@/lib/hygraph/get-places";
import { getUiMessages } from "@/lib/i18n/messages";
import { isLocale } from "@/lib/locale";
import { readPublicMapsConfig } from "@/lib/maps/public-config";

export default async function MapPage({
  params,
}: PageProps<"/[locale]/[city]/map">) {
  const { locale: localeParam, city: citySlug } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const [city, places] = await Promise.all([
    getCity({ slug: citySlug, locale }),
    getPlaces({ citySlug, locale }),
  ]);
  if (city === undefined) {
    notFound();
  }
  const maps = readPublicMapsConfig();
  const messages = getUiMessages(locale);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        {messages.navMap}
      </h1>
      <CityMap
        locale={locale}
        citySlug={citySlug}
        apiKey={maps.apiKey}
        mapId={maps.mapId}
        center={city.location}
        places={places}
        heading={messages.mapListHeading}
        messages={messages}
        initialZoom={12}
      />
    </main>
  );
}
