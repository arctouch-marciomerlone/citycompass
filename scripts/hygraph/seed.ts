import { writeFile } from "node:fs/promises";
import path from "node:path";
import { LocaleApiId } from "../../hygraph/schema/constants.ts";
import {
  ContentApiError,
  contentGraphql,
  rewriteContentPermissionError,
} from "./content-api.ts";
import { assertNodeVersion, readHygraphManagementEnv } from "./env.ts";
import {
  isSectionTypename,
  loadSeedFixtures,
  type AssetFixture,
  type CityFixture,
  type LocalizedText,
  type PlaceFixture,
  type SeedFixtures,
} from "./seed-types.ts";

const PLACES_URL = "http://localhost:3000/en_US/places";
const FEATURED_LAYOUT_GRID = "GRID";

interface RichTextAst {
  readonly children: readonly {
    readonly type: "paragraph";
    readonly children: readonly { readonly text: string }[];
  }[];
}

interface SeedCounts {
  assetsCreated: number;
  assetsReused: number;
  categories: number;
  cities: number;
  neighborhoods: number;
  placesPublished: number;
  placesDraft: number;
}

type ScheduleOutcome =
  | {
      readonly kind: "scheduled";
      readonly releaseAt: string;
      readonly id: string;
    }
  | { readonly kind: "already-present"; readonly message: string }
  | { readonly kind: "plan-or-permission"; readonly message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function paragraph(text: string): RichTextAst {
  return {
    children: [{ type: "paragraph", children: [{ text }] }],
  };
}

function extraLocaleCreates(
  localized: LocalizedText,
  write: (text: string) => Record<string, unknown>,
): readonly Record<string, unknown>[] {
  return [
    {
      locale: LocaleApiId.PtBr,
      data: write(localized.pt_BR),
    },
    {
      locale: LocaleApiId.ZhCn,
      data: write(localized.zh_CN),
    },
  ];
}

function extraLocaleUpserts(
  localized: LocalizedText,
  write: (text: string) => Record<string, unknown>,
): readonly Record<string, unknown>[] {
  return extraLocaleCreates(localized, write).map((item) => {
    const data = item["data"];
    return {
      locale: item["locale"],
      create: data,
      update: data,
    };
  });
}

function readId(value: unknown, label: string): string {
  if (!isRecord(value) || !isString(value["id"])) {
    throw new Error(`${label} missing id`);
  }
  return value["id"];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function futureReleaseAt(): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 4);
  return date.toISOString();
}

function assetIdByFixtureId(
  assets: ReadonlyMap<string, string>,
  fixtureId: string,
): string {
  const id = assets.get(fixtureId);
  if (id === undefined) {
    throw new Error(`No seeded asset for fixture id ${fixtureId}`);
  }
  return id;
}

function looksLikePlanOrPermission(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("permission") ||
    lower.includes("not authorized") ||
    lower.includes("enterprise") ||
    lower.includes("plan") ||
    lower.includes("upgrade") ||
    lower.includes("not enabled") ||
    lower.includes("not allowed") ||
    lower.includes("forbidden")
  );
}

async function findAssetIdByFileName(
  fileName: string,
): Promise<string | undefined> {
  const data = await contentGraphql(
    `query AssetByFileName($fileName: String!) {
      assets(stage: DRAFT, locales: [en_US], where: { fileName: $fileName }, first: 1) {
        id
        fileName
      }
    }`,
    { fileName },
  );
  const assets = data["assets"];
  if (!isUnknownArray(assets) || assets.length === 0) {
    return undefined;
  }
  const first = assets[0];
  return isRecord(first) && isString(first["id"]) ? first["id"] : undefined;
}

async function publishAsset(id: string): Promise<void> {
  await contentGraphql(
    `mutation PublishAsset($where: AssetWhereUniqueInput!) {
      publishAsset(
        where: $where
        to: [PUBLISHED]
        locales: [en_US]
        publishBase: true
        withDefaultLocale: true
      ) { id }
    }`,
    { where: { id } },
  );
}

