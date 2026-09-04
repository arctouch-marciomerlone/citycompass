# Schema manifest — A1

**Role:** Schema planner  
**Status:** Awaiting human approval before A2  
**Authority:** `AGENTS.md` > `PRD.md` > `PLAN.md` > `docs/capability-matrix.md` > `docs/decisions.md`

This file is descriptive. It names Hygraph concepts (model, component, Map, Modular Content, REST Remote Source, Remote Field, Slug, Enumeration). It does **not** invent Management API mutation names. A2 writes `hygraph/schema/` after this manifest is approved.

Do not store live weather as Hygraph content. Do not add separate latitude/longitude decimal fields.

## Locales and stages

| Item     | Required by PRD                     | Live project (A0)                                                          |
| -------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Locales  | `en-US` (default), `pt-BR`, `zh-CN` | Only `en` (**D-A0-3**). Human must enable the three PRD locales before A2. |
| Fallback | Missing translation → `en-US`       | App rule (FR-06). Not a schema field.                                      |
| Stages   | Draft + Published                   | `DRAFT`, `PUBLISHED` present                                               |

Public queries use Published only. Draft is for editors and optional preview (not this schema).

**D-A0-3:** Whether Hygraph accepts `en-US` as a locale `apiId` (versus `en`) is unproven. Do not invent `en` / `pt` / `zh` aliases in the app.

## Decisions that affect this schema

| ID         | Effect on A1                                                                                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **D-A0-1** | Scheduled publishing is an A3 / plan conflict. **Not a schema field.** Do not add schedule, publish-at, or cron fields.                                                                                                                    |
| **D-A0-2** | City weather Path uses `{{doc.location.latitude}}`, `{{doc.location.longitude}}`, `{{doc.timezone}}`. Nested Map interpolation confidence **M**. If A2 cannot prove it, stop and record in `docs/decisions.md`. No custom weather adapter. |
| **D-A0-3** | Live locales are `en` only. Schema still declares the three PRD locales.                                                                                                                                                                   |
| **D-A0-4** | REST Remote Source needs Growth or a 30-day trial. Human gate before A2.                                                                                                                                                                   |
| **D-A0-5** | Maps key and webhook URL are not schema.                                                                                                                                                                                                   |

## Models

Four models only. No extra models.

### City

Primary landing-page model. Geographic source for weather (Remote Field) and map center.

| Field          | Hygraph type            | Localized | Required | Notes                                                                                                          |
| -------------- | ----------------------- | --------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `name`         | Single-line text        | Yes       | Yes      | Slug source where the schema allows.                                                                           |
| `slug`         | Slug, unique            | No        | Yes      | Native Slug. Generated from `name` where allowed. Not ordinary text.                                           |
| `country`      | Single-line text        | No        | Yes      |                                                                                                                |
| `timezone`     | Single-line text (IANA) | No        | Yes      | Weather Path input. Example values in PRD §7 (`America/Sao_Paulo`, `America/Los_Angeles`). Not an enumeration. |
| `location`     | Map (`Location`)        | No        | Yes      | GraphQL: `latitude`, `longitude`. Editors pick the point. No separate decimal fields.                          |
| `intro`        | Rich text               | Yes       | Yes      |                                                                                                                |
| `heroImage`    | Asset                   | No        | Yes      | Required landing-page hero.                                                                                    |
| `pageSections` | Modular Content         | No        | Yes      | Union of the six blocks below. Not localized as a unit. Copy inside blocks is localized (FR-06 / §8.5).        |
| `seo`          | Component `SEO`         | No        | No       | Component instance is not localized; inner `title` / `description` are.                                        |

`pageSections` members (PRD §8.1):

- `HeroBlock`
- `RichTextBlock`
- `FeaturedPlacesBlock`
- `WeatherBlock`
- `MapBlock`
- `CallToActionBlock`

**Hero vs `HeroBlock`:** `heroImage` is the required landing-page hero asset. `HeroBlock` is an optional modular section. Do not make `HeroBlock` a second required hero, and do not duplicate `heroImage` onto `HeroBlock` as a required field.

**Remote Field (not a content field):** A REST Remote Field on `City` fetches Open-Meteo. Proposed GraphQL name `weather` or `openMeteo` until A2. Details in `docs/weather-remote-contract.md`.

### Place

Curated location in a city.

