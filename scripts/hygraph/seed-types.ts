import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  defineConstObject,
  type ValueOf,
} from "../../lib/types/const-object.ts";
import { LocaleApiId } from "../../hygraph/schema/constants.ts";

export const IconKey = defineConstObject({
  FoodAndDrink: "FOOD_AND_DRINK",
  Culture: "CULTURE",
  Outdoors: "OUTDOORS",
  Shopping: "SHOPPING",
  HistoricSites: "HISTORIC_SITES",
});

export type IconKey = ValueOf<typeof IconKey>;

export const PriceBand = defineConstObject({
  Budget: "BUDGET",
  Moderate: "MODERATE",
  Premium: "PREMIUM",
});

export type PriceBand = ValueOf<typeof PriceBand>;

export const SectionTypename = defineConstObject({
  HeroBlock: "HeroBlock",
  RichTextBlock: "RichTextBlock",
  FeaturedPlacesBlock: "FeaturedPlacesBlock",
  WeatherBlock: "WeatherBlock",
  MapBlock: "MapBlock",
  CallToActionBlock: "CallToActionBlock",
});

export type SectionTypename = ValueOf<typeof SectionTypename>;

export interface LocalizedText {
  readonly en_US: string;
  readonly pt_BR: string;
  readonly zh_CN: string;
}

export interface LocationFixture {
  readonly latitude: number;
  readonly longitude: number;
}

export interface AssetFixture {
  readonly id: string;
  readonly fileName: string;
  readonly uploadUrl: string;
  readonly sourceUrl: string;
  readonly license: string;
  readonly licenseUrl: string;
  readonly attribution: string;
}

export interface CategoryFixture {
  readonly slug: string;
  readonly iconKey: IconKey;
  readonly sortOrder: number;
  readonly name: LocalizedText;
  readonly description: LocalizedText;
}

export interface SeoFixture {
  readonly title: LocalizedText;
  readonly description: LocalizedText;
}

export interface CitySectionsFixture {
  readonly hero: {
    readonly eyebrow: LocalizedText;
    readonly heading: LocalizedText;
    readonly body: LocalizedText;
    readonly callToActionLabel: LocalizedText;
  };
  readonly richText: {
    readonly heading: LocalizedText;
    readonly body: LocalizedText;
  };
  readonly featured: { readonly heading: LocalizedText };
  readonly weather: { readonly heading: LocalizedText };
  readonly map: { readonly heading: LocalizedText };
  readonly cta: {
    readonly heading: LocalizedText;
    readonly body: LocalizedText;
    readonly label: LocalizedText;
  };
}

export interface CityFixture {
  readonly slug: string;
  readonly country: string;
  readonly timezone: string;
  readonly location: LocationFixture;
  readonly heroAssetId: string;
  readonly featuredPlaceSlugs: readonly string[];
  readonly name: LocalizedText;
  readonly intro: LocalizedText;
  readonly seo: SeoFixture;
  readonly sections: CitySectionsFixture;
}

export interface NeighborhoodFixture {
  readonly slug: string;
  readonly citySlug: string;
  readonly location: LocationFixture;
  readonly name: LocalizedText;
  readonly description: LocalizedText;
}

export interface PlaceFixture {
  readonly slug: string;
  readonly citySlug: string;
  readonly neighborhoodSlug: string;
  readonly categorySlugs: readonly string[];
  readonly imageAssetIds: readonly string[];
  readonly address: string;
  readonly location: LocationFixture;
  readonly priceBand: PriceBand;
  readonly isFeatured: boolean;
  readonly lastVerified: string;
  readonly publish: boolean;
  readonly schedule: boolean;
  readonly name: LocalizedText;
  readonly summary: LocalizedText;
  readonly description: LocalizedText;
}

