# PRD.md — CityCompass Local City Guide

**Status:** Ready for implementation  
**Date:** 2026-09-03  
**Project type:** Hygraph CMS certification project

## 1. Product Summary

CityCompass is a localized city guide. The CMS holds three cities; visitors see one city at a time. They can discover curated places, view editorial information, see the current weather and short-term forecast, and explore locations on an interactive map.

Hygraph is the system of record for editorial content and geographic coordinates. Editors set city, place, and neighborhood coordinates with Hygraph's native Map field (Location type). The weather API is an external, live data source and must be connected through Hygraph Remote Sources/Content Federation. The visitor-facing map reads those Hygraph coordinates for markers and directions. Do not syndicate Google Maps or Google Places data into Hygraph.

The CMS is seeded with three cities. The public site shows one city at a time from the URL path `/{locale}/{city}`. The site supports three locales. Locales, weather provider, and visitor map configuration must be configurable.

Hygraph schema and mock content live in the repository. `pnpm` scripts apply, reset, and seed the project. The Hygraph MCP server may read schema and content to check results. It must not create, update, publish, or delete schema or entries.

## 2. Product Goals

1. Provide a simple but useful city discovery experience.
2. Demonstrate Hygraph content modeling and GraphQL delivery.
3. Demonstrate advanced Hygraph features:
   - References between content models
   - Components
   - Modular Content
   - Localization
   - Draft and published stages
   - Scheduled publishing
   - Webhooks
   - Native Map (Location) fields for coordinates
   - Remote Sources/Content Federation for weather
4. Keep the frontend small, responsive, and entirely content-driven.
5. Integrate live weather without manually copying weather data into Hygraph.
6. Store coordinates in Hygraph Map fields. Do not import Google-owned place data into Hygraph.
7. Treat Hygraph schema and demonstration content as code. Apply them with `pnpm` scripts. Use Hygraph MCP only to inspect and verify.

## 3. Success Criteria

The project is successful when:

- Three cities are seeded. The public site shows one city at a time, with at least:
  - 2 published places
  - 3 categories
  - 2 neighborhoods
  - 3 supported locales (`en-US`, `pt-BR`, `zh-CN`)
- Visitors can browse places, filter them, view details, and open directions.
- Visitors can view the current weather and a three-day forecast.
- Visitors can view published places on an interactive map.
- Editors can create and update content without changing frontend code.
- A content editor can create a draft and a publisher can publish it.
- At least one content change is scheduled for future publication.
- A Hygraph webhook triggers frontend cache invalidation or revalidation.
- The weather integration is demonstrated through a Hygraph Remote Source/Content Federation query.
- The public site continues to function when the weather API or Google Maps is unavailable.
- No CMS, weather, or management credentials are exposed in the browser.

## 4. Target Users

### 4.1 Visitor

A local resident or tourist who wants to find places to visit, eat, shop, or explore.

### 4.2 Content Editor

A person responsible for adding places, updating descriptions, uploading images, translating content, and organizing categories.

### 4.3 Publisher

A person responsible for reviewing content and publishing or scheduling changes.

## 5. Scope

### 5.1 MVP Scope

- Three seeded cities; visitor selects a city from the URL (`/{locale}/{city}`)
- City landing page
- Places listing page
- Place detail pages
- Category filtering
- Neighborhood filtering
- Interactive map of published places, using Hygraph Map field coordinates
- Directions links
- Current weather
- Three-day forecast
- Three locales (`en-US`, `pt-BR`, `zh-CN`) with fallback to `en-US`
- Hygraph-managed editorial content, applied from repository code
- `pnpm hygraph:backup`, `pnpm hygraph:reset`, and `pnpm hygraph:seed`
- Modular home page sections
- Draft and published content stages
- Scheduled publishing demonstration
- Webhook-triggered revalidation
- Responsive and accessible UI
- Basic SEO metadata

### 5.2 Optional Enhancements

These are not required for the certification project:

- Itineraries
- Events
- User accounts
- Favorites
- Reviews
- Booking links
- Google Places autocomplete
- Air quality information
- Public transport information
- User-generated content
- Offline or native mobile applications

