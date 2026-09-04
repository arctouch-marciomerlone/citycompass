import Image from "next/image";
import Link from "next/link";

import { RichTextHtml } from "@/components/content/RichTextHtml";
import { PlaceCard } from "@/components/places/PlaceCard";
import { CityMap } from "@/components/maps/CityMap";
import { WeatherPanel } from "@/components/weather/WeatherPanel";
import {
  FeaturedPlacesLayout,
  SectionTypename,
} from "@/lib/hygraph/enumerations";
import type {
  CityView,
  MapBlockView,
  PageSectionView,
  PlaceCardView,
  WeatherBlockView,
} from "@/lib/hygraph/types";
import type { UiMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import { mapPath, editorialPlacesHref, isAppRoute } from "@/lib/routes";
import type { WeatherViewModel } from "@/lib/weather/types";

function FeaturedPlaces({
  locale,
  citySlug,
  heading,
  layout,
  places,
}: {
  readonly locale: Locale;
  readonly citySlug: string;
  readonly heading: string | undefined;
  readonly layout: string;
  readonly places: readonly PlaceCardView[];
}) {
  const listClass =
    layout === FeaturedPlacesLayout.Carousel
      ? "flex gap-4 overflow-x-auto pb-2"
      : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";
  const itemClass =
    layout === FeaturedPlacesLayout.Carousel ? "min-w-[16rem]" : "";

  return (
    <section className="space-y-4">
      {heading !== undefined ? (
        <h2 className="text-xl font-medium">{heading}</h2>
      ) : null}
      <ul className={listClass}>
        {places.map((place) => (
          <li key={place.id} className={itemClass}>
            <PlaceCard locale={locale} citySlug={citySlug} place={place} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PageSections({
  locale,
  city,
  featuredFallback,
  weather,
  mapPlaces,
  mapApiKey,
  mapId,
  messages,
}: {
  readonly locale: Locale;
  readonly city: CityView;
  readonly featuredFallback: readonly PlaceCardView[];
  readonly weather: WeatherViewModel | undefined;
  readonly mapPlaces: readonly PlaceCardView[];
  readonly mapApiKey: string | undefined;
  readonly mapId: string | undefined;
  readonly messages: UiMessages;
}) {
  const hasWeatherBlock = city.pageSections.some(
    (section) => section.__typename === SectionTypename.WeatherBlock,
  );
  const hasMapBlock = city.pageSections.some(
    (section) => section.__typename === SectionTypename.MapBlock,
  );

  return (
    <div className="space-y-10">
      {city.pageSections.map((section, index) => (
        <SectionView
          key={`${section.__typename}-${String(index)}`}
          locale={locale}
          section={section}
          featuredFallback={featuredFallback}
          weather={weather}
          mapPlaces={mapPlaces}
          city={city}
          mapApiKey={mapApiKey}
          mapId={mapId}
          messages={messages}
        />
      ))}
      {hasWeatherBlock ? null : (
        <WeatherPanel
          locale={locale}
          heading={undefined}
          showCurrent
          weather={weather}
          messages={messages}
        />
      )}
      {hasMapBlock ? null : (
        <p>
          <Link href={mapPath(locale, city.slug)} className="underline">
            {messages.navMap}
          </Link>
        </p>
      )}
    </div>
  );
}

function SectionView({
  locale,
  section,
  featuredFallback,
  weather,
  mapPlaces,
  city,
  mapApiKey,
  mapId,
  messages,
}: {
  readonly locale: Locale;
  readonly section: PageSectionView;
  readonly featuredFallback: readonly PlaceCardView[];
  readonly weather: WeatherViewModel | undefined;
  readonly mapPlaces: readonly PlaceCardView[];
  readonly city: CityView;
  readonly mapApiKey: string | undefined;
  readonly mapId: string | undefined;
  readonly messages: UiMessages;
}) {
  if (section.__typename === SectionTypename.HeroBlock) {
    return (
      <section className="space-y-3">
        {section.eyebrow !== undefined ? (
          <p className="text-sm tracking-wide text-zinc-600 uppercase dark:text-zinc-400">
            {section.eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold">{section.heading}</h2>
        {section.bodyHtml !== undefined ? (
          <RichTextHtml html={section.bodyHtml} />
        ) : null}
        {section.image !== undefined ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            <Image
              src={section.image.url}
              alt={section.heading}
              fill
              sizes="(min-width: 1024px) 64rem, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
        {section.callToActionLabel !== undefined &&
        section.callToActionUrl !== undefined ? (
          <EditorialHref
            href={section.callToActionUrl}
            locale={locale}
            citySlug={city.slug}
            className="inline-block underline"
          >
            {section.callToActionLabel}
          </EditorialHref>
        ) : null}
      </section>
    );
  }

  if (section.__typename === SectionTypename.RichTextBlock) {
    return (
      <section className="space-y-3">
        {section.heading !== undefined ? (
          <h2 className="text-xl font-medium">{section.heading}</h2>
        ) : null}
        {section.bodyHtml !== undefined ? (
          <RichTextHtml html={section.bodyHtml} />
        ) : null}
      </section>
    );
  }

  if (section.__typename === SectionTypename.FeaturedPlacesBlock) {
    const places =
      section.places.length > 0 ? section.places : featuredFallback;
    return (
      <FeaturedPlaces
        locale={locale}
        citySlug={city.slug}
        heading={section.heading ?? messages.featuredFallback}
        layout={section.layout}
        places={places}
      />
    );
  }

  if (section.__typename === SectionTypename.WeatherBlock) {
    const weatherSection: WeatherBlockView = section;
    return (
      <WeatherPanel
        locale={locale}
        heading={weatherSection.heading}
        showCurrent={weatherSection.showCurrent}
        weather={weather}
        messages={messages}
      />
    );
  }

  if (section.__typename === SectionTypename.MapBlock) {
    const mapSection: MapBlockView = section;
    const places = mapSection.showFeaturedOnly
      ? mapPlaces.filter((place) => place.isFeatured)
      : mapPlaces;
    return (
      <div className="space-y-3">
        <CityMap
          locale={locale}
          citySlug={city.slug}
          apiKey={mapApiKey}
          mapId={mapId}
          center={city.location}
          places={places}
          heading={mapSection.heading}
          messages={messages}
          initialZoom={mapSection.initialZoom}
        />
        <p>
          <Link href={mapPath(locale, city.slug)} className="underline">
            {messages.navMap}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      {section.heading !== undefined ? (
        <h2 className="text-xl font-medium">{section.heading}</h2>
      ) : null}
      {section.bodyHtml !== undefined ? (
        <RichTextHtml html={section.bodyHtml} />
      ) : null}
      {section.label !== undefined && section.url !== undefined ? (
        <EditorialHref
          href={section.url}
          locale={locale}
          citySlug={city.slug}
          className="mt-2 inline-block underline"
        >
          {section.label}
        </EditorialHref>
      ) : null}
    </section>
  );
}

function EditorialHref({
  href,
  locale,
  citySlug,
  className,
  children,
}: {
  readonly href: string;
  readonly locale: Locale;
  readonly citySlug: string;
  readonly className: string;
  readonly children: string;
}) {
  const nextHref = editorialPlacesHref(href, locale, citySlug);
  if (isAppRoute(nextHref)) {
    return (
      <Link href={nextHref} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <a href={nextHref} className={className}>
      {children}
    </a>
  );
}
