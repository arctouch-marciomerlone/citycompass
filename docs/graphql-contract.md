# GraphQL contract — A1

**Role:** Schema planner  
**Authority:** `AGENTS.md` > `PRD.md` > `PLAN.md` §8  
**Rule:** Do not invent Hygraph filter syntax, query names, or locale argument shapes. Describe data needs. Exact operations come from the live schema / codegen in A2 and A6.

Public site queries **Published** only. Preview tokens must not be used for public requests.

## Functions (PLAN §8)

Application data layer (names are the contract; GraphQL documents are not):

```
typescript
getCity(options: {
  slug: string; // from URL `/{locale}/{city}`
  locale: string;
  stage: "DRAFT" | "PUBLISHED";
}): Promise<City>;

getCities(options: {
  locale: string;
  stage: "PUBLISHED";
}): Promise<CitySummary[]>;

getPlaces(options: {
  citySlug: string; // from URL
  locale: string;
  categorySlug?: string;
  neighborhoodSlug?: string;
  stage: "DRAFT" | "PUBLISHED";
}): Promise<Place[]>;

getPlace(options: {
  citySlug: string; // from URL
  locale: string;
  slug: string;
  stage: "DRAFT" | "PUBLISHED";
}): Promise<Place>;
```

How those arguments become Hygraph `where` / `locales` / `stage` arguments: **verify against live schema / codegen**. Do not assume filter field paths.

Every public call uses `stage: "PUBLISHED"` and filters by the city slug from the URL. The CMS holds three cities; the public site shows one at a time. `/{locale}` redirects to the first Published city (`createdAt_ASC`).

## Locale

Request the visitor locale (`en-US`, `pt-BR`, `zh-CN`). Fall back to `en-US` when a translation is missing (FR-06).

**D-A0-3:** Live project currently has only `en`. GraphQL locale identifiers after `en-US` is enabled (`en_US` vs `en-US` vs something else) are UNVERIFIED. Verify against live schema / codegen.

## Coordinates

Select Map fields as:

```
graphql
location {
  latitude
  longitude
}
```

Official Location type: https://hygraph.com/docs/api-reference/schema/field-types  
Do not select invented `lat` / `lng` fields. Do not add decimal coordinate fields to the schema.

## Weather on City

Query weather through the City REST Remote Field `weather`. Pass City Map coordinates as the required input:

```
graphql
city(where: { slug: $slug }, stage: PUBLISHED) {
  weather(query: { latitude: $latitude, longitude: $longitude, timezone: $timezone }) {
    timezone
    current { time temperature_2m apparent_temperature weather_code wind_speed_10m }
    daily { time weather_code temperature_2m_max temperature_2m_min }
  }
}
```

Do not query Open-Meteo from Next.js as a substitute. See `docs/weather-remote-contract.md` and D-A2-4.

## `pageSections` union members

`City.pageSections` is Modular Content. Select a union of:

| Member                | Data needed                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `HeroBlock`           | Localized `eyebrow`, `heading`, `body`, `callToActionLabel`; `image`; `callToActionUrl`                             |
| `RichTextBlock`       | Localized `heading`, `body`                                                                                         |
| `FeaturedPlacesBlock` | Localized `heading`; `layout`; `places` (Place refs: name, slug, summary, images, location, categories, isFeatured) |
| `WeatherBlock`        | Localized `heading`; `showCurrent` (values come from the City Remote Field, not this block)                         |
| `MapBlock`            | Localized `heading`; `initialZoom`; `showFeaturedOnly`                                                              |
| `CallToActionBlock`   | Localized `heading`, `body`, `label`; `url`                                                                         |

Unknown members: log and skip (PRD / `AGENTS.md`). Do not crash.

Exact `__typename` strings and inline-fragment syntax: **verify against live schema / codegen**.

## Page data needs

### City landing (`/{locale}/{city}`)

`getCity({ slug: cityFromUrl, locale, stage: "PUBLISHED" })`.

