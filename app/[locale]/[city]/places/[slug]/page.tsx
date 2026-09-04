import Image from "next/image";
import { notFound } from "next/navigation";

import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { RichTextHtml } from "@/components/content/RichTextHtml";
import { formatVerifiedDate } from "@/lib/datetime";
import type { OpeningHoursDay, PriceBand } from "@/lib/hygraph/enumerations";
import { getPlace } from "@/lib/hygraph/get-place";
import { getUiMessages } from "@/lib/i18n/messages";
import { isLocale, type Locale } from "@/lib/locale";
import { directionsUrl } from "@/lib/maps/directions";

const PRICE_LABELS: Record<
  Locale,
  Record<
    | typeof PriceBand.Budget
    | typeof PriceBand.Moderate
    | typeof PriceBand.Premium,
    string
  >
> = {
  en_US: { BUDGET: "Budget", MODERATE: "Moderate", PREMIUM: "Premium" },
  pt_BR: { BUDGET: "Econômico", MODERATE: "Moderado", PREMIUM: "Premium" },
  zh_CN: { BUDGET: "实惠", MODERATE: "中等", PREMIUM: "高端" },
};

const DAY_LABELS: Record<
  Locale,
  Record<(typeof OpeningHoursDay)[keyof typeof OpeningHoursDay], string>
> = {
  en_US: {
    MONDAY: "Monday",
    TUESDAY: "Tuesday",
    WEDNESDAY: "Wednesday",
    THURSDAY: "Thursday",
    FRIDAY: "Friday",
    SATURDAY: "Saturday",
    SUNDAY: "Sunday",
  },
  pt_BR: {
    MONDAY: "Segunda",
    TUESDAY: "Terça",
    WEDNESDAY: "Quarta",
    THURSDAY: "Quinta",
    FRIDAY: "Sexta",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
  },
  zh_CN: {
    MONDAY: "星期一",
    TUESDAY: "星期二",
    WEDNESDAY: "星期三",
    THURSDAY: "星期四",
    FRIDAY: "星期五",
    SATURDAY: "星期六",
    SUNDAY: "星期日",
  },
};

export default async function PlaceDetailPage({
  params,
}: PageProps<"/[locale]/[city]/places/[slug]">) {
  const { locale: localeParam, city: citySlug, slug } = await params;
  if (!isLocale(localeParam)) {
    notFound();
  }
  const locale = localeParam;
  const place = await getPlace({
    citySlug,
    locale,
    slug,
  });
  if (place === undefined) {
    notFound();
  }
  const messages = getUiMessages(locale);
  const directions = directionsUrl({
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    googlePlaceId: place.googlePlaceId,
  });
  const hero = place.images[0];

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-3xl font-semibold tracking-tight">{place.name}</h1>
      {hero !== undefined ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={hero.url}
            alt={place.name}
            fill
            priority
            sizes="(min-width: 1024px) 64rem, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        {place.summary}
      </p>
      <RichTextHtml html={place.descriptionHtml} />
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium">{messages.address}</dt>
          <dd>{place.address}</dd>
        </div>
        {place.neighborhood !== undefined ? (
          <div>
            <dt className="font-medium">{messages.neighborhood}</dt>
            <dd>{place.neighborhood.name}</dd>
          </div>
        ) : null}
        {place.phone !== undefined ? (
          <div>
            <dt className="font-medium">{messages.phone}</dt>
            <dd>{place.phone}</dd>
          </div>
        ) : null}
        {place.websiteUrl !== undefined ? (
          <div>
            <dt className="font-medium">{messages.website}</dt>
            <dd>
              <a href={place.websiteUrl} rel="noreferrer" className="underline">
                {place.websiteUrl}
              </a>
            </dd>
          </div>
        ) : null}
        {place.priceBand !== undefined ? (
          <div>
            <dt className="font-medium">{messages.priceBand}</dt>
            <dd>{PRICE_LABELS[locale][place.priceBand]}</dd>
          </div>
        ) : null}
        {place.lastVerified !== undefined ? (
          <div>
            <dt className="font-medium">{messages.lastVerified}</dt>
            <dd>
              {formatVerifiedDate(
                place.lastVerified,
                place.cityTimezone,
                locale,
              )}
            </dd>
          </div>
        ) : null}
      </dl>
      <div>
        <h2 className="text-sm font-medium">{messages.categories}</h2>
        <ul className="mt-2 flex flex-wrap gap-2 text-sm">
          {place.categories.map((category) => (
            <li key={category.slug} className="flex items-center gap-1">
              <CategoryIcon iconKey={category.iconKey} label={category.name} />
              {category.name}
            </li>
          ))}
        </ul>
      </div>
      {place.openingHours.length > 0 ? (
        <section>
          <h2 className="text-sm font-medium">{messages.openingHours}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {place.openingHours.map((row) => (
              <li key={row.day}>
                {DAY_LABELS[locale][row.day]}
                {": "}
                {row.closed
                  ? messages.closed
                  : `${row.opensAt ?? ""}–${row.closesAt ?? ""}`}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {place.accessibilityNotesHtml !== undefined ? (
        <RichTextHtml html={place.accessibilityNotesHtml} />
      ) : null}
      {directions !== undefined ? (
        <a href={directions} rel="noreferrer" className="underline">
          {messages.directions}
        </a>
      ) : null}
    </main>
  );
}