### 5.3 Non-Goals

The MVP will not:

- Provide turn-by-turn navigation.
- Store or reproduce Google Maps place details, photos, reviews, or opening hours.
- Import coordinates or place data from the Google Places API or other Google Maps APIs.
- Guarantee that third-party opening hours are always current.
- Allow visitors to edit CMS content.
- Store weather as permanent editorial content.
- Implement a full travel booking workflow.

## 6. User Stories

### Visitor Stories

- As a visitor, I can see an overview of the city and featured places.
- As a visitor, I can browse all published places.
- As a visitor, I can filter places by category and neighborhood.
- As a visitor, I can open a place detail page.
- As a visitor, I can view a place on a map.
- As a visitor, I can open Google Maps directions for a place.
- As a visitor, I can see current weather and a short forecast.
- As a visitor, I can switch between supported languages.
- As a visitor, I can still use the guide if weather or map services are unavailable.

### Editor Stories

- As an editor, I can create a place and associate it with categories and a neighborhood.
- As an editor, I can set city, place, and neighborhood coordinates with the Hygraph Map field.
- As an editor, I can upload images and edit rich text.
- As an editor, I can manage localized content.
- As an editor, I can arrange home page sections using modular content.
- As an editor, I can save content as a draft.

### Publisher Stories

- As a publisher, I can review and publish content.
- As a publisher, I can schedule content for future publication.
- As a publisher, when I publish content, a webhook revalidates the frontend.

## 7. Information Architecture

The CMS contains three cities. The public site shows one city at a time from the URL. `/{locale}` redirects to the first Published city (`createdAt_ASC`). Visitors switch city in the header.

Seeded cities:

| Slug            | City                      | Timezone              |
| --------------- | ------------------------- | --------------------- |
| `florianopolis` | Florianópolis, SC, Brazil | `America/Sao_Paulo`   |
| `araucaria`     | Araucária, PR, Brazil     | `America/Sao_Paulo`   |
| `san-francisco` | San Francisco, CA, USA    | `America/Los_Angeles` |

| Route                             | Purpose                                                                 |
| --------------------------------- | ----------------------------------------------------------------------- |
| `/{locale}`                       | Redirect to the first Published city                                    |
| `/{locale}/{city}`                | City landing page                                                       |
| `/{locale}/{city}/places`         | Published place listing                                                 |
| `/{locale}/{city}/places/{slug}`  | Place detail page                                                       |
| `/{locale}/{city}/map`            | Full map view of published places                                       |
| `/{locale}/categories/{slug}`     | Optional convenience route; category filtering is required on `/places` |
| `/sitemap.xml`                    | Search engine sitemap                                                   |
| `/robots.txt`                     | Search engine crawling rules                                            |

Locales are `en-US` (default), `pt-BR`, and `zh-CN`. URL prefixes use these codes.

## 8. Hygraph Content Model

### 8.1 `City`

The city is the primary landing-page content model and the source of geographic information for weather and maps.

| Field          | Type                                        | Localized | Required |
| -------------- | ------------------------------------------- | --------: | -------: |
| `name`         | Single-line text                            |       Yes |      Yes |
| `slug`         | Slug, unique                                |        No |      Yes |
| `country`      | Single-line text                            |        No |      Yes |
| `timezone`     | Single-line text using IANA timezone format |        No |      Yes |
| `location`     | Map (Location)                              |        No |      Yes |
| `intro`        | Rich text                                   |       Yes |      Yes |
| `heroImage`    | Asset                                       |        No |      Yes |
| `pageSections` | Modular Content                             |        No |      Yes |
| `seo`          | SEO component                               |        No |       No |

`pageSections` should support:

- `HeroBlock`
- `RichTextBlock`
- `FeaturedPlacesBlock`
- `WeatherBlock`
- `MapBlock`
- `CallToActionBlock`

`pageSections` is not localized as a unit. Localized copy lives on the fields inside each block, as listed in FR-06.