| Need                 | Fields                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity             | `name`, `slug`, `country`, `timezone`                                                                                                                                |
| Intro                | `intro`                                                                                                                                                              |
| Required hero        | `heroImage`                                                                                                                                                          |
| Optional extra hero  | `HeroBlock` in `pageSections` (must not replace required `heroImage`)                                                                                                |
| SEO                  | `seo { title description image noIndex }`                                                                                                                            |
| Modular page         | `pageSections` all six members, configured order                                                                                                                     |
| Featured places      | `FeaturedPlacesBlock.places` when present and non-empty; else published places with `isFeatured` (may need `getPlaces` or an included relation — verify live schema) |
| Weather              | City Remote Field (`weather` / `openMeteo`, proposed) plus `WeatherBlock` when present; else default panel from City `location`                                      |
| Map teaser           | `MapBlock` when present; else link to `/{locale}/{city}/map`. Center: City `location { latitude longitude }`                                                         |
| Map / weather inputs | `location { latitude longitude }`, `timezone`                                                                                                                        |

### Places listing (`/{locale}/{city}/places`)

`getPlaces({ citySlug: cityFromUrl, locale, categorySlug?, neighborhoodSlug?, stage: "PUBLISHED" })`.

| Need         | Fields                                                                     |
| ------------ | -------------------------------------------------------------------------- |
| City scope   | Filter by `city.slug` from the URL (syntax: verify live schema / codegen)  |
| Card         | `name`, `slug`, `summary`, `images`, `address`, `priceBand`, `isFeatured`  |
| Filters      | `categories { name slug iconKey sortOrder }`, `neighborhood { name slug }` |
| Map-adjacent | `location { latitude longitude }` (list remains usable without Maps JS)    |

Empty result is a valid UI state.

### Place detail (`/{locale}/{city}/places/{slug}`)

`getPlace({ citySlug: cityFromUrl, locale, slug, stage: "PUBLISHED" })`.

| Need             | Fields                                                           |
| ---------------- | ---------------------------------------------------------------- |
| City scope       | Must belong to the URL city (do not return another city’s place) |
| Copy             | `name`, `summary`, `description`, `accessibilityNotes`           |
| Media            | `images`                                                         |
| Facts            | `address`, `phone`, `websiteUrl`, `priceBand`, `lastVerified`    |
| Relations        | `categories { name slug iconKey }`, `neighborhood { name slug }` |
| Hours            | `openingHours { day closed opensAt closesAt }` when present      |
| Map / directions | `location { latitude longitude }`, `googlePlaceId` (optional)    |
| SEO              | `seo { title description image noIndex }`                        |

External URLs: allow `http` / `https` only in the app.

### Map page (`/{locale}/{city}/map`)

City center + published places for the URL city.

| Need                  | Source                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Center                | `getCity` → `location { latitude longitude }`                                                                                                                                                                              |
| Markers               | `getPlaces` (Published, that city) → each `location { latitude longitude }` plus info-window copy (`name`, `slug`, `summary`, `address`, `categories`, `googlePlaceId`)                                                    |
| Featured-only variant | If a `MapBlock` on the landing page used `showFeaturedOnly`, that flag is landing-page presentation. The full map page shows published places unless a later PRD rule says otherwise (PRD FR-04: published Place markers). |

Do not geocode. Do not call Google Places or Geocoding as a content source.

## Stages

| Audience         | `stage`                                                         |
| ---------------- | --------------------------------------------------------------- |
| Public pages     | `PUBLISHED`                                                     |
| Optional preview | `DRAFT` only with `HYGRAPH_PREVIEW_TOKEN` if a human asks later |

Do not expose Draft with the public read token.

## UNVERIFIED

- Hygraph query root names (`city` vs `cities`, singular vs plural)
- Filter syntax for slug, nested `city.slug`, category, neighborhood, `isFeatured`
- Locale argument name and enum values (D-A0-3)
- `pageSections` union `__typename` values
- Remote Field API ID (`weather` vs `openMeteo`) and prefixed SDL type names
- Whether `getCity` can include featured places without a second query
- Asset GraphQL shape (`url`, `handle`, etc.) — verify live schema / codegen
- Rich text GraphQL shape (`html` / `raw` / `markdown`) — verify live schema / codegen
