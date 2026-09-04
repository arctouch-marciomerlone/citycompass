import {
  isRecord,
  isString,
  readBoolean,
  readNumber,
  readRecord,
  readString,
  readUnknownArray,
} from "@/lib/guards";
import {
  FeaturedPlacesLayout,
  isFeaturedPlacesLayout,
  isIconKey,
  isOpeningHoursDay,
  isPriceBand,
  SectionTypename,
} from "@/lib/hygraph/enumerations";
import type {
  AssetView,
  CategoryView,
  CitySummary,
  CityView,
  LocationValue,
  NeighborhoodView,
  OpeningHoursView,
  PageSectionView,
  PlaceCardView,
  PlaceDetailView,
  SeoView,
} from "@/lib/hygraph/types";
import { httpUrlOrUndefined } from "@/lib/url";
import { isValidLatitude, isValidLongitude } from "@/lib/maps/directions";

function parseLocation(value: unknown): LocationValue | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const latitude = readNumber(value, "latitude");
  const longitude = readNumber(value, "longitude");
  if (latitude === undefined || longitude === undefined) {
    return undefined;
  }
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return undefined;
  }
  return { latitude, longitude };
}

function parseAsset(value: unknown): AssetView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const url = httpUrlOrUndefined(readString(value, "url"));
  if (url === undefined) {
    return undefined;
  }
  return {
    url,
    width: readNumber(value, "width"),
    height: readNumber(value, "height"),
  };
}

function parseRichTextHtml(value: unknown): string | undefined {
  const record = isRecord(value) ? value : undefined;
  if (record === undefined) {
    return undefined;
  }
  const html = readString(record, "html");
  return html !== undefined && html.trim() !== "" ? html : undefined;
}

function parseSeo(value: unknown): SeoView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return {
    title: readString(value, "title"),
    description: readString(value, "description"),
    noIndex: readBoolean(value, "noIndex") === true,
    image: parseAsset(value["image"]),
  };
}

function parseCategory(value: unknown): CategoryView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const slug = readString(value, "slug");
  const name = readString(value, "name");
  const iconKey = value["iconKey"];
  if (slug === undefined || name === undefined || !isIconKey(iconKey)) {
    return undefined;
  }
  return {
    slug,
    name,
    iconKey,
    sortOrder: readNumber(value, "sortOrder"),
  };
}

function parseNeighborhood(value: unknown): NeighborhoodView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const slug = readString(value, "slug");
  const name = readString(value, "name");
  if (slug === undefined || name === undefined) {
    return undefined;
  }
  return { slug, name };
}

export function parsePlaceCard(value: unknown): PlaceCardView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const id = readString(value, "id");
  const slug = readString(value, "slug");
  const name = readString(value, "name");
  const summary = readString(value, "summary");
  const address = readString(value, "address");
  const location = parseLocation(value["location"]);
  const isFeatured = readBoolean(value, "isFeatured");
  if (
    id === undefined ||
    slug === undefined ||
    name === undefined ||
    summary === undefined ||
    address === undefined ||
    location === undefined ||
    isFeatured === undefined
  ) {
    return undefined;
  }

  const images: AssetView[] = [];
  const imageItems = readUnknownArray(value, "images") ?? [];
  for (const item of imageItems) {
    const asset = parseAsset(item);
    if (asset !== undefined) {
      images.push(asset);
    }
  }

  const categories: CategoryView[] = [];
  const categoryItems = readUnknownArray(value, "categories") ?? [];
  for (const item of categoryItems) {
    const category = parseCategory(item);
    if (category !== undefined) {
      categories.push(category);
    }
  }

  const googlePlaceId = readString(value, "googlePlaceId");
  const priceBandValue = value["priceBand"];

  return {
    id,
    slug,
    name,
    summary,
    address,
    priceBand: isPriceBand(priceBandValue) ? priceBandValue : undefined,
    isFeatured,
    googlePlaceId:
      googlePlaceId !== undefined && googlePlaceId.trim() !== ""
        ? googlePlaceId
        : undefined,
    location,
    images,
    categories,
    neighborhood: parseNeighborhood(value["neighborhood"]),
  };
}

