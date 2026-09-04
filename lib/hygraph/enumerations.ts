import { defineConstObject, type ValueOf } from "@/lib/types/const-object";

export const IconKey = defineConstObject({
  FoodAndDrink: "FOOD_AND_DRINK",
  Culture: "CULTURE",
  Outdoors: "OUTDOORS",
  Shopping: "SHOPPING",
  HistoricSites: "HISTORIC_SITES",
});

export type IconKey = ValueOf<typeof IconKey>;

const ICON_KEYS = new Set<string>(Object.values(IconKey));

export function isIconKey(value: unknown): value is IconKey {
  return typeof value === "string" && ICON_KEYS.has(value);
}

export const PriceBand = defineConstObject({
  Budget: "BUDGET",
  Moderate: "MODERATE",
  Premium: "PREMIUM",
});

export type PriceBand = ValueOf<typeof PriceBand>;

const PRICE_BANDS = new Set<string>(Object.values(PriceBand));

export function isPriceBand(value: unknown): value is PriceBand {
  return typeof value === "string" && PRICE_BANDS.has(value);
}

export const FeaturedPlacesLayout = defineConstObject({
  Grid: "GRID",
  Carousel: "CAROUSEL",
});

export type FeaturedPlacesLayout = ValueOf<typeof FeaturedPlacesLayout>;

export function isFeaturedPlacesLayout(
  value: unknown,
): value is FeaturedPlacesLayout {
  return (
    value === FeaturedPlacesLayout.Grid ||
    value === FeaturedPlacesLayout.Carousel
  );
}

export const OpeningHoursDay = defineConstObject({
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
  Sunday: "SUNDAY",
});

export type OpeningHoursDay = ValueOf<typeof OpeningHoursDay>;

const OPENING_HOURS_DAYS = new Set<string>(Object.values(OpeningHoursDay));

export function isOpeningHoursDay(value: unknown): value is OpeningHoursDay {
  return typeof value === "string" && OPENING_HOURS_DAYS.has(value);
}

export const SectionTypename = defineConstObject({
  HeroBlock: "HeroBlock",
  RichTextBlock: "RichTextBlock",
  FeaturedPlacesBlock: "FeaturedPlacesBlock",
  WeatherBlock: "WeatherBlock",
  MapBlock: "MapBlock",
  CallToActionBlock: "CallToActionBlock",
});

export type SectionTypename = ValueOf<typeof SectionTypename>;

export const CacheTag = defineConstObject({
  City: "city",
  Place: "place",
  Category: "category",
  Neighborhood: "neighborhood",
  Map: "map",
});

export type CacheTag = ValueOf<typeof CacheTag>;

const CACHE_TAGS = new Set<string>(Object.values(CacheTag));

export function isCacheTag(value: unknown): value is CacheTag {
  return typeof value === "string" && CACHE_TAGS.has(value);
}

export const ContentStage = defineConstObject({
  Draft: "DRAFT",
  Published: "PUBLISHED",
});

export type ContentStage = ValueOf<typeof ContentStage>;
