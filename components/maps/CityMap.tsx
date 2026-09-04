"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ExternalLinkIcon } from "@/components/icons/ExternalLinkIcon";
import { MapFallback } from "@/components/maps/MapFallback";
import type { LocationValue, PlaceCardView } from "@/lib/hygraph/types";
import type { UiMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import { mapsViewUrl } from "@/lib/maps/directions";

export interface CityMapProps {
  readonly locale: Locale;
  readonly citySlug: string;
  readonly apiKey: string | undefined;
  readonly mapId: string | undefined;
  readonly center: LocationValue;
  readonly places: readonly PlaceCardView[];
  readonly heading: string | undefined;
  readonly messages: UiMessages;
  readonly initialZoom: number | undefined;
}

interface MapsNamespace {
  readonly maps: {
    Map: new (
      element: HTMLElement,
      options: {
        center: { lat: number; lng: number };
        zoom: number;
        mapId?: string;
      },
    ) => { setCenter: (latLng: { lat: number; lng: number }) => void };
    marker?: {
      AdvancedMarkerElement: new (options: {
        map: unknown;
        position: { lat: number; lng: number };
        title: string;
      }) => { addListener: (event: string, handler: () => void) => void };
    };
    Marker: new (options: {
      map: unknown;
      position: { lat: number; lng: number };
      title: string;
    }) => { addListener: (event: string, handler: () => void) => void };
  };
}

function getGlobal(name: string): unknown {
  return Reflect.get(window, name);
}

function setGlobal(name: string, value: unknown): void {
  Reflect.set(window, name, value);
}

function isMapsNamespace(value: unknown): value is MapsNamespace {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("maps" in value)) {
    return false;
  }
  const maps = Reflect.get(value, "maps");
  return (
    typeof maps === "object" &&
    maps !== null &&
    "Map" in maps &&
    "Marker" in maps
  );
}

function loadMapsScript(
  apiKey: string,
  callbackName: string,
): Promise<MapsNamespace> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[data-citycompass-maps="true"]',
    );
    const loaded = getGlobal("google");
    if (isMapsNamespace(loaded)) {
      resolve(loaded);
      return;
    }

    setGlobal(callbackName, () => {
      const google = getGlobal("google");
      if (isMapsNamespace(google)) {
        resolve(google);
        return;
      }
      reject(new Error("Google Maps loaded without maps namespace"));
    });

    if (existing !== null) {
      return;
    }

    const script = document.createElement("script");
    script.setAttribute("data-citycompass-maps", "true");
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${encodeURIComponent(callbackName)}&libraries=marker&loading=async`;
    script.addEventListener("error", () => {
      reject(new Error("Google Maps script failed to load"));
    });
    document.head.appendChild(script);
  });
}

export function CityMap({
  locale,
  citySlug,
  apiKey,
  mapId,
  center,
  places,
  heading,
  messages,
  initialZoom,
}: CityMapProps) {
  const mapNode = useRef<HTMLDivElement>(null);
  const callbackId = useId().replaceAll(":", "");
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(
    undefined,
  );
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (apiKey === undefined || mapNode.current === null) {
      return;
    }
    const element = mapNode.current;
    let cancelled = false;

    void loadMapsScript(apiKey, `citycompassMapsReady${callbackId}`)
      .then((google) => {
        if (cancelled) {
          return;
        }
        const map = new google.maps.Map(element, {
          center: { lat: center.latitude, lng: center.longitude },
          zoom: initialZoom ?? 12,
          mapId,
        });
        for (const place of places) {
          const position = {
            lat: place.location.latitude,
            lng: place.location.longitude,
          };
          const onSelect = () => {
            setSelectedSlug(place.slug);
            const listItem = document.getElementById(`place-${place.slug}`);
            listItem?.scrollIntoView({ block: "nearest" });
          };
          const advanced = google.maps.marker?.AdvancedMarkerElement;
          if (mapId !== undefined && advanced !== undefined) {
            const marker = new advanced({
              map,
              position,
              title: place.name,
            });
            marker.addListener("click", onSelect);
          } else {
            const marker = new google.maps.Marker({
              map,
              position,
              title: place.name,
            });
            marker.addListener("click", onSelect);
          }
        }
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "maps load failed";
        console.error(message);
        setMapFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [
    apiKey,
    callbackId,
    center.latitude,
    center.longitude,
    initialZoom,
    mapId,
    places,
  ]);

  const title = heading ?? messages.mapListHeading;
  const showLiveMap = apiKey !== undefined && !mapFailed;
  const mapsUrl = mapsViewUrl({
    latitude: center.latitude,
    longitude: center.longitude,
    zoom: initialZoom,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-medium">{title}</h2>
      {showLiveMap ? (
        <div
          ref={mapNode}
          className="h-80 w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
          role="region"
          aria-label={title}
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm dark:border-zinc-700">
          <p>
            {messages.mapPlaceholder}
            {mapsUrl !== undefined ? (
              <>
                {" "}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  <span className="underline">{messages.openInGoogleMaps}</span>
                  <ExternalLinkIcon />
                  <span className="sr-only">{messages.opensInNewTab}</span>
                </a>
              </>
            ) : null}
          </p>
        </div>
      )}
      <MapFallback
        locale={locale}
        citySlug={citySlug}
        places={places}
        messages={messages}
        selectedSlug={selectedSlug}
      />
    </section>
  );
}