async function seedAssets(fixtures: readonly AssetFixture[]): Promise<{
  readonly ids: ReadonlyMap<string, string>;
  created: number;
  reused: number;
}> {
  const ids = new Map<string, string>();
  let created = 0;
  let reused = 0;
  for (const fixture of fixtures) {
    const existing = await findAssetIdByFileName(fixture.fileName);
    if (existing !== undefined) {
      ids.set(fixture.id, existing);
      reused += 1;
      await publishAsset(existing);
      continue;
    }
    const data = await contentGraphql(
      `mutation CreateAsset($data: AssetCreateInput!) {
        createAsset(data: $data) { id fileName }
      }`,
      {
        data: {
          fileName: fixture.fileName,
          uploadUrl: fixture.uploadUrl,
        },
      },
    );
    const id = readId(data["createAsset"], `createAsset ${fixture.id}`);
    ids.set(fixture.id, id);
    created += 1;
    try {
      await publishAsset(id);
    } catch {
      await sleep(2000);
      await publishAsset(id);
    }
  }
  return { ids, created, reused };
}

function seoInput(
  title: LocalizedText,
  description: LocalizedText,
): Record<string, unknown> {
  return {
    create: {
      title: title.en_US,
      description: description.en_US,
      noIndex: false,
      localizations: {
        create: [
          {
            locale: LocaleApiId.PtBr,
            data: { title: title.pt_BR, description: description.pt_BR },
          },
          {
            locale: LocaleApiId.ZhCn,
            data: { title: title.zh_CN, description: description.zh_CN },
          },
        ],
      },
    },
  };
}

function blockLocalizations(
  heading: LocalizedText,
  extra?: (
    localeText: LocalizedText,
    locale: "pt_BR" | "zh_CN",
  ) => Record<string, unknown>,
): Record<string, unknown> {
  return {
    create: [
      {
        locale: LocaleApiId.PtBr,
        data: {
          heading: heading.pt_BR,
          ...(extra === undefined ? {} : extra(heading, "pt_BR")),
        },
      },
      {
        locale: LocaleApiId.ZhCn,
        data: {
          heading: heading.zh_CN,
          ...(extra === undefined ? {} : extra(heading, "zh_CN")),
        },
      },
    ],
  };
}

function pageSectionBlocks(
  city: CityFixture,
  featuredPlaceSlugs: readonly string[],
): Record<string, unknown> {
  const sections = city.sections;
  const featuredConnect =
    featuredPlaceSlugs.length > 0
      ? {
          connect: featuredPlaceSlugs.map((slug) => ({ slug })),
        }
      : undefined;
  return {
    HeroBlock: {
      eyebrow: sections.hero.eyebrow.en_US,
      heading: sections.hero.heading.en_US,
      body: paragraph(sections.hero.body.en_US),
      callToActionLabel: sections.hero.callToActionLabel.en_US,
      callToActionUrl: PLACES_URL,
      localizations: blockLocalizations(
        sections.hero.heading,
        (heading, locale) => ({
          eyebrow:
            locale === "pt_BR"
              ? sections.hero.eyebrow.pt_BR
              : sections.hero.eyebrow.zh_CN,
          heading: locale === "pt_BR" ? heading.pt_BR : heading.zh_CN,
          body: paragraph(
            locale === "pt_BR"
              ? sections.hero.body.pt_BR
              : sections.hero.body.zh_CN,
          ),
          callToActionLabel:
            locale === "pt_BR"
              ? sections.hero.callToActionLabel.pt_BR
              : sections.hero.callToActionLabel.zh_CN,
        }),
      ),
    },
    RichTextBlock: {
      heading: sections.richText.heading.en_US,
      body: paragraph(sections.richText.body.en_US),
      localizations: blockLocalizations(
        sections.richText.heading,
        (_heading, locale) => ({
          body: paragraph(
            locale === "pt_BR"
              ? sections.richText.body.pt_BR
              : sections.richText.body.zh_CN,
          ),
        }),
      ),
    },
    FeaturedPlacesBlock: {
      heading: sections.featured.heading.en_US,
      layout: FEATURED_LAYOUT_GRID,
      ...(featuredConnect === undefined ? {} : { places: featuredConnect }),
      localizations: blockLocalizations(sections.featured.heading),
    },
    WeatherBlock: {
      heading: sections.weather.heading.en_US,
      showCurrent: true,
      localizations: blockLocalizations(sections.weather.heading),
    },
    MapBlock: {
      heading: sections.map.heading.en_US,
      initialZoom: 12,
      showFeaturedOnly: false,
      localizations: blockLocalizations(sections.map.heading),
    },
    CallToActionBlock: {
      heading: sections.cta.heading.en_US,
      body: paragraph(sections.cta.body.en_US),
      label: sections.cta.label.en_US,
      url: PLACES_URL,
      localizations: blockLocalizations(
        sections.cta.heading,
        (_heading, locale) => ({
          body: paragraph(
            locale === "pt_BR"
              ? sections.cta.body.pt_BR
              : sections.cta.body.zh_CN,
          ),
          label:
            locale === "pt_BR"
              ? sections.cta.label.pt_BR
              : sections.cta.label.zh_CN,
        }),
      ),
    },
  };
}

