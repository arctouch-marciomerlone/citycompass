import { notFound } from "next/navigation";

import { PlaceFilters } from "@/components/places/PlaceFilters";
import { PlaceList } from "@/components/places/PlaceList";
import { getPlaceFilters } from "@/lib/hygraph/get-filters";
import { getPlaces } from "@/lib/hygraph/get-places";
import { getUiMessages } from "@/lib/i18n/messages";
import { isLocale } from "@/lib/locale";

function firstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }
  if (Array.isArray(value)) {
    const first = value[0];
    return first !== undefined && first.length > 0 ? first : undefined;
  }
  return undefined;
}

export default async function PlacesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/[city]/places">) {
  const { locale: localeParam, city: citySlug } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const query = await searchParams;
  const categorySlug = firstQueryValue(query["category"]);
  const neighborhoodSlug = firstQueryValue(query["neighborhood"]);
  const [places, filters] = await Promise.all([
    getPlaces({
      citySlug,
      locale,
      categorySlug,
      neighborhoodSlug,
    }),
    getPlaceFilters({ citySlug, locale }),
  ]);
  const messages = getUiMessages(locale);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        {messages.placesHeading}
      </h1>
      <PlaceFilters
        locale={locale}
        citySlug={citySlug}
        messages={messages}
        categories={filters.categories}
        neighborhoods={filters.neighborhoods}
        selectedCategory={categorySlug}
        selectedNeighborhood={neighborhoodSlug}
      />
      <PlaceList
        locale={locale}
        citySlug={citySlug}
        places={places}
        emptyLabel={messages.emptyPlaces}
      />
    </main>
  );
}