`slug` fields use Hygraph's native Slug type, generated from `name` where the schema allows. Do not store slugs as ordinary single-line text.

`location` is Hygraph's native Map field. In GraphQL it is the Location type and returns `latitude` and `longitude`. Editors pick the point on the map widget. Do not store separate decimal coordinate fields. See [Hygraph Map field](https://hygraph.com/docs/editor-guides/content/field-types#map) and [Location type](https://hygraph.com/docs/api-reference/schema/field-types).

`heroImage` is the required landing-page hero asset. `HeroBlock` is an optional modular section and must not duplicate `heroImage` as a second required hero.

### 8.2 `Place`

A curated location in the city.

| Field                | Type                                         | Localized | Required |
| -------------------- | -------------------------------------------- | --------: | -------: |
| `name`               | Single-line text                             |       Yes |      Yes |
| `slug`               | Slug, unique                                 |        No |      Yes |
| `summary`            | Single-line text                             |       Yes |      Yes |
| `description`        | Rich text                                    |       Yes |      Yes |
| `city`               | Reference to `City`                          |        No |      Yes |
| `categories`         | Multiple references to `Category`            |        No |      Yes |
| `neighborhood`       | Reference to `Neighborhood`                  |        No |       No |
| `address`            | Single-line text                             |        No |      Yes |
| `location`           | Map (Location)                               |        No |      Yes |
| `googlePlaceId`      | Single-line text                             |        No |       No |
| `websiteUrl`         | URL                                          |        No |       No |
| `phone`              | Single-line text                             |        No |       No |
| `priceBand`          | Enumeration: `BUDGET`, `MODERATE`, `PREMIUM` |        No |       No |
| `openingHours`       | List of `OpeningHours` components            |        No |       No |
| `images`             | Multiple assets                              |        No |      Yes |
| `isFeatured`         | Boolean                                      |        No |      Yes |
| `accessibilityNotes` | Rich text                                    |       Yes |       No |
| `lastVerified`       | Date                                         |        No |      Yes |
| `seo`                | SEO component                                |        No |       No |

`location` is Hygraph's native Map field. Marker and directions coordinates must come from this field.

The `googlePlaceId` is optional. It may be used only to construct a Google Maps directions URL. It is not a license to copy Google-owned place details into Hygraph.

### 8.3 `Category`

| Field         | Type             | Localized | Required |
| ------------- | ---------------- | --------: | -------: |
| `name`        | Single-line text |       Yes |      Yes |
| `slug`        | Slug, unique     |        No |      Yes |
| `description` | Rich text        |       Yes |       No |
| `iconKey`     | Enumeration      |        No |      Yes |
| `sortOrder`   | Integer          |        No |      Yes |

`iconKey` is a Hygraph enumeration. The frontend maps each value to one icon. Allowed values:

- `FOOD_AND_DRINK`
- `CULTURE`
- `OUTDOORS`
- `SHOPPING`
- `HISTORIC_SITES`

Do not use a free-text key or a custom icon asset for the MVP.

### 8.4 `Neighborhood`

| Field         | Type                | Localized | Required |
| ------------- | ------------------- | --------: | -------: |
| `name`        | Single-line text    |       Yes |      Yes |
| `slug`        | Slug, unique        |        No |      Yes |
| `description` | Rich text           |       Yes |       No |
| `city`        | Reference to `City` |        No |      Yes |
| `location`    | Map (Location)      |        No |       No |

Neighborhood `location` is optional. The visitor map and weather use City and Place coordinates, not neighborhood coordinates.

### 8.5 Reusable Components

Unless noted, heading, body, eyebrow, label, and other visitor-facing copy fields on these components are localized. Structural fields such as URLs, layout, zoom, and boolean display flags are not localized.

#### `SEO`

- `title` (localized)
- `description` (localized)
- `image`
- `noIndex`

#### `OpeningHours`

- `day` — Enumeration: `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`, `SUNDAY`
- `closed` — Boolean
- `opensAt` — Single-line text, 24-hour `HH:mm`, required when `closed` is false
- `closesAt` — Single-line text, 24-hour `HH:mm`, required when `closed` is false