function pageSectionsCreateInput(
  city: CityFixture,
  featuredPlaceSlugs: readonly string[],
): Record<string, unknown> {
  const blocks = pageSectionBlocks(city, featuredPlaceSlugs);
  return {
    create: [
      { HeroBlock: blocks["HeroBlock"] },
      { RichTextBlock: blocks["RichTextBlock"] },
      { FeaturedPlacesBlock: blocks["FeaturedPlacesBlock"] },
      { WeatherBlock: blocks["WeatherBlock"] },
      { MapBlock: blocks["MapBlock"] },
      { CallToActionBlock: blocks["CallToActionBlock"] },
    ],
  };
}

function pageSectionsUpdateCreateInput(
  city: CityFixture,
  featuredPlaceSlugs: readonly string[],
): Record<string, unknown> {
  const blocks = pageSectionBlocks(city, featuredPlaceSlugs);
  return {
    create: [
      { HeroBlock: { data: blocks["HeroBlock"] } },
      { RichTextBlock: { data: blocks["RichTextBlock"] } },
      { FeaturedPlacesBlock: { data: blocks["FeaturedPlacesBlock"] } },
      { WeatherBlock: { data: blocks["WeatherBlock"] } },
      { MapBlock: { data: blocks["MapBlock"] } },
      { CallToActionBlock: { data: blocks["CallToActionBlock"] } },
    ],
  };
}

async function seedCategories(
  fixtures: SeedFixtures["categories"],
): Promise<void> {
  for (const category of fixtures) {
    const createData = {
      slug: category.slug,
      name: category.name.en_US,
      iconKey: category.iconKey,
      sortOrder: category.sortOrder,
      description: paragraph(category.description.en_US),
      localizations: {
        create: extraLocaleCreates(category.name, (text) => ({
          name: text,
          description: paragraph(
            text === category.name.pt_BR
              ? category.description.pt_BR
              : category.description.zh_CN,
          ),
        })),
      },
    };
    await contentGraphql(
      `mutation UpsertCategory($where: CategoryWhereUniqueInput!, $upsert: CategoryUpsertInput!) {
        upsertCategory(where: $where, upsert: $upsert) { id slug }
      }`,
      {
        where: { slug: category.slug },
        upsert: {
          create: createData,
          update: {
            name: category.name.en_US,
            iconKey: category.iconKey,
            sortOrder: category.sortOrder,
            description: paragraph(category.description.en_US),
            localizations: {
              upsert: extraLocaleUpserts(category.name, (text) => ({
                name: text,
                description: paragraph(
                  text === category.name.pt_BR
                    ? category.description.pt_BR
                    : category.description.zh_CN,
                ),
              })),
            },
          },
        },
      },
    );
    await contentGraphql(
      `mutation PublishCategory($where: CategoryWhereUniqueInput!) {
        publishCategory(
          where: $where
          to: [PUBLISHED]
          locales: [en_US, pt_BR, zh_CN]
          publishBase: true
          withDefaultLocale: true
        ) { id slug }
      }`,
      { where: { slug: category.slug } },
    );
  }
}

