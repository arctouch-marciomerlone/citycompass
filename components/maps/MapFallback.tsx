import Link from "next/link";

import { directionsUrl } from "@/lib/maps/directions";
import type { PlaceCardView } from "@/lib/hygraph/types";
import type { UiMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import { placePath } from "@/lib/routes";

export function MapFallback({
  locale,
  citySlug,
  places,
  messages,
  selectedSlug,
}: {
  readonly locale: Locale;
  readonly citySlug: string;
  readonly places: readonly PlaceCardView[];
  readonly messages: UiMessages;
  readonly selectedSlug?: string;
}) {
  if (places.length === 0) {
    return <p>{messages.emptyPlaces}</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {places.map((place) => {
        const directions = directionsUrl({
          latitude: place.location.latitude,
          longitude: place.location.longitude,
          googlePlaceId: place.googlePlaceId,
        });
        const selected = selectedSlug === place.slug;
        return (
          <li
            key={place.id}
            id={`place-${place.slug}`}
            className={selected ? "bg-zinc-50 py-3 dark:bg-zinc-900" : "py-3"}
          >
            <Link
              href={placePath(locale, citySlug, place.slug)}
              className="font-medium"
            >
              {place.name}
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {place.summary}
            </p>
            <p className="text-sm">{place.address}</p>
            {directions !== undefined ? (
              <a
                href={directions}
                rel="noreferrer"
                className="text-sm underline"
              >
                {messages.directions}
              </a>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