Hygraph has no time-only field. `HH:mm` text is the constrained format. The MVP may use one regular weekly schedule. Seasonal or holiday hours are outside the scope.

#### `HeroBlock`

- `eyebrow`
- `heading`
- `body`
- `image`
- `callToActionLabel`
- `callToActionUrl`

#### `RichTextBlock`

- `heading`
- `body`

#### `FeaturedPlacesBlock`

- `heading`
- `places`
- `layout` — Enumeration: `GRID`, `CAROUSEL`

When this block is present, display its `places` references. If `places` is empty, fall back to published places with `isFeatured` set to true. Seed content may use mocked `layout` and `priceBand` values.

#### `WeatherBlock`

- `heading`
- `showCurrent`

Weather values are not authored in this component. The component controls placement and presentation only. The MVP always displays a three-day forecast.

#### `MapBlock`

- `heading`
- `initialZoom`
- `showFeaturedOnly`

The map derives its markers from the `location` Map field on published `Place` entries. City `location` is the default map center. Neighborhood `location` is optional editorial context and is not required by the visitor map.

#### `CallToActionBlock`

- `heading`
- `body`
- `label`
- `url`

## 9. Relationships

```
text
City 1 ──── many Place
City 1 ──── many Neighborhood
Place many ──── many Category
Place many ──── 1 Neighborhood
City.pageSections ──── FeaturedPlacesBlock ──── many Place
```

The frontend must query relationships through GraphQL rather than duplicating related content.

## 10. Functional Requirements

### FR-01: City Landing Page

The landing page must:

- Render all published City content from Hygraph.
- Render the City modular content blocks in their configured order.
- Display a hero using `heroImage`, and `HeroBlock` when that block is present.
- Display featured places. Prefer `FeaturedPlacesBlock.places` when that block is present and has places; otherwise use published places with `isFeatured`.
- Display the weather panel. Use `WeatherBlock` when present; otherwise render a default weather panel from City `location`.
- Display a map or a link to `/{locale}/map`. Use `MapBlock` when present; otherwise link to the full map page.
- Render localized content according to the selected locale.

### FR-02: Place Discovery

The places page must:

- Display published places associated with the configured city.
- Support filtering by category.
- Support filtering by neighborhood.
- Display an empty state when no places match.
- Preserve the selected locale.
- Use CMS content for all place cards.

Keyword search may be implemented as a client-side enhancement for the small MVP dataset.

### FR-03: Place Detail

A place detail page must display:

- Name
- Summary
- Rich description
- Images
- Address
- Categories
- Neighborhood, when available
- Opening hours, when available
- Accessibility information, when available
- A map location from the Place `location` Map field
- A link to Google Maps directions, using `googlePlaceId` when present and `location` coordinates otherwise
- Last editorial verification date

External URLs must only allow safe `http` and `https` schemes.

### FR-04: Visitor Map

The map integration must:

- Read marker and center coordinates from Hygraph Map fields (`location.latitude` and `location.longitude`).
- Use City `location` as the default map center.
- Display published Place markers from Place `location`.
- Display CMS-managed place information in marker information windows.
- Allow a visitor to select a marker and highlight the corresponding place.
- Provide a list-based alternative to map interaction on the map page and on place detail.
- Provide a “Get directions” link that opens Google Maps in a new browsing context.
- Load the Google Maps JavaScript API lazily so the map does not block the initial page render.
- Display required Google attribution and controls.
- Remain usable when the Google Maps JavaScript API fails to load.

The MVP must not use the Google Places API, Google Maps Geocoding API, or any other Google Maps API as a content source. Editors pick coordinates in the Hygraph Map field. The frontend must not geocode arbitrary visitor input.

Google Maps JavaScript API is used only to render the visitor map from Hygraph coordinates. Rendering must not copy Google-owned place details into Hygraph.

### FR-05: Weather Syndication

The weather panel must display:

- Current temperature
- Apparent temperature, where available
- Current conditions
- Wind speed, where available
- A three-day forecast
- Forecast high and low temperatures
- Forecast condition labels
- Observation or retrieval time
- Weather provider attribution