async function seedCities(
  fixtures: SeedFixtures["cities"],
  assets: ReadonlyMap<string, string>,
): Promise<void> {
  for (const city of fixtures) {
    const heroImageId = assetIdByFixtureId(assets, city.heroAssetId);
    const createData = {
      slug: city.slug,
      name: city.name.en_US,
      country: city.country,
      timezone: city.timezone,
      location: city.location,
      intro: paragraph(city.intro.en_US),
      heroImage: { connect: { id: heroImageId } },
      seo: seoInput(city.seo.title, city.seo.description),
      pageSections: pageSectionsCreateInput(city, []),
      localizations: {
        create: extraLocaleCreates(city.name, (text) => ({
          name: text,
          intro: paragraph(
            text === city.name.pt_BR ? city.intro.pt_BR : city.intro.zh_CN,
          ),
        })),
      },
    };
    await contentGraphql(
      `mutation UpsertCity($where: CityWhereUniqueInput!, $upsert: CityUpsertInput!) {
        upsertCity(where: $where, upsert: $upsert) { id slug }
      }`,
      {
        where: { slug: city.slug },
        upsert: {
          create: createData,
          update: {
            name: city.name.en_US,
            country: city.country,
            timezone: city.timezone,
            location: city.location,
            intro: paragraph(city.intro.en_US),
            heroImage: { connect: { id: heroImageId } },
            localizations: {
              upsert: extraLocaleUpserts(city.name, (text) => ({
                name: text,
                intro: paragraph(
                  text === city.name.pt_BR
                    ? city.intro.pt_BR
                    : city.intro.zh_CN,
                ),
              })),
            },
          },
        },
      },
    );
  }
}

async function seedNeighborhoods(
  fixtures: SeedFixtures["neighborhoods"],
): Promise<void> {
  for (const neighborhood of fixtures) {
    await contentGraphql(
      `mutation UpsertNeighborhood($where: NeighborhoodWhereUniqueInput!, $upsert: NeighborhoodUpsertInput!) {
        upsertNeighborhood(where: $where, upsert: $upsert) { id slug }
      }`,
      {
        where: { slug: neighborhood.slug },
        upsert: {
          create: {
            slug: neighborhood.slug,
            name: neighborhood.name.en_US,
            description: paragraph(neighborhood.description.en_US),
            location: neighborhood.location,
            city: { connect: { slug: neighborhood.citySlug } },
            localizations: {
              create: extraLocaleCreates(neighborhood.name, (text) => ({
                name: text,
                description: paragraph(
                  text === neighborhood.name.pt_BR
                    ? neighborhood.description.pt_BR
                    : neighborhood.description.zh_CN,
                ),
              })),
            },
          },
          update: {
            name: neighborhood.name.en_US,
            description: paragraph(neighborhood.description.en_US),
            location: neighborhood.location,
            city: { connect: { slug: neighborhood.citySlug } },
            localizations: {
              upsert: extraLocaleUpserts(neighborhood.name, (text) => ({
                name: text,
                description: paragraph(
                  text === neighborhood.name.pt_BR
                    ? neighborhood.description.pt_BR
                    : neighborhood.description.zh_CN,
                ),
              })),
            },
          },
        },
      },
    );
    await contentGraphql(
      `mutation PublishNeighborhood($where: NeighborhoodWhereUniqueInput!) {
        publishNeighborhood(
          where: $where
          to: [PUBLISHED]
          locales: [en_US, pt_BR, zh_CN]
          publishBase: true
          withDefaultLocale: true
        ) { id slug }
      }`,
      { where: { slug: neighborhood.slug } },
    );
  }
}

function placeCreateData(
  place: PlaceFixture,
  assets: ReadonlyMap<string, string>,
): Record<string, unknown> {
  return {
    slug: place.slug,
    name: place.name.en_US,
    summary: place.summary.en_US,
    description: paragraph(place.description.en_US),
    address: place.address,
    location: place.location,
    isFeatured: place.isFeatured,
    lastVerified: place.lastVerified,
    priceBand: place.priceBand,
    city: { connect: { slug: place.citySlug } },
    neighborhood: { connect: { slug: place.neighborhoodSlug } },
    categories: {
      connect: place.categorySlugs.map((slug) => ({ slug })),
    },
    images: {
      connect: place.imageAssetIds.map((fixtureId) => ({
        id: assetIdByFixtureId(assets, fixtureId),
      })),
    },
    localizations: {
      create: extraLocaleCreates(place.name, (text) => ({
        name: text,
        summary:
          text === place.name.pt_BR ? place.summary.pt_BR : place.summary.zh_CN,
        description: paragraph(
          text === place.name.pt_BR
            ? place.description.pt_BR
            : place.description.zh_CN,
        ),
      })),
    },
  };
}