export interface SeedFixtures {
  readonly assets: readonly AssetFixture[];
  readonly categories: readonly CategoryFixture[];
  readonly cities: readonly CityFixture[];
  readonly neighborhoods: readonly NeighborhoodFixture[];
  readonly places: readonly PlaceFixture[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIconKey(value: unknown): value is IconKey {
  return (
    value === IconKey.FoodAndDrink ||
    value === IconKey.Culture ||
    value === IconKey.Outdoors ||
    value === IconKey.Shopping ||
    value === IconKey.HistoricSites
  );
}

function isPriceBand(value: unknown): value is PriceBand {
  return (
    value === PriceBand.Budget ||
    value === PriceBand.Moderate ||
    value === PriceBand.Premium
  );
}

export function isSectionTypename(value: unknown): value is SectionTypename {
  return (
    value === SectionTypename.HeroBlock ||
    value === SectionTypename.RichTextBlock ||
    value === SectionTypename.FeaturedPlacesBlock ||
    value === SectionTypename.WeatherBlock ||
    value === SectionTypename.MapBlock ||
    value === SectionTypename.CallToActionBlock
  );
}

function readLocalizedText(value: unknown, label: string): LocalizedText {
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object`);
  }
  const en = value[LocaleApiId.EnUs];
  const pt = value[LocaleApiId.PtBr];
  const zh = value[LocaleApiId.ZhCn];
  if (!isString(en) || !isString(pt) || !isString(zh)) {
    throw new Error(`${label} must include en_US, pt_BR, and zh_CN strings`);
  }
  return { en_US: en, pt_BR: pt, zh_CN: zh };
}

function readLocation(value: unknown, label: string): LocationFixture {
  if (!isRecord(value)) {
    throw new Error(`${label} must be an object`);
  }
  const latitude = value["latitude"];
  const longitude = value["longitude"];
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
    throw new Error(`${label} needs finite latitude and longitude`);
  }
  return { latitude, longitude };
}

function readStringArray(value: unknown, label: string): readonly string[] {
  if (!isUnknownArray(value) || !value.every(isString)) {
    throw new Error(`${label} must be a string array`);
  }
  return value;
}

async function readJsonArray(fileName: string): Promise<readonly unknown[]> {
  const filePath = path.join(
    import.meta.dirname,
    "../../hygraph/fixtures",
    fileName,
  );
  const raw: unknown = JSON.parse(await readFile(filePath, "utf8"));
  if (!isUnknownArray(raw)) {
    throw new Error(`${fileName} must be a JSON array`);
  }
  return raw;
}

function parseAsset(value: unknown): AssetFixture {
  if (!isRecord(value)) {
    throw new Error("asset fixture must be an object");
  }
  const id = value["id"];
  const fileName = value["fileName"];
  const uploadUrl = value["uploadUrl"];
  const sourceUrl = value["sourceUrl"];
  const license = value["license"];
  const licenseUrl = value["licenseUrl"];
  const attribution = value["attribution"];
  if (
    !isString(id) ||
    !isString(fileName) ||
    !isString(uploadUrl) ||
    !isString(sourceUrl) ||
    !isString(license) ||
    !isString(licenseUrl) ||
    !isString(attribution)
  ) {
    throw new Error(`asset ${isString(id) ? id : "unknown"} is missing fields`);
  }
  return {
    id,
    fileName,
    uploadUrl,
    sourceUrl,
    license,
    licenseUrl,
    attribution,
  };
}

function parseCategory(value: unknown): CategoryFixture {
  if (!isRecord(value)) {
    throw new Error("category fixture must be an object");
  }
  const slug = value["slug"];
  const iconKey = value["iconKey"];
  const sortOrder = value["sortOrder"];
  if (!isString(slug) || !isIconKey(iconKey) || !isFiniteNumber(sortOrder)) {
    throw new Error(
      "category fixture has an invalid slug, iconKey, or sortOrder",
    );
  }
  return {
    slug,
    iconKey,
    sortOrder,
    name: readLocalizedText(value["name"], `category ${slug} name`),
    description: readLocalizedText(
      value["description"],
      `category ${slug} description`,
    ),
  };
}

function parseHeroSection(
  value: unknown,
  slug: string,
): CitySectionsFixture["hero"] {
  if (!isRecord(value)) {
    throw new Error(`city ${slug} hero section must be an object`);
  }
  return {
    eyebrow: readLocalizedText(value["eyebrow"], `city ${slug} hero.eyebrow`),
    heading: readLocalizedText(value["heading"], `city ${slug} hero.heading`),
    body: readLocalizedText(value["body"], `city ${slug} hero.body`),
    callToActionLabel: readLocalizedText(
      value["callToActionLabel"],
      `city ${slug} hero.callToActionLabel`,
    ),
  };
}

function parseSections(value: unknown, slug: string): CitySectionsFixture {
  if (!isRecord(value)) {
    throw new Error(`city ${slug} sections must be an object`);
  }
  const richText = value["richText"];
  const featured = value["featured"];
  const weather = value["weather"];
  const map = value["map"];
  const cta = value["cta"];
  if (
    !isRecord(richText) ||
    !isRecord(featured) ||
    !isRecord(weather) ||
    !isRecord(map) ||
    !isRecord(cta)
  ) {
    throw new Error(`city ${slug} sections are incomplete`);
  }
  return {
    hero: parseHeroSection(value["hero"], slug),
    richText: {
      heading: readLocalizedText(
        richText["heading"],
        `city ${slug} richText.heading`,
      ),
      body: readLocalizedText(richText["body"], `city ${slug} richText.body`),
    },
    featured: {
      heading: readLocalizedText(
        featured["heading"],
        `city ${slug} featured.heading`,
      ),
    },
    weather: {
      heading: readLocalizedText(
        weather["heading"],
        `city ${slug} weather.heading`,
      ),
    },
    map: {
      heading: readLocalizedText(map["heading"], `city ${slug} map.heading`),
    },
    cta: {
      heading: readLocalizedText(cta["heading"], `city ${slug} cta.heading`),
      body: readLocalizedText(cta["body"], `city ${slug} cta.body`),
      label: readLocalizedText(cta["label"], `city ${slug} cta.label`),
    },
  };
}

function parseCity(value: unknown): CityFixture {
  if (!isRecord(value)) {
    throw new Error("city fixture must be an object");
  }
  const slug = value["slug"];
  const country = value["country"];
  const timezone = value["timezone"];
  const heroAssetId = value["heroAssetId"];
  if (
    !isString(slug) ||
    !isString(country) ||
    !isString(timezone) ||
    !isString(heroAssetId)
  ) {
    throw new Error(
      "city fixture is missing slug, country, timezone, or heroAssetId",
    );
  }
  const seo = value["seo"];
  if (!isRecord(seo)) {
    throw new Error(`city ${slug} seo must be an object`);
  }
  return {
    slug,
    country,
    timezone,
    location: readLocation(value["location"], `city ${slug} location`),
    heroAssetId,
    featuredPlaceSlugs: readStringArray(
      value["featuredPlaceSlugs"],
      `city ${slug} featuredPlaceSlugs`,
    ),
    name: readLocalizedText(value["name"], `city ${slug} name`),
    intro: readLocalizedText(value["intro"], `city ${slug} intro`),
    seo: {
      title: readLocalizedText(seo["title"], `city ${slug} seo.title`),
      description: readLocalizedText(
        seo["description"],
        `city ${slug} seo.description`,
      ),
    },
    sections: parseSections(value["sections"], slug),
  };
}

function parseNeighborhood(value: unknown): NeighborhoodFixture {
  if (!isRecord(value)) {
    throw new Error("neighborhood fixture must be an object");
  }
  const slug = value["slug"];
  const citySlug = value["citySlug"];
  if (!isString(slug) || !isString(citySlug)) {
    throw new Error("neighborhood fixture is missing slug or citySlug");
  }
  return {
    slug,
    citySlug,
    location: readLocation(value["location"], `neighborhood ${slug} location`),
    name: readLocalizedText(value["name"], `neighborhood ${slug} name`),
    description: readLocalizedText(
      value["description"],
      `neighborhood ${slug} description`,
    ),
  };
}

function parsePlace(value: unknown): PlaceFixture {
  if (!isRecord(value)) {
    throw new Error("place fixture must be an object");
  }
  const slug = value["slug"];
  const citySlug = value["citySlug"];
  const neighborhoodSlug = value["neighborhoodSlug"];
  const address = value["address"];
  const lastVerified = value["lastVerified"];
  const priceBand = value["priceBand"];
  const isFeatured = value["isFeatured"];
  const publish = value["publish"];
  const schedule = value["schedule"];
  if (
    !isString(slug) ||
    !isString(citySlug) ||
    !isString(neighborhoodSlug) ||
    !isString(address) ||
    !isString(lastVerified) ||
    !isPriceBand(priceBand) ||
    typeof isFeatured !== "boolean" ||
    typeof publish !== "boolean"
  ) {
    throw new Error(
      `place ${isString(slug) ? slug : "unknown"} has invalid fields`,
    );
  }
  if (schedule !== undefined && typeof schedule !== "boolean") {
    throw new Error(`place ${slug} schedule must be a boolean when set`);
  }
  return {
    slug,
    citySlug,
    neighborhoodSlug,
    categorySlugs: readStringArray(
      value["categorySlugs"],
      `place ${slug} categorySlugs`,
    ),
    imageAssetIds: readStringArray(
      value["imageAssetIds"],
      `place ${slug} imageAssetIds`,
    ),
    address,
    location: readLocation(value["location"], `place ${slug} location`),
    priceBand,
    isFeatured,
    lastVerified,
    publish,
    schedule: schedule === true,
    name: readLocalizedText(value["name"], `place ${slug} name`),
    summary: readLocalizedText(value["summary"], `place ${slug} summary`),
    description: readLocalizedText(
      value["description"],
      `place ${slug} description`,
    ),
  };
}

export async function loadSeedFixtures(): Promise<SeedFixtures> {
  const [assetsRaw, categoriesRaw, citiesRaw, neighborhoodsRaw, placesRaw] =
    await Promise.all([
      readJsonArray("assets.json"),
      readJsonArray("categories.json"),
      readJsonArray("cities.json"),
      readJsonArray("neighborhoods.json"),
      readJsonArray("places.json"),
    ]);
  return {
    assets: assetsRaw.map(parseAsset),
    categories: categoriesRaw.map(parseCategory),
    cities: citiesRaw.map(parseCity),
    neighborhoods: neighborhoodsRaw.map(parseNeighborhood),
    places: placesRaw.map(parsePlace),
  };
}