Open-Meteo is the weather provider. It can be used without a server-side API key.

Example request:

```
text
https://api.open-meteo.com/v1/forecast
?latitude={city.location.latitude}
&longitude={city.location.longitude}
&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m
&daily=weather_code,temperature_2m_max,temperature_2m_min
&forecast_days=3
&timezone={cityTimezone}
&temperature_unit=celsius
&wind_speed_unit=kmh
```

The required implementation is:

1. Add a REST Remote Source for Open-Meteo.
2. Add a Remote Field on the `City` model that passes `location.latitude`, `location.longitude`, and `timezone` into the provider request.
3. Query weather through the Hygraph Content API together with City content.
4. Normalize the remote response in the frontend server layer.
5. Render the normalized result in `WeatherBlock`.

Remote Sources are a project prerequisite. Official Hygraph docs require a Growth plan or higher, or a 30-day trial. If the current project cannot create a Remote Source, upgrade or start a trial before implementation. Do not replace this path with a custom server-side weather adapter.

Weather data must not be manually stored as permanent Hygraph content. The CMS controls the city coordinates through the City Map field and the placement of the weather block; the weather API owns current and forecast values.

Weather requests should be cached for approximately ten minutes, subject to the provider’s terms and rate limits.

### FR-06: Localization

The site must support three locales: `en-US` (default), `pt-BR`, and `zh-CN`.

Localized fields should include:

- City name and introduction
- Place name, summary, description, and accessibility notes
- Category name and description
- Neighborhood name and description
- Modular block copy
- SEO title and description

The frontend must:

- Provide a locale switcher.
- Use the selected locale in URLs.
- Fall back to the default locale when a translation is missing.
- Localize weather condition labels through application translations.
- Format dates and times using the City timezone.

### FR-07: Content Workflow

The Hygraph project must support:

- Draft content
- Published content
- A content editor role
- A publishing or approval role, where supported by the plan
- Scheduled publication of at least one content change

The public frontend must query the Published stage only.

### FR-08: Webhook Revalidation

A Hygraph webhook must notify the frontend when relevant content is published.

The frontend must:

- Authenticate webhook requests.
- Revalidate affected pages or cache tags.
- Avoid accepting arbitrary unauthenticated paths for revalidation.
- Log enough information to troubleshoot failures without logging secrets.

### FR-09: Error Handling

The site must remain usable when:

- The weather provider times out.
- The weather provider returns invalid data.
- Google Maps fails to load.
- The CMS returns no places.
- A place has no Google Place ID.
- A neighborhood has no `location`.
- A translation is missing.
- An image is missing.

Weather and map failures must show clear fallback messages and must not prevent the editorial content from rendering.

### FR-10: Hygraph as Code

The repository is the source of the Hygraph schema and demonstration content. Hygraph is the runtime store.

Required `pnpm` scripts:

| Script                | Purpose                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm hygraph:backup` | Export the current schema, and content when the Management API allows it, into a timestamped backup under the repo (gitignored or `backups/`). |
| `pnpm hygraph:reset`  | Run backup first, then reset the development environment and reapply the schema from the repo.                                                 |
| `pnpm hygraph:seed`   | Add or update mock content from repo fixtures. Idempotent. Uses stable slugs.                                                                  |
| `pnpm hygraph:update-weather-remote` | Backup first, then patch `City.weather` Path and input args when `hygraph:reset` fail-closes because models already exist. |

Rules:

- Schema and mock fixtures live in version control.
- Only these scripts, using the Hygraph Management API / [Management SDK](https://hygraph.com/docs/api-reference/management-sdk/management-sdk-quickstart) and Content API, may create or change schema or entries.
- Official [Schema as Code](https://hygraph.com/docs/api-reference/schema/schema-as-code) export is the backup path for schema.
- Schema import is additive. It does not replace an existing schema. `hygraph:reset` must fail closed if it cannot produce a clean environment, rather than merging into an unknown schema.
- The Hygraph MCP server is read-only for this project. Agents may use it to inspect schema, query content, and compare results with the repo. They must not call MCP tools that create, update, publish, or delete schema or entries (`create_entry`, `update_entry`, `publish_entry`, `submit_batch_migration`, and write `execute_graphql` mutations).
- Do not apply schema or seed data through the Hygraph UI except to recover from a documented script failure.

## 11. Technical Architecture

```
text
Visitor Browser
|
v
Frontend application
|
+--> Hygraph Content API
|       |
|       +--> Editorial content
|       +--> Localized content
|       +--> Map field coordinates (Location)
|       +--> Weather Remote Source (Open-Meteo via City Remote Field)
|
+--> Google Maps JavaScript API (render only; coordinates from Hygraph)