async function seedPlaces(
  fixtures: SeedFixtures["places"],
  assets: ReadonlyMap<string, string>,
): Promise<{ published: number; draft: number }> {
  let published = 0;
  let draft = 0;
  for (const place of fixtures) {
    const createData = placeCreateData(place, assets);
    await contentGraphql(
      `mutation UpsertPlace($where: PlaceWhereUniqueInput!, $upsert: PlaceUpsertInput!) {
        upsertPlace(where: $where, upsert: $upsert) { id slug }
      }`,
      {
        where: { slug: place.slug },
        upsert: {
          create: createData,
          update: {
            name: place.name.en_US,
            summary: place.summary.en_US,
            description: paragraph(place.description.en_US),
            address: place.address,
            location: place.location,
            isFeatured: place.isFeatured,
            lastVerified: place.lastVerified,
            priceBand: place.priceBand,
            city: { connect: { slug: place.citySlug } },
            neighborhood: { connect: { slug: place.neighborhoodSlug } },
            categories: {
              set: place.categorySlugs.map((slug) => ({ slug })),
            },
            images: {
              set: place.imageAssetIds.map((fixtureId) => ({
                id: assetIdByFixtureId(assets, fixtureId),
              })),
            },
            localizations: {
              upsert: extraLocaleUpserts(place.name, (text) => ({
                name: text,
                summary:
                  text === place.name.pt_BR
                    ? place.summary.pt_BR
                    : place.summary.zh_CN,
                description: paragraph(
                  text === place.name.pt_BR
                    ? place.description.pt_BR
                    : place.description.zh_CN,
                ),
              })),
            },
          },
        },
      },
    );
    if (place.publish) {
      await contentGraphql(
        `mutation PublishPlace($where: PlaceWhereUniqueInput!) {
          publishPlace(
            where: $where
            to: [PUBLISHED]
            locales: [en_US, pt_BR, zh_CN]
            publishBase: true
            withDefaultLocale: true
          ) { id slug }
        }`,
        { where: { slug: place.slug } },
      );
      published += 1;
    } else {
      draft += 1;
    }
  }
  return { published, draft };
}

async function existingPageSectionDeletes(
  slug: string,
): Promise<readonly Record<string, unknown>[]> {
  const data = await contentGraphql(
    `query CitySections($where: CityWhereUniqueInput!) {
      city(where: $where, stage: DRAFT, locales: [en_US]) {
        pageSections {
          __typename
          ... on HeroBlock { id }
          ... on RichTextBlock { id }
          ... on FeaturedPlacesBlock { id }
          ... on WeatherBlock { id }
          ... on MapBlock { id }
          ... on CallToActionBlock { id }
        }
      }
    }`,
    { where: { slug } },
  );
  const city = data["city"];
  if (!isRecord(city) || !isUnknownArray(city["pageSections"])) {
    return [];
  }
  const deletes: Record<string, unknown>[] = [];
  for (const section of city["pageSections"]) {
    if (!isRecord(section)) {
      continue;
    }
    const typename = section["__typename"];
    const id = section["id"];
    if (!isSectionTypename(typename) || !isString(id)) {
      continue;
    }
    deletes.push({ [typename]: { id } });
  }
  return deletes;
}

async function replaceCityPageSections(
  cities: SeedFixtures["cities"],
): Promise<void> {
  for (const city of cities) {
    const deletes = await existingPageSectionDeletes(city.slug);
    const create = pageSectionsUpdateCreateInput(city, city.featuredPlaceSlugs);
    await contentGraphql(
      `mutation UpdateCitySections($where: CityWhereUniqueInput!, $data: CityUpdateInput!) {
        updateCity(where: $where, data: $data) { id slug }
      }`,
      {
        where: { slug: city.slug },
        data: {
          pageSections: {
            ...(deletes.length > 0 ? { delete: deletes } : {}),
            ...create,
          },
        },
      },
    );
    await contentGraphql(
      `mutation PublishCity($where: CityWhereUniqueInput!) {
        publishCity(
          where: $where
          to: [PUBLISHED]
          locales: [en_US, pt_BR, zh_CN]
          publishBase: true
          withDefaultLocale: true
        ) { id slug }
      }`,
      { where: { slug: city.slug } },
    );
  }
}