function parseOpeningHours(value: unknown): OpeningHoursView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const day = value["day"];
  const closed = readBoolean(value, "closed");
  if (!isOpeningHoursDay(day) || closed === undefined) {
    return undefined;
  }
  return {
    day,
    closed,
    opensAt: readString(value, "opensAt"),
    closesAt: readString(value, "closesAt"),
  };
}

function parseHeroBlock(
  record: Record<string, unknown>,
): PageSectionView | undefined {
  const heading = readString(record, "heading");
  if (heading === undefined) {
    return undefined;
  }
  return {
    __typename: SectionTypename.HeroBlock,
    eyebrow: readString(record, "eyebrow"),
    heading,
    bodyHtml: parseRichTextHtml(record["body"]),
    callToActionLabel: readString(record, "callToActionLabel"),
    callToActionUrl: httpUrlOrUndefined(readString(record, "callToActionUrl")),
    image: parseAsset(record["image"]),
  };
}

function parseRichTextBlock(
  record: Record<string, unknown>,
): PageSectionView | undefined {
  return {
    __typename: SectionTypename.RichTextBlock,
    heading: readString(record, "heading"),
    bodyHtml: parseRichTextHtml(record["body"]),
  };
}

function parseFeaturedPlacesBlock(
  record: Record<string, unknown>,
): PageSectionView | undefined {
  const layoutValue = record["layout"];
  const places: PlaceCardView[] = [];
  const placeItems = readUnknownArray(record, "places") ?? [];
  for (const item of placeItems) {
    const place = parsePlaceCard(item);
    if (place !== undefined) {
      places.push(place);
    }
  }
  return {
    __typename: SectionTypename.FeaturedPlacesBlock,
    heading: readString(record, "heading"),
    layout: isFeaturedPlacesLayout(layoutValue)
      ? layoutValue
      : FeaturedPlacesLayout.Grid,
    places,
  };
}

function parseWeatherBlock(record: Record<string, unknown>): PageSectionView {
  return {
    __typename: SectionTypename.WeatherBlock,
    heading: readString(record, "heading"),
    showCurrent: readBoolean(record, "showCurrent") !== false,
  };
}

function parseMapBlock(record: Record<string, unknown>): PageSectionView {
  return {
    __typename: SectionTypename.MapBlock,
    heading: readString(record, "heading"),
    initialZoom: readNumber(record, "initialZoom"),
    showFeaturedOnly: readBoolean(record, "showFeaturedOnly") === true,
  };
}

function parseCallToActionBlock(
  record: Record<string, unknown>,
): PageSectionView | undefined {
  return {
    __typename: SectionTypename.CallToActionBlock,
    heading: readString(record, "heading"),
    bodyHtml: parseRichTextHtml(record["body"]),
    label: readString(record, "label"),
    url: httpUrlOrUndefined(readString(record, "url")),
  };
}

function parsePageSection(value: unknown): PageSectionView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const typename = readString(value, "__typename");
  if (typename === SectionTypename.HeroBlock) {
    return parseHeroBlock(value);
  }
  if (typename === SectionTypename.RichTextBlock) {
    return parseRichTextBlock(value);
  }
  if (typename === SectionTypename.FeaturedPlacesBlock) {
    return parseFeaturedPlacesBlock(value);
  }
  if (typename === SectionTypename.WeatherBlock) {
    return parseWeatherBlock(value);
  }
  if (typename === SectionTypename.MapBlock) {
    return parseMapBlock(value);
  }
  if (typename === SectionTypename.CallToActionBlock) {
    return parseCallToActionBlock(value);
  }
  console.error(
    `Unknown page section type: ${typename ?? "missing __typename"}`,
  );
  return undefined;
}

