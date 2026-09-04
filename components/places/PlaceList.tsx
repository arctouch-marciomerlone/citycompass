import { PlaceCard } from "@/components/places/PlaceCard";
import type { PlaceCardView } from "@/lib/hygraph/types";
import type { Locale } from "@/lib/locale";

export function PlaceList({
  locale,
  citySlug,
  places,
  emptyLabel,
}: {
  readonly locale: Locale;
  readonly citySlug: string;
  readonly places: readonly PlaceCardView[];
  readonly emptyLabel: string;
}) {
  if (places.length === 0) {
    return <p>{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <li key={place.id}>
          <PlaceCard locale={locale} citySlug={citySlug} place={place} />
        </li>
      ))}
    </ul>
  );
}