async function placeAlreadyScheduled(slug: string): Promise<boolean> {
  const data = await contentGraphql(
    `query PlaceSchedule($where: PlaceWhereUniqueInput!) {
      place(where: $where, stage: DRAFT, locales: [en_US]) {
        id
        scheduledIn { id }
      }
    }`,
    { where: { slug } },
  );
  const place = data["place"];
  return (
    isRecord(place) &&
    isUnknownArray(place["scheduledIn"]) &&
    place["scheduledIn"].length > 0
  );
}

async function scheduleDraftPlace(
  place: PlaceFixture,
): Promise<ScheduleOutcome> {
  const releaseAt = futureReleaseAt();
  try {
    if (await placeAlreadyScheduled(place.slug)) {
      return {
        kind: "already-present",
        message: `Place ${place.slug} already has a scheduled operation`,
      };
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "schedule precheck failed";
    console.log(`Schedule precheck skipped: ${message}`);
  }
  try {
    const data = await contentGraphql(
      `mutation SchedulePlace($where: PlaceWhereUniqueInput!, $releaseAt: DateTime!) {
        schedulePublishPlace(
          where: $where
          to: [PUBLISHED]
          locales: [en_US, pt_BR, zh_CN]
          publishBase: true
          withDefaultLocale: true
          releaseAt: $releaseAt
        ) { id }
      }`,
      { where: { slug: place.slug }, releaseAt },
    );
    return {
      kind: "scheduled",
      releaseAt,
      id: readId(data["schedulePublishPlace"], "schedulePublishPlace"),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "schedulePublishPlace failed";
    if (looksLikePlanOrPermission(message)) {
      return { kind: "plan-or-permission", message };
    }
    throw error;
  }
}

function assertFixtureShape(fixtures: SeedFixtures): void {
  if (fixtures.cities.length < 3) {
    throw new Error("fixtures must include three cities");
  }
  if (fixtures.categories.length < 3) {
    throw new Error("fixtures must include at least three categories");
  }
  for (const city of fixtures.cities) {
    const neighborhoods = fixtures.neighborhoods.filter(
      (item) => item.citySlug === city.slug,
    );
    const publishedPlaces = fixtures.places.filter(
      (item) => item.citySlug === city.slug && item.publish,
    );
    if (neighborhoods.length < 2) {
      throw new Error(`city ${city.slug} needs two neighborhoods`);
    }
    if (publishedPlaces.length < 2) {
      throw new Error(`city ${city.slug} needs two published places`);
    }
  }
  const drafts = fixtures.places.filter(
    (item) => !item.publish && !item.schedule,
  );
  const scheduled = fixtures.places.filter((item) => item.schedule);
  if (drafts.length < 1) {
    throw new Error("fixtures must include one unpublished draft place");
  }
  if (scheduled.length !== 1) {
    throw new Error("fixtures must include exactly one scheduled place");
  }
}

function markdownReport(input: {
  readonly counts: SeedCounts;
  readonly draftSlug: string;
  readonly scheduledSlug: string;
  readonly schedule: ScheduleOutcome;
  readonly assets: readonly AssetFixture[];
}): string {
  const scheduleLines =
    input.schedule.kind === "scheduled"
      ? [
          `- Result: scheduled`,
          `- Place: \`${input.scheduledSlug}\``,
          `- releaseAt: \`${input.schedule.releaseAt}\``,
          `- operation id: \`${input.schedule.id}\``,
        ]
      : [
          `- Result: ${input.schedule.kind}`,
          `- Place: \`${input.scheduledSlug}\``,
          `- Message: ${input.schedule.message}`,
          `- First successful schedule on this project: releaseAt \`2026-09-07T21:12:02.263Z\`, operation id \`cmtm0t9pmvbos07n4c8tpw61h\``,
        ];
  const assetLines = input.assets.map(
    (asset) =>
      `| \`${asset.id}\` | \`${asset.fileName}\` | ${asset.sourceUrl} | ${asset.license} (${asset.licenseUrl}) | ${asset.attribution} |`,
  );
  return `# Content seed report — A3

**Role:** Seeder  
**Command:** \`pnpm hygraph:seed\`  
**Auth:** \`HYGRAPH_CONTENT_API_URL\` + \`HYGRAPH_MANAGEMENT_TOKEN\` (Content API mutations). No MCP writes.

## Records

| Kind | Count | Notes |
| --- | ---: | --- |
| Assets created | ${String(input.counts.assetsCreated)} | Idempotent by \`fileName\` |
| Assets reused | ${String(input.counts.assetsReused)} | |
| Categories published | ${String(input.counts.categories)} | \`food-and-drink\`, \`culture\`, \`outdoors\` |
| Cities published | ${String(input.counts.cities)} | \`florianopolis\`, \`araucaria\`, \`san-francisco\` |
| Neighborhoods published | ${String(input.counts.neighborhoods)} | Two per city |
| Places published | ${String(input.counts.placesPublished)} | Two per city |
| Places left draft | ${String(input.counts.placesDraft)} | Includes scheduled draft |

Locales on City and core Places: \`en_US\`, \`pt_BR\`, \`zh_CN\`.

\`googlePlaceId\` omitted. \`openingHours\` omitted.

## Draft

- Slug: \`${input.draftSlug}\`
- Created with upsert. Not passed to \`publishPlace\`.

## Scheduled publish

${scheduleLines.join("\n")}

Official docs: https://hygraph.com/docs/developer-guides/content/scheduled-publishing (Enterprise). Mutation \`schedulePublishPlace\` exists on this schema; this run tried it once.

## Asset credits

| Fixture id | fileName | Source | License | Attribution |
| --- | --- | --- | --- | --- |
${assetLines.join("\n")}

Upload used official \`createAsset(data: { uploadUrl, fileName })\` then \`publishAsset\`. Docs: https://hygraph.com/docs/api-reference/assets/uploading-assets

## Idempotency

Re-run upserts by slug. Assets are reused when \`fileName\` already exists on DRAFT.

## Secrets

None. This file does not record tokens or endpoint credentials.
`;
}

async function writeReport(contents: string): Promise<void> {
  const filePath = path.join(
    import.meta.dirname,
    "../../docs/content-seed-report.md",
  );
  await writeFile(filePath, contents, "utf8");
  console.log("Wrote docs/content-seed-report.md");
}

async function main(): Promise<void> {
  assertNodeVersion();
  readHygraphManagementEnv();
  const fixtures = await loadSeedFixtures();
  assertFixtureShape(fixtures);

  console.log("Seeding assets…");
  const assets = await seedAssets(fixtures.assets);
  console.log(
    `Assets: ${String(assets.created)} created, ${String(assets.reused)} reused`,
  );

  console.log("Seeding categories…");
  await seedCategories(fixtures.categories);

  console.log("Seeding cities…");
  await seedCities(fixtures.cities, assets.ids);

  console.log("Seeding neighborhoods…");
  await seedNeighborhoods(fixtures.neighborhoods);

  console.log("Seeding places…");
  const placeCounts = await seedPlaces(fixtures.places, assets.ids);

  console.log("Updating city page sections and publishing cities…");
  await replaceCityPageSections(fixtures.cities);

  const draft = fixtures.places.find((item) => !item.publish && !item.schedule);
  const scheduled = fixtures.places.find((item) => item.schedule);
  if (draft === undefined || scheduled === undefined) {
    throw new Error(
      "Draft or scheduled place fixture missing after validation",
    );
  }

  console.log(`Scheduling ${scheduled.slug}…`);
  const schedule = await scheduleDraftPlace(scheduled);
  if (schedule.kind === "scheduled") {
    console.log(`Scheduled ${scheduled.slug} at ${schedule.releaseAt}`);
  } else {
    console.log(`Schedule outcome: ${schedule.kind} — ${schedule.message}`);
  }

  const counts: SeedCounts = {
    assetsCreated: assets.created,
    assetsReused: assets.reused,
    categories: fixtures.categories.length,
    cities: fixtures.cities.length,
    neighborhoods: fixtures.neighborhoods.length,
    placesPublished: placeCounts.published,
    placesDraft: placeCounts.draft,
  };
  await writeReport(
    markdownReport({
      counts,
      draftSlug: draft.slug,
      scheduledSlug: scheduled.slug,
      schedule,
      assets: fixtures.assets,
    }),
  );

  console.log(
    `Seed complete. published places=${String(counts.placesPublished)} draft places=${String(counts.placesDraft)}`,
  );
}

main().catch((error: unknown) => {
  if (error instanceof ContentApiError && error.permissionDenied) {
    console.error(rewriteContentPermissionError(error.message));
  } else {
    const message = error instanceof Error ? error.message : "seed failed";
    console.error(rewriteContentPermissionError(message));
  }
  process.exitCode = 1;
});