export function parseCity(value: unknown): CityView | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const slug = readString(value, "slug");
  const name = readString(value, "name");
  const country = readString(value, "country");
  const timezone = readString(value, "timezone");
  const introHtml = parseRichTextHtml(value["intro"]);
  const location = parseLocation(value["location"]);
  const heroImage = parseAsset(value["heroImage"]);
  if (
    slug === undefined ||
    name === undefined ||
    country === undefined ||
    timezone === undefined ||
    introHtml === undefined ||
    location === undefined ||
    heroImage === undefined
  ) {
    return undefined;
  }

  const pageSections: PageSectionView[] = [];
  const sectionItems = readUnknownArray(value, "pageSections") ?? [];
  for (const item of sectionItems) {
    const section = parsePageSection(item);
    if (section !== undefined) {
      pageSections.push(section);
    }
  }

  return {
    slug,
    name,
    country,
    timezone,
    introHtml,
    location,
    heroImage,
    seo: parseSeo(value["seo"]),
    pageSections,
  };
}

export function parsePlaceCards(value: unknown): PlaceCardView[] {
  const items = Array.isArray(value) ? value : [];
  const places: PlaceCardView[] = [];
  for (const item of items) {
    const place = parsePlaceCard(item);
    if (place !== undefined) {
      places.push(place);
    }
  }
  return places;
}

export function parsePlaceDetail(value: unknown): PlaceDetailView | undefined {
  const card = parsePlaceCard(value);
  if (card === undefined || !isRecord(value)) {
    return undefined;
  }
  const descriptionHtml = parseRichTextHtml(value["description"]);
  const city = readRecord(value, "city");
  const citySlug = city === undefined ? undefined : readString(city, "slug");
  const cityTimezone =
    city === undefined ? undefined : readString(city, "timezone");
  if (
    descriptionHtml === undefined ||
    citySlug === undefined ||
    cityTimezone === undefined
  ) {
    return undefined;
  }

  const hours: OpeningHoursView[] = [];
  const hourItems = readUnknownArray(value, "openingHours") ?? [];
  for (const item of hourItems) {
    const row = parseOpeningHours(item);
    if (row !== undefined) {
      hours.push(row);
    }
  }

  return {
    ...card,
    descriptionHtml,
    accessibilityNotesHtml: parseRichTextHtml(value["accessibilityNotes"]),
    phone: readString(value, "phone"),
    websiteUrl: httpUrlOrUndefined(readString(value, "websiteUrl")),
    lastVerified: readString(value, "lastVerified"),
    openingHours: hours,
    seo: parseSeo(value["seo"]),
    citySlug,
    cityTimezone,
  };
}

export function parseCategories(value: unknown): CategoryView[] {
  const items = Array.isArray(value) ? value : [];
  const categories: CategoryView[] = [];
  for (const item of items) {
    const category = parseCategory(item);
    if (category !== undefined) {
      categories.push(category);
    }
  }
  return categories;
}

export function parseNeighborhoods(value: unknown): NeighborhoodView[] {
  const items = Array.isArray(value) ? value : [];
  const neighborhoods: NeighborhoodView[] = [];
  for (const item of items) {
    const neighborhood = parseNeighborhood(item);
    if (neighborhood !== undefined) {
      neighborhoods.push(neighborhood);
    }
  }
  return neighborhoods;
}

export function parseSlugs(value: unknown): string[] {
  const items = Array.isArray(value) ? value : [];
  const slugs: string[] = [];
  for (const item of items) {
    if (isRecord(item) && isString(item["slug"])) {
      slugs.push(item["slug"]);
    }
  }
  return slugs;
}

export function parseCitySummaries(value: unknown): CitySummary[] {
  const items = Array.isArray(value) ? value : [];
  const cities: CitySummary[] = [];
  for (const item of items) {
    if (!isRecord(item)) {
      continue;
    }
    const slug = readString(item, "slug");
    const name = readString(item, "name");
    if (slug === undefined || name === undefined) {
      continue;
    }
    cities.push({ slug, name });
  }
  return cities;
}