| Field                | Hygraph type                     | Localized | Required | Notes                                                                  |
| -------------------- | -------------------------------- | --------- | -------- | ---------------------------------------------------------------------- |
| `name`               | Single-line text                 | Yes       | Yes      | Slug source where the schema allows.                                   |
| `slug`               | Slug, unique                     | No        | Yes      | Native Slug.                                                           |
| `summary`            | Single-line text                 | Yes       | Yes      |                                                                        |
| `description`        | Rich text                        | Yes       | Yes      |                                                                        |
| `city`               | Reference → `City`               | No        | Yes      | Required relation.                                                     |
| `categories`         | Multiple references → `Category` | No        | Yes      | At least one category.                                                 |
| `neighborhood`       | Reference → `Neighborhood`       | No        | No       |                                                                        |
| `address`            | Single-line text                 | No        | Yes      |                                                                        |
| `location`           | Map (`Location`)                 | No        | Yes      | Marker and directions coordinates.                                     |
| `googlePlaceId`      | Single-line text                 | No        | No       | Directions URL only. Empty is valid. Do not copy Google place details. |
| `websiteUrl`         | URL                              | No        | No       | Public site allows `http` / `https` only.                              |
| `phone`              | Single-line text                 | No        | No       |                                                                        |
| `priceBand`          | Enumeration `priceBand`          | No        | No       | `BUDGET`, `MODERATE`, `PREMIUM`.                                       |
| `openingHours`       | List of `OpeningHours`           | No        | No       | Optional. Seed may omit.                                               |
| `images`             | Multiple assets                  | No        | Yes      |                                                                        |
| `isFeatured`         | Boolean                          | No        | Yes      | Fallback featured list when `FeaturedPlacesBlock.places` is empty.     |
| `accessibilityNotes` | Rich text                        | Yes       | No       |                                                                        |
| `lastVerified`       | Date                             | No        | Yes      | Editorial verification date.                                           |
| `seo`                | Component `SEO`                  | No        | No       | Same localization pattern as City `seo`.                               |

### Category

| Field         | Hygraph type          | Localized | Required | Notes                                                                        |
| ------------- | --------------------- | --------- | -------- | ---------------------------------------------------------------------------- |
| `name`        | Single-line text      | Yes       | Yes      | Slug source where the schema allows.                                         |
| `slug`        | Slug, unique          | No        | Yes      | Native Slug.                                                                 |
| `description` | Rich text             | Yes       | No       |                                                                              |
| `iconKey`     | Enumeration `iconKey` | No        | Yes      | Frontend maps one value to one icon. Not free text. Not a custom icon asset. |
| `sortOrder`   | Integer               | No        | Yes      |                                                                              |

### Neighborhood

| Field         | Hygraph type       | Localized | Required | Notes                                                                                                 |
| ------------- | ------------------ | --------- | -------- | ----------------------------------------------------------------------------------------------------- |
| `name`        | Single-line text   | Yes       | Yes      | Slug source where the schema allows.                                                                  |
| `slug`        | Slug, unique       | No        | Yes      | Native Slug.                                                                                          |
| `description` | Rich text          | Yes       | No       |                                                                                                       |
| `city`        | Reference → `City` | No        | Yes      | Required relation.                                                                                    |
| `location`    | Map (`Location`)   | No        | No       | Optional editorial context. Visitor map and weather use City and Place coordinates, not Neighborhood. |

## Components

Reusable components from PRD §8.5. Unless noted: heading, body, eyebrow, label, and other visitor-facing copy are localized. URLs, layout, zoom, and boolean display flags are not.

Types marked **INFERRED** are not given as a Hygraph type in PRD §8.5. They follow the field name and the copy-vs-structural rule. A2 must not add extra fields to resolve this.

### SEO

Used on City and Place. The parent field (`seo`) is not localized.

| Field         | Type                        | Localized | Required      |
| ------------- | --------------------------- | --------- | ------------- |
| `title`       | Single-line text (INFERRED) | Yes       | Not specified |
| `description` | Single-line text (INFERRED) | Yes       | Not specified |
| `image`       | Asset (INFERRED)            | No        | Not specified |
| `noIndex`     | Boolean (INFERRED)          | No        | Not specified |

### OpeningHours

Used as a list on Place. Hygraph has no time-only field. Times are `HH:mm` text (24-hour). One regular weekly schedule. Seasonal or holiday hours are out of scope.

| Field      | Type                           | Localized | Required                                                                                |
| ---------- | ------------------------------ | --------- | --------------------------------------------------------------------------------------- |
| `day`      | Enumeration `OpeningHours.day` | No        | Not specified in table; needed to be useful                                             |
| `closed`   | Boolean                        | No        | Not specified                                                                           |
| `opensAt`  | Single-line text `HH:mm`       | No        | Required when `closed` is false (PRD). Hygraph may not enforce this condition natively. |
| `closesAt` | Single-line text `HH:mm`       | No        | Required when `closed` is false (PRD). Same native-enforcement gap.                     |