Local scripts (pnpm)
|
+--> hygraph:backup  --> schema-as-code export
+--> hygraph:reset   --> backup, then apply repo schema
+--> hygraph:seed    --> mock fixtures via Content API

Hygraph MCP (read-only)
|
+--> inspect schema and content
+--> verify script results
```

### Data Ownership

| Data                         | System of record                                    |
| ---------------------------- | --------------------------------------------------- |
| Schema definition            | Repository, applied by `pnpm` scripts               |
| Mock / seed content          | Repository fixtures, applied by `pnpm hygraph:seed` |
| City content                 | Hygraph at runtime                                  |
| Place descriptions           | Hygraph at runtime                                  |
| Categories and neighborhoods | Hygraph at runtime                                  |
| Coordinates                  | Hygraph Map field, editor-verified                  |
| Current weather and forecast | Weather provider                                    |
| Visitor map tiles/rendering  | Google Maps JavaScript API; not stored in Hygraph   |
| Google-owned place details   | Not copied to Hygraph                               |

## 12. Non-Functional Requirements

### Performance

- Render editorial content without waiting for Google Maps.
- Lazy-load the map.
- Cache weather responses for approximately ten minutes.
- Use optimized image sizes and lazy loading.
- Avoid unnecessary GraphQL requests and N+1 relationship queries.
- Target a good Lighthouse score on mobile.

### Accessibility

- Meet WCAG 2.2 AA expectations where practical.
- Provide keyboard-accessible filters and links.
- Provide a list alternative to map-only interaction.
- Use semantic headings and landmarks.
- Provide visible focus states.
- Add meaningful image alternative text.
- Ensure sufficient color contrast.
- Announce filter and weather states appropriately.

### Security

- Never expose Hygraph Management API tokens to the browser.
- Use Hygraph MCP only to read and verify. Do not mutate schema or content through MCP.
- Never expose a weather API key to the browser.
- The Google Maps browser key must be restricted by HTTP referrer and API quota.
- Validate webhook authentication.
- Validate external URLs.
- Sanitize or safely render rich text.
- Do not accept arbitrary coordinates or URLs from query parameters for server-side fetches.

### SEO

- Generate localized page titles and descriptions.
- Generate canonical URLs.
- Provide an XML sitemap.
- Provide robots rules.
- Add appropriate structured data where practical, such as `TouristAttraction` or `Place`.
- Do not index draft or preview content.

### Legal and Attribution

- Follow Google Maps Platform terms and display required attribution.
- Follow the weather provider’s attribution and caching terms.
- Use only owned, licensed, public-domain, or properly attributed images.
- Approved seed image sources:
  - [Unsplash License](https://unsplash.com/license) — primary source for hero and place photos.
  - [Pexels License](https://www.pexels.com/license/) — secondary source when Unsplash coverage is thin.
  - [Wikimedia Commons](https://commons.wikimedia.org/wiki/Commons:Licensing) — landmarks when a specific place photo is needed. Keep the file license and attribution on the Hygraph asset.
- Do not use Google, Google Maps, or Google Places photos.
- Record source URL, license, and attribution on each seeded asset.
- Do not copy Google reviews, photos, opening hours, or place descriptions into Hygraph.

## 13. Acceptance Criteria

- [ ] `pnpm hygraph:backup`, `pnpm hygraph:reset`, and `pnpm hygraph:seed` exist and are documented.
- [ ] Schema and mock content can be reproduced from the repository without using Hygraph MCP write tools.
- [ ] Hygraph contains City, Place, Category, and Neighborhood models.
- [ ] Relationships are visible and queryable through GraphQL.
- [ ] The City landing page is assembled through Modular Content.
- [ ] Three locales (`en-US`, `pt-BR`, `zh-CN`) are configured and demonstrated.
- [ ] Three cities are seeded; the public site shows the city from `/{locale}/{city}` and lists Published cities in the header.
- [ ] The active city has at least two published places.
- [ ] Category and neighborhood filters work.
- [ ] Place detail pages display localized editorial content.
- [ ] Current weather and a three-day forecast render successfully.
- [ ] Weather attribution and update time are visible.
- [ ] Weather failure produces a non-blocking fallback state.
- [ ] The visitor map displays published place markers from Hygraph Map fields.
- [ ] Marker selection and the place list remain synchronized.
- [ ] Directions links work with and without a Google Place ID.
- [ ] The map has a usable list fallback.
- [ ] Draft content is not visible on the public site.
- [ ] A scheduled content update is demonstrated.
- [ ] A published content change triggers webhook revalidation.
- [ ] No management or server-only tokens appear in the browser bundle.
- [ ] The project has responsive and keyboard-accessible layouts.
- [ ] README documentation explains setup, integrations, environment variables, and limitations.

## 14. Risks and Mitigations

| Risk                                               | Mitigation                                                         |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| Remote Sources are unavailable on the Hygraph plan | Upgrade to Growth or start a 30-day trial before implementation    |
| Google Maps requires billing                       | Create a restricted key and set quotas before implementation       |
| Weather API rate limits                            | Cache responses and handle stale or unavailable data               |
| Coordinates are inaccurate                         | Require editor verification and a `lastVerified` field             |
| Opening hours become outdated                      | Display the verification date and use editorial review             |
| Missing translations reduce quality                | Provide locale fallback and seed translations for core content     |
| Third-party data licensing changes                 | Keep external data out of Hygraph unless explicitly permitted      |
| Schema import is additive, not a wipe              | Backup first; fail `hygraph:reset` if the environment is not clean |
| MCP write tools used by accident                   | Project rule: MCP is read-only; only `pnpm` scripts mutate Hygraph |

## 15. Resolved Decisions

1. **Cities.** Seed Florianópolis, Araucária, and San Francisco. The public site shows one city from `/{locale}/{city}`. `/{locale}` redirects to the first Published city (`createdAt_ASC`). Visitors switch city in the header. See D-A2-9.
2. **Locales.** `en-US` (default), `pt-BR`, and `zh-CN`.
3. **Weather.** Hygraph REST Remote Source to Open-Meteo, with a Remote Field on `City`.
4. **Visitor Google Maps key domains.** Deferred. Use placeholders such as `http://localhost:3000` until production domains are known.
5. **Seed images.** Unsplash first, Pexels second, Wikimedia Commons for specific landmarks. Store license and attribution on the asset. No Google photos.
6. **`priceBand`.** `BUDGET`, `MODERATE`, `PREMIUM`. Seed may use mocked values.
7. **`FeaturedPlacesBlock.layout`.** `GRID`, `CAROUSEL`. Seed may use mocked values.
8. **`iconKey`.** Hygraph enumeration mapped to frontend icons. Values: `FOOD_AND_DRINK`, `CULTURE`, `OUTDOORS`, `SHOPPING`, `HISTORIC_SITES`.
9. **`OpeningHours.day`.** Hygraph enumeration `MONDAY`–`SUNDAY`. Times are `HH:mm` text.
10. **Slugs.** Hygraph native Slug fields.
11. **Hygraph as code.** Schema and mock content live in the repo. `pnpm hygraph:backup`, `pnpm hygraph:reset`, `pnpm hygraph:seed`, and `pnpm hygraph:update-weather-remote` are the only mutation path. Hygraph MCP is read-only verification.