### HeroBlock

Optional `pageSections` member. Not a second required hero.

| Field               | Type                        | Localized | Required      |
| ------------------- | --------------------------- | --------- | ------------- |
| `eyebrow`           | Single-line text (INFERRED) | Yes       | Not specified |
| `heading`           | Single-line text (INFERRED) | Yes       | Not specified |
| `body`              | Rich text (INFERRED)        | Yes       | Not specified |
| `image`             | Asset (INFERRED)            | No        | Not specified |
| `callToActionLabel` | Single-line text (INFERRED) | Yes       | Not specified |
| `callToActionUrl`   | URL (INFERRED)              | No        | Not specified |

### RichTextBlock

| Field     | Type                           | Localized | Required      |
| --------- | ------------------------------ | --------- | ------------- |
| `heading` | Single-line text (INFERRED)    | Yes       | Not specified |
| `body`    | Rich text (INFERRED from name) | Yes       | Not specified |

### FeaturedPlacesBlock

When present, display `places`. If `places` is empty, fall back to published places with `isFeatured` true.

| Field     | Type                                     | Localized | Required                      |
| --------- | ---------------------------------------- | --------- | ----------------------------- |
| `heading` | Single-line text (INFERRED)              | Yes       | Not specified                 |
| `places`  | Multiple references → `Place`            | No        | Not specified (empty allowed) |
| `layout`  | Enumeration `FeaturedPlacesBlock.layout` | No        | Not specified                 |

### WeatherBlock

Placement and presentation only. No weather values authored here. MVP always shows a three-day forecast.

| Field         | Type                        | Localized | Required      |
| ------------- | --------------------------- | --------- | ------------- |
| `heading`     | Single-line text (INFERRED) | Yes       | Not specified |
| `showCurrent` | Boolean                     | No        | Not specified |

### MapBlock

Markers come from published Place `location`. City `location` is the default center.

| Field              | Type                           | Localized | Required      |
| ------------------ | ------------------------------ | --------- | ------------- |
| `heading`          | Single-line text (INFERRED)    | Yes       | Not specified |
| `initialZoom`      | Integer (INFERRED from “zoom”) | No        | Not specified |
| `showFeaturedOnly` | Boolean                        | No        | Not specified |

### CallToActionBlock

| Field     | Type                        | Localized | Required      |
| --------- | --------------------------- | --------- | ------------- |
| `heading` | Single-line text (INFERRED) | Yes       | Not specified |
| `body`    | Rich text (INFERRED)        | Yes       | Not specified |
| `label`   | Single-line text (INFERRED) | Yes       | Not specified |
| `url`     | URL (INFERRED)              | No        | Not specified |

## Enumerations

Values from PRD §15. GraphQL enumeration type `apiId` values are **proposed** until A2 inspects the live schema.

| PRD name                     | Values                                                                       |
| ---------------------------- | ---------------------------------------------------------------------------- |
| `iconKey`                    | `FOOD_AND_DRINK`, `CULTURE`, `OUTDOORS`, `SHOPPING`, `HISTORIC_SITES`        |
| `priceBand`                  | `BUDGET`, `MODERATE`, `PREMIUM`                                              |
| `FeaturedPlacesBlock.layout` | `GRID`, `CAROUSEL`                                                           |
| `OpeningHours.day`           | `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY` |

## Relationships

From PRD §9. Frontend queries relations through GraphQL. Do not duplicate related copy.

| From                         | Cardinality | To                                  | Required                           |
| ---------------------------- | ----------- | ----------------------------------- | ---------------------------------- |
| City                         | 1 → many    | Place (`Place.city`)                | Yes on Place                       |
| City                         | 1 → many    | Neighborhood (`Neighborhood.city`)  | Yes on Neighborhood                |
| Place                        | many → many | Category (`Place.categories`)       | Yes on Place (at least one)        |
| Place                        | many → 1    | Neighborhood (`Place.neighborhood`) | No                                 |
| `FeaturedPlacesBlock.places` | many        | Place                               | No (empty → `isFeatured` fallback) |

Hygraph may create reverse relations. Reverse field `apiId` values are not in the PRD. Do not add extra editorial reverse fields. A2 records whatever the live schema creates.

`City.pageSections` is Modular Content, not a relation model. See `docs/relationship-diagram.md`.

## Validation notes

| Topic                | Rule                                                                                                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Coordinates          | From Map (`Location`) only. Query `location { latitude longitude }`. Do not add decimal latitude/longitude fields. Do not geocode visitor input. Invalid coordinates are a content problem for the frontend (exclude marker), not a second schema type.                                                                  |
| URLs                 | Public rendering allows `http` and `https` only (`websiteUrl`, `callToActionUrl`, `CallToActionBlock.url`). Whether the Hygraph URL field itself rejects other schemes is UNVERIFIED. Frontend must still validate.                                                                                                      |
| Slugs                | Native Slug, unique, generated from `name` where the schema allows. After first save, Hygraph does not auto-rewrite a saved slug when `name` changes ([Slug field](https://hygraph.com/docs/editor-guides/content/field-types#slug)). Uniqueness scope (per model vs per locale) is UNVERIFIED; slugs are not localized. |
| Required relations   | `Place.city`, `Place.categories` (min 1), `Neighborhood.city`.                                                                                                                                                                                                                                                           |
| Localized fallback   | Query requested locale; missing values fall back to `en-US` in the app (FR-06).                                                                                                                                                                                                                                          |
| Opening hours        | `opensAt` / `closesAt` required when `closed` is false. Conditional required is a seed/frontend rule unless A2 finds a native constraint.                                                                                                                                                                                |
| Weather              | Not stored as content. Remote Field on City only.                                                                                                                                                                                                                                                                        |
| Scheduled publishing | Not a field (**D-A0-1**).                                                                                                                                                                                                                                                                                                |

## Remote Source and City Remote Field (summary)

Details: `docs/weather-remote-contract.md`.

1. One custom REST Remote Source. Base URL `https://api.open-meteo.com/v1/forecast`.
2. One Remote Field on `City`. Path uses `{{args.query.latitude}}` (custom input `OpenMeteoQueryInput`). Nested Map Path failed (D-A2-4).
3. Query weather through the Content API with City content. Normalize in Story 2 (`lib/weather`).
4. ~10 minute cache is Next.js in Story 2, not CMS-stored weather.

**D-A0-4:** Human must confirm Growth or trial before A2 creates the source.

## Out of this schema

- Scheduled publishing fields or fake schedule adapters (**D-A0-1**)
- Google Places / Geocoding fields
- Weather models or weather entries
- Webhook configuration (Story 2 / human Studio)
- Editor/publisher roles (human in Studio)
- Extra models or extra fields not in PRD §8

## PRD field-by-field self-check

| PRD item                                     | In this manifest |
| -------------------------------------------- | ---------------- |
| City 9 fields + types + localized + required | Yes              |
| City `pageSections` six blocks               | Yes              |
| Place 19 fields                              | Yes              |
| Category 5 fields + `iconKey` values         | Yes              |
| Neighborhood 5 fields                        | Yes              |
| Components SEO, OpeningHours, six blocks     | Yes              |
| Enums from §15                               | Yes              |
| Relations from §9                            | Yes              |
| Map-only coordinates                         | Yes              |
| Slug native unique                           | Yes              |
| Weather not stored                           | Yes              |
| `heroImage` vs optional `HeroBlock`          | Yes              |
| Locales + D-A0-3                             | Yes              |
| D-A0-1 not a field                           | Yes              |
| D-A0-2 Path + confidence M                   | Yes              |

No extra models. No extra fields beyond PRD §8 / §8.5.

## UNVERIFIED

- Hygraph locale `apiId` for `en-US` / `pt-BR` / `zh-CN` vs live `en` (D-A0-3)
- Nested `{{doc.location.latitude}}` / `{{doc.location.longitude}}` in Remote Field Path (D-A0-2, confidence M)
- Commercial plan / Remote Source quota (D-A0-4)
- Component field Hygraph types marked INFERRED
- Component field required flags (PRD does not specify most of them)
- Conditional required on `OpeningHours` times
- Slug uniqueness scope
- Hygraph URL field scheme restriction
- Reverse relation `apiId` names
- City Remote Field GraphQL name (`weather` vs `openMeteo`)
- Remote Source prefix on custom SDL types
- Whether Schema as Code can create the REST Remote Source (A2; official docs list Remote Sources as supported)
- Management API mutation names (intentionally omitted)

## External docs checked

- https://hygraph.com/docs/editor-guides/content/field-types#map
- https://hygraph.com/docs/editor-guides/content/field-types#slug
- https://hygraph.com/docs/api-reference/schema/field-types
- https://hygraph.com/docs/developer-guides/remote-data/overview
- https://hygraph.com/docs/developer-guides/remote-data/remote-content
- https://hygraph.com/docs/developer-guides/remote-data/remote-sources
- https://hygraph.com/docs/developer-guides/content/scheduled-publishing
- https://open-meteo.com/en/docs
