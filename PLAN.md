# PLAN.md — CityCompass Implementation Plan

**Status:** Ready for implementation  
**Related documents:** `PRD.md`, `AGENTS.md`

Agent rules, MCP policy, secrets, and handoff format are in `AGENTS.md`. This file is the implementation plan only.

## 1. Objective

Build and document the CityCompass local city guide using Hygraph, a weather API, and a visitor map. Store coordinates in Hygraph Map (Location) fields. Use Google Maps JavaScript API only to render those coordinates. Apply Hygraph schema and mock content from the repository with `pnpm` scripts.

## 2. Agent Rules

See `AGENTS.md`.

## 3. Required Human Prerequisites

Before implementation begins, a human must:

- Create or select the Hygraph project.
- Confirm that all three cities will be seeded. The public site uses `/{locale}/{city}` (D-A2-9).
- Configure locales `en-US`, `pt-BR`, and `zh-CN`.
- Confirm the Hygraph plan includes Remote Sources/Content Federation (Growth or higher, or a 30-day trial).
- Use Unsplash, Pexels, or Wikimedia Commons for seed images, with license and attribution on each asset.

Google Maps credentials are not required for Story 1. For Story 2, leave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` unset; the app must run with a map placeholder. A real key, Map ID, billing, and domain restriction are a later human step (A9), not a Story 2 blocker.

Do not accept cloud billing agreements or expose credentials in prompts or commits.

## 4. Recommended Repository Structure

```
text
citycompass/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx
│   │   ├── places/
│   │   └── map/
│   └── api/
│       └── revalidate/
├── components/
│   ├── content/
│   ├── weather/
│   ├── maps/
│   └── places/
├── lib/
│   ├── hygraph/
│   ├── weather/
│   ├── maps/
│   └── validation/
├── scripts/
│   └── hygraph/
│       ├── backup.ts
│       ├── reset.ts
│       └── seed.ts
├── hygraph/
│   ├── schema/          # schema-as-code definition
│   └── fixtures/        # mock cities, places, locales, assets metadata
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
├── evidence/
├── .env.example
├── AGENTS.md
├── PRD.md
├── PLAN.md
└── README.md
```

Stack: Next.js App Router, TypeScript, `pnpm`. Keep the architecture portable to another framework if required.

## 5. Environment Variables

The exact names may be adjusted during implementation, but the separation between public and server-only values must be preserved.

```
text
HYGRAPH_CONTENT_API_URL=
HYGRAPH_READ_TOKEN=
HYGRAPH_PREVIEW_TOKEN=
HYGRAPH_MANAGEMENT_API_URL=
HYGRAPH_MANAGEMENT_TOKEN=
HYGRAPH_WEBHOOK_SECRET=

DEFAULT_LOCALE=en_US
SUPPORTED_LOCALES=en_US,pt_BR,zh_CN

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Rules:

- `HYGRAPH_MANAGEMENT_TOKEN` is for `pnpm` Hygraph scripts only. Do not pass it to the Hygraph MCP server for write operations.
- `HYGRAPH_MANAGEMENT_API_URL` is the regional Management API GraphQL endpoint from **Project Settings → Access → Endpoints**. Schema as Code queries use it. The Management SDK `endpoint` option is the Content API URL; pass this value as `managementEndpoint` so the SDK does not derive the wrong region.
- `HYGRAPH_PREVIEW_TOKEN` must never be used for public requests.
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` may stay empty. Story 2 must not crash; use the list/placeholder map path. Do not treat an empty key as a blocker.
- No Hygraph or weather credentials may use a `NEXT_PUBLIC_` prefix.

## 6. Delivery Graph

Two stories. Story 2 does not start until Story 1 meets its success criteria.

```
text
Story 1 — Backend / CMS as code
A0 → A1 (human approve schema-manifest) → A2 → A3
Success: pnpm hygraph:backup, hygraph:reset, and hygraph:seed run as expected; mock data is in Hygraph (Published + draft/scheduled as specified).

Story 2 — Consuming Next.js frontend  (only after Story 1 success)
A4 + A5 + A6 → A7 (handler + docs; no live HTTPS test yet)
→ A8 (frontend QA; webhook unit/auth tests only)
→ live HTTPS webhook test (last)
→ A9 (human deploy, Maps key, production webhook URL)
```

Do not seed until A2 is verified. Do not treat A9 deploy as an agent task. Do not block Story 2 on a Google Maps API key or a public HTTPS webhook URL.

## 7. Implementation Phases

### 7.0 Orchestration contract

Use this section to run agents in sequence. Do not invent field names, packages, or business rules. If a **Human gate** is unmet, stop.

#### Stories

**Story 1 — Backend and CMS as code**

Phases: A0, A1, A2, A3. Roles: Auditor, Schema planner, Schema scripter, Seeder. No visitor UI work.

Success criteria:

- `pnpm hygraph:backup` runs and writes a schema backup (content export when the API allows).
- `pnpm hygraph:reset` applies `hygraph/schema/` (fail closed if the environment is not clean).
- `pnpm hygraph:seed` is idempotent and loads fixtures, including mock cities, places, categories, neighborhoods, locales, and assets metadata.
- Read-only MCP or GraphQL confirms the live schema and published mock data.
- Remote Source and City weather Remote Field exist (configured in A2). Weather UI is Story 2.

**Story 2 — Consuming Next.js frontend**

Phases: A4, A5, A6, A7, A8, then live webhook test, then A9. Start only after Story 1 success. The Next.js scaffold already exists; A6 is locale routes and CMS pages, not `create-next-app`.

Success criteria (before the live webhook test):

- Public routes render Published Hygraph content for the city slug in the URL.
- Weather panel uses the A2 Remote Field (normalize in `lib/weather`).
- Map code is ready: if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is unset, show a placeholder and the list fallback; do not load the Maps JavaScript API. Directions links still work from Hygraph coordinates / optional Place ID.
- `POST /api/revalidate` exists and rejects unauthenticated requests. Do not require a public HTTPS Hygraph webhook URL yet.

Live HTTPS webhook test is last in Story 2, after the handler and pages exist. Public webhook URL is TBD.

One role per pass (`AGENTS.md` §11). Do not combine Story 1 schema/seed with Story 2 frontend in one pass.

#### Defaults (from `PRD.md` / `AGENTS.md` / `README.md`)

| Topic | Default | Do not |
| --- | --- | --- |
| i18n | App Router `app/[locale]/` with URL prefixes `en_US`, `pt_BR`, `zh_CN` (same as Hygraph locale `apiId`; D-A2-6). No extra i18n package unless a human approves one. | Invent `en` / `pt` aliases; hyphenated `en-US` locale ids |
| CMS client | `fetch` to `HYGRAPH_CONTENT_API_URL` | Add a second CMS SDK |
| Schema scripts | `@hygraph/management-sdk` with `endpoint` = Content API URL and `managementEndpoint` = `HYGRAPH_MANAGEMENT_API_URL` | Derive the Management URL |
| Seed mutations | Content API create/update/publish using a PAT that has those Content API permissions. Prefer `HYGRAPH_MANAGEMENT_TOKEN` if that PAT includes them | Use Hygraph MCP writes; invent a fourth env name unless the PAT cannot mutate content |
| Webhook | Implement the handler in A7. Human Studio form per `README.md` when a public `https://` URL exists. Method `POST`. Secret = `HYGRAPH_WEBHOOK_SECRET`. Auth = Hygraph `gcms-signature`. Live Hygraph→app test is last in Story 2 | `http://localhost` as the Studio URL; treat missing HTTPS URL as a Story 2 implementation blocker; path-from-payload revalidation |
| Weather UI | Follow FR-01: `WeatherBlock` if present, otherwise a default weather panel from City `location` | A custom server weather adapter |
| Maps key | Unset for now. Placeholder UI + list fallback. Wire `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` / `MAP_ID` so a later key works without a rewrite | Require a key to finish Story 2; enable Places or Geocoding |
| Category path | `/[locale]/places` filters are required. `/[locale]/categories/[slug]` is optional; skip unless a later task asks | Treat the convenience route as MVP-blocking |
| Preview | Optional. Skip a Draft preview route unless a human asks. Public queries stay Published | Expose Draft with the read token |
| Packages | List the exact packages in the phase handoff. Do not add them until a human approves (`AGENTS.md` §10) | Silent lockfile changes |
| Tests | Unit tests in `tests/unit/` once a runner is approved. Do not add Vitest/Playwright until a human approves | Skip A4/A5 unit files; add a runner unprompted |
| Reset “clean” | Fail `hygraph:reset` if the live project already has unexpected CityCompass models or an unknown schema. Official import is additive | Wipe via undocumented APIs |
| Google Place IDs | Seed `googlePlaceId` only from human-verified values in fixtures. Empty is valid. Directions-with-Place-ID evidence needs at least one human-supplied ID | Call Google Places to look up IDs |
| Opening hours | Optional. Seed may omit. Do not invent hours | Copy Google hours |
| Roles | Human configures editor/publisher roles in Hygraph | Agent creates roles in Studio |
| Locales on the project | Human enables `en-US`, `pt-BR`, `zh-CN` before A2. A2 fails if they are missing | Agent “clicks” locales in Studio |
| A9 | Human deploys, optional Maps key, production HTTPS webhook URL. Agent prepares env list and evidence | Agent accept billing or production deploy |

#### Human gates (stop if unmet)

Story 1:

1. Hygraph Growth/trial with Remote Sources (A0).
2. Locales enabled on the project (before A2).
3. Approve `docs/schema-manifest.md` (before A2).
4. Approve `@hygraph/management-sdk` (and any other Story 1 packages) before install.
5. PAT used by `hygraph:seed` can mutate and publish Content API (A3).

Story 2:

6. Story 1 success criteria met.
7. Approve Story 2 packages (codegen, `@hygraph/utils`, test runner) before install.
8. At least one verified `googlePlaceId` in fixtures if Place-ID directions must be demonstrated.
9. Public `https://` webhook URL — **after** A7 handler exists; live test is last. Do not stop A4–A7 waiting for this URL.
10. Production deploy and Maps key (A9). Optional until a human is ready.

---

### A0 — Discovery and capability check

**Role:** Auditor. **Story:** 1. **Depends on:** nothing. **Blocks:** A1.

#### Objective

Confirm project constraints before any schema or frontend work begins.

#### Tasks
 
- Read `PRD.md`.
- Confirm the three seeded cities and locales `en-US`, `pt-BR`, and `zh-CN`.
- Inspect the Hygraph plan and verify:
  - Localization
  - Components
  - Modular Content
  - Content stages
  - Scheduled publishing
  - Webhooks
  - Remote Sources/Content Federation
  - Management API access
- Confirm whether Remote Sources can pass City `location.latitude`, `location.longitude`, and timezone to the weather provider.
- Confirm that City, Place, and Neighborhood use Hygraph Map (Location) fields rather than separate decimal coordinates.
- Confirm Google Maps JavaScript API requirements for visitor rendering only (key unset in Story 1 and Story 2 until a human provides one).
- Identify any plan limitations.
- Verify live project with read-only MCP (`get_project_info`) or GraphQL introspection. Do not mutate.
- Verify `.env.example` matches `AGENTS.md` §7. Do not recreate it from scratch. Do not print `.env.local`.

#### Deliverables

- `docs/capability-matrix.md`
- `docs/decisions.md` (only if A0 finds a conflict; otherwise record “no new decisions”)
- Confirmation that `.env.example` matches `AGENTS.md` §7
- Confirmation of PLAN §3 human prerequisites (Remote Sources, locales, Maps key)
- Weather is Hygraph Remote Source only (no `WEATHER_MODE` switch)

#### Acceptance Criteria

- The three seeded cities and locales are recorded.
- Remote Sources are confirmed available, or work stops with a plan-upgrade prerequisite.
- No credentials are committed or printed.
- The human prerequisites are clear.

---

### A1 — Schema design

**Role:** Schema planner. **Story:** 1. **Depends on:** A0. **Blocks:** A2. **Human gate:** approve `docs/schema-manifest.md` before A2.

#### Objective

Produce an approved Hygraph schema contract before the CMS is changed. Do not call Management API mutations. Do not invent GraphQL filter syntax; describe queries in terms of PRD fields.

#### Tasks

- Define the `City`, `Place`, `Category`, and `Neighborhood` models.
- Define all fields, field types, relationships, required fields, and localized fields.
- Use Hygraph Map (Location) fields named `location` for City, Place, and Neighborhood. Do not add separate latitude or longitude decimal fields.
- Define reusable components from PRD §8.5: `SEO`, `OpeningHours`, `HeroBlock`, `RichTextBlock`, `FeaturedPlacesBlock`, `WeatherBlock`, `MapBlock`, `CallToActionBlock`.
- Define enumerations from PRD §15: `iconKey`, `priceBand`, `FeaturedPlacesBlock.layout`, `OpeningHours.day`.
- Define the City Modular Content field (`pageSections`) and the six block types in PRD §8.1.
- Define the weather remote-source contract (Open-Meteo REST; City Remote Field inputs: `location.latitude`, `location.longitude`, `timezone`).
- Define the GraphQL data requirements for:
  - City landing page
  - Places listing
  - Place detail
  - Map page
- Define validation rules for:
  - Coordinates
  - URLs
  - Slugs
  - Required relationships
  - Localized content

#### Deliverables

- `docs/schema-manifest.md`
- `docs/relationship-diagram.md`
- `docs/graphql-contract.md`
- `docs/weather-remote-contract.md`

The schema manifest should be descriptive rather than dependent on unverified Management API mutation names.

#### Acceptance Criteria

- All PRD models and relationships are represented.
- The schema does not contain unnecessary models.
- City `location` Map field and timezone are available to the weather integration.
- Modular blocks can render the required home page.
- The schema supports locales `en-US`, `pt-BR`, and `zh-CN`.

---

### A2 — Hygraph schema as code

**Role:** Schema scripter. **Story:** 1. **Depends on:** human-approved A1. **Blocks:** A3 and Story 2. **Human gate:** approve `@hygraph/management-sdk` (and any other new packages) before install. Locales `en-US`, `pt-BR`, `zh-CN` must already exist on the project.

#### Objective

Express the approved schema as repository code and apply it with `pnpm` scripts. Verify with read-only MCP or GraphQL introspection.

#### Tasks

- Write the schema definition in `hygraph/schema/` using the official [Management SDK](https://hygraph.com/docs/api-reference/management-sdk/management-sdk-quickstart) and [Schema as Code](https://hygraph.com/docs/api-reference/schema/schema-as-code).
- Implement `pnpm hygraph:backup` (export current schema; export content when the API allows).
- Implement `pnpm hygraph:reset` (backup first, then apply the repo schema). Fail closed if the environment is not clean. Official schema import is additive and does not wipe an existing schema.
- Include City, Place, and Neighborhood `location` Map (Location) fields.
- Include reusable components, Modular Content, locales `en-US`, `pt-BR`, and `zh-CN`, stages, and the Open-Meteo REST Remote Source plus City Remote Field.
- Do not create schema through Hygraph MCP or the Studio UI.
- Do not create the webhook in this phase. Webhooks are project automation. The human Studio form is TBD until a public HTTPS URL exists. Live Hygraph→app test is last in Story 2. If official Schema as Code cannot express Remote Sources, stop and record the gap in `docs/decisions.md`.
- After the script runs, verify with read-only MCP (`get_project_info`, `list_entity_types`) or GraphQL introspection.

#### Webhook Requirements

Deferred to A7 (handler + docs) plus a later human Studio form when a public `https://` URL exists. A2 must not POST to `/api/revalidate` or write webhook URLs into the repo.

#### Deliverables

- Working Hygraph schema
- `docs/hygraph-setup.md`
- `docs/remote-source-setup.md`
- `evidence/schema-overview.png`
- `evidence/localization.png`
- `evidence/modular-content.png`
- `evidence/remote-source.png`
- Verified GraphQL response examples with secrets removed

#### Acceptance Criteria

- `pnpm hygraph:backup` and `pnpm hygraph:reset` exist and are documented.
- Schema matches the approved manifest after a script run, confirmed by read-only inspection.
- Introspection shows City, Place, Category, Neighborhood, components, enums, Map `location` fields, and the City weather Remote Field.
- Published queries may return empty until A3. Do not treat empty content as A2 failure.
- Localized values can be retrieved.
- A Modular Content query returns the configured block types.
- The weather Remote Source and City Remote Field exist on the schema. A live weather payload can wait until A3 has a published City with `location`.
- No secrets appear in documentation or evidence.

---

### A3 — Content fixtures and seed

**Role:** Seeder. **Story:** 1. **Depends on:** verified A2. **Blocks:** Story 2. **Human gate:** seed PAT can create, update, and publish via the Content API. Optional: one verified `googlePlaceId` in fixtures.

#### Objective

Populate Hygraph with a small, credible demonstration dataset.

#### Tasks

Create:

- Three Cities: Florianópolis, Araucária, and San Francisco
- At least two Places per city
- At least three Categories
- At least two Neighborhoods per city
- At least one home page configuration using Modular Content per city
- Content in `en-US`, `pt-BR`, and `zh-CN`
- At least one draft record
- At least one scheduled content update
- Place and category images from Unsplash, Pexels, or Wikimedia Commons, with license and attribution stored on the asset

For every Place:

- Set and verify the `location` Map field.
- Add at least one category.
- Add a city relationship.
- Add a suitable image or approved placeholder.
- Add `lastVerified`.
- Add a Google Place ID only when a human has placed a verified value in `hygraph/fixtures/`. Otherwise leave it empty.
- Do not invent opening hours. Omit `openingHours` unless fixtures include editorial hours written for this project.
- Do not use unlicensed images. Record source URL, license, and attribution on each asset.

The seed process is `pnpm hygraph:seed`. It must be idempotent. Running it again must update or reuse records rather than create duplicates. Do not seed through Hygraph MCP or the Studio UI.

Publish seeded public records through the Content API in the script, not MCP `publish_entry`.

Scheduled publishing: if official Content or Management API docs support scheduling, seed one future publish that way. If they do not, stop and ask a human to schedule one entry in Studio, then record that exception in `docs/content-seed-report.md` (allowed only for this demonstration, not for routine seed).

After the script runs, verify with read-only MCP or GraphQL.

#### Deliverables

- `scripts/hygraph/seed.ts`
- `hygraph/fixtures/`
- `package.json` script `hygraph:seed`
- `docs/content-seed-report.md`
- `evidence/scheduled-publishing.png`
- Asset credits or source documentation
- A list of records created

#### Acceptance Criteria

- The public GraphQL query returns the expected published dataset.
- Filters have enough content to demonstrate their behavior.
- At least the City and core Places contain translations.
- Draft and scheduled records are present.
- Re-running the seed process does not duplicate records.

---

### A4 — Weather integration

**Role:** Weather. **Story:** 2 (after Story 1). **Depends on:** A2 Remote Field exists (for live query). Types and normalize may be written only after Story 1 success. **Must not:** create or change the Remote Source (that is A2). **Must not:** add a custom server weather HTTP adapter.

#### Objective

Implement live weather syndication behind a stable application interface.

#### Canonical Interface

The frontend should consume a normalized view model similar to:

```
typescript
type WeatherViewModel = {
provider: string;
attributionUrl: string;
timezone: string;
retrievedAt: string;
current: {
  temperature: number;
  apparentTemperature?: number;
  weatherCode: number;
  conditionLabel: string;
  windSpeed?: number;
  observationTime?: string;
};
forecast: Array<{
  date: string;
  minTemperature: number;
  maxTemperature: number;
  weatherCode: number;
  conditionLabel: string;
}>;
};
```

#### Required Implementation

- Query weather through the Hygraph Content API City Remote Field created in A2.
- Normalize the response in the server-side data layer (`lib/weather`).
- Placement follows FR-01: render `WeatherBlock` when present; otherwise render a default weather panel using City `location`.
- Cache the Hygraph/weather query on the Next.js server for about ten minutes. Do not cache by calling Open-Meteo directly from Next.js.
- Do not implement a custom server-side weather adapter as a substitute.

#### Required Behaviors

- Timeout requests.
- Validate provider responses.
- Cache for approximately ten minutes.
- Map weather codes to localized application labels.
- Show provider attribution.
- Display a non-blocking fallback when the API fails.
- Use the City timezone when formatting dates and times.
- Do not accept arbitrary provider URLs from users.

#### Deliverables

- `lib/weather/types.ts`
- `lib/weather/normalize.ts`
- `lib/weather/remote-source.ts`
- Unit tests for normalization and WMO condition codes
- `docs/weather-integration.md`

#### Acceptance Criteria

- Current conditions render for the configured City.
- Three forecast days render.
- Weather labels are localized.
- Provider attribution is visible.
- Weather failure does not break the City page.
- No weather credentials appear in client-side code.
- The chosen integration mode is documented accurately.

---

### A5 — Visitor map

**Role:** Maps. **Story:** 2 (after Story 1). **Depends on:** A2 field names; A6 for page chrome. Coordinates come only from Hygraph Map fields. **`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is unset.** Implement the real Maps loader behind an env check. When the key is missing, render a placeholder and `MapFallback`. Do not load the Maps JavaScript API. Do not block Story 2.

#### Objective

Implement an interactive map using published Hygraph Place `location` Map fields. Ready for a key later; usable without one now.

#### Tasks

- Create the `CityMap` client component.
- Read marker and center coordinates from Hygraph `location { latitude longitude }`.
- Use City `location` as the default map center.
- Load the Google Maps JavaScript API lazily for rendering only, and only when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is a non-empty string.
- Use a Map ID and Advanced Markers when `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` is set.
- When the key is unset, show a labeled placeholder (not a live map) plus the list fallback.
- Pass marker data from Hygraph to the map component.
- Display CMS-managed Place information in marker information windows.
- Synchronize marker selection with the place list.
- Implement “Get directions” links.
- Support places with no Google Place ID by using `location` coordinates.
- Provide a non-map list fallback.
- Handle missing keys and API load failures.

A directions URL may use a verified Google Place ID when available, otherwise it should use `location` coordinates.

The MVP must not use Google Places autocomplete, Google Places Details, or Geocoding as a content source.

#### Deliverables

- `components/maps/CityMap.tsx`
- `components/maps/MapFallback.tsx`
- `lib/maps/directions.ts`
- `docs/google-maps-setup.md`
- Tests for directions URL generation
- Map screenshots for evidence only when a real key is present (A9). Without a key, screenshot the placeholder and list.

#### Acceptance Criteria

- When the key is set: published places appear as map markers sourced from Hygraph Map fields; selecting a marker identifies the corresponding Place.
- When the key is unset: placeholder + list are usable; Maps JavaScript API is not requested.
- The list remains usable without JavaScript map functionality.
- Directions work with a Place ID and with coordinates.
- When a key is later added, it stays a restricted browser key, not a server secret (A9).
- Map loading does not block the editorial page.

---

### A6 — Frontend

**Role:** Frontend. **Story:** 2 (after Story 1). **Depends on:** Story 1 published fixtures. **Human gate:** GraphQL Code Generator packages before adding codegen.

#### Objective

Build the visitor-facing application using GraphQL data from Hygraph. Filter every public query by the city slug from the URL.

#### Tasks

Implement:

- Locale-aware routing
- City landing page
- Places listing page
- Category filter
- Neighborhood filter
- Place detail page
- Full map page
- Modular Content renderer
- Weather panel
- Locale switcher
- SEO metadata
- Loading, empty, and error states
- Responsive layouts
- Accessible navigation and controls
- `sitemap.xml` and `robots.txt` (PRD §7)
- Place detail: opening hours when present, `iconKey` icons, lastVerified, safe `http`/`https` URLs only
- GraphQL Code Generator against the live schema after the human approves the packages (`AGENTS.md` stack)

Required routes (PRD §7):

- `/{locale}`
- `/{locale}/places`
- `/{locale}/places/{slug}`
- `/{locale}/map`

Move the current root `app/page.tsx` into `app/[locale]/`.

The frontend must:

- Query Published content by default.
- Keep preview and management tokens server-side.
- Use generated or validated GraphQL types.
- Avoid hardcoded editorial content.
- Gracefully handle unknown Modular Content block types.
- Use the City timezone for date and time formatting.
- Use server rendering for CMS and weather data where possible.
- Load Google Maps only on the client, and only when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set. Otherwise render the map placeholder.

#### Acceptance Criteria

- Every required route renders with real Hygraph content.
- Content changes appear without frontend code changes after revalidation.
- Locale switching works.
- Filters work against published data.
- Weather and map failures are non-blocking.
- The frontend contains no hardcoded place dataset.
- Unknown modular blocks do not crash the page.

#### Deliverables

- `app/[locale]/page.tsx`, `places/`, `places/[slug]/`, `map/`
- `app/sitemap.ts` / `robots.ts` as Next.js App Router allows
- `lib/hygraph/` queries and generated types
- Modular Content renderer under `components/content/`
- Locale switcher that keeps the current path

---

### A7 — Workflow, preview, and webhook

**Role:** Frontend (webhook handler only). **Story:** 2 (after Story 1). **Depends on:** A6 cache tags on pages. **Human gate for live test only:** public `https://` webhook URL (TBD; test last). Approve `@hygraph/utils` if used to verify `gcms-signature`. Do not wait for the HTTPS URL to implement the handler.

#### Objective

Connect Hygraph publishing events to frontend cache invalidation. Ship the handler first. Live Hygraph→app HTTPS test is the last Story 2 step.

#### Tasks

- Implement `POST` `app/api/revalidate/route.ts`.
- Verify Hygraph `gcms-signature` with `HYGRAPH_WEBHOOK_SECRET` using official [webhook signature](https://hygraph.com/docs/api-reference/basics/webhooks) guidance (`@hygraph/utils` after package approval, or the documented HMAC).
- Revalidate allowlisted tags only: `city`, `place`, `category`, `neighborhood`, `map`. Map payload `__typename` to those tags. Reject unknown types. Do not revalidate caller-supplied paths.
- Document Studio webhook fields in `docs/webhook-revalidation.md` (already summarized in `README.md`).
- Cover unauthenticated rejection with a local/unit test. Do not call Hygraph Cloud from `localhost` HTTP.
- After Story 2 UI is done, a human supplies a public HTTPS URL and runs the live publish test last. Do not use `http://localhost` in Studio.
- Optional Draft preview: skip unless a human asks.

#### Deliverables

- `app/api/revalidate/route.ts`
- `docs/webhook-revalidation.md`
- Webhook test payload with secrets removed
- Evidence of successful revalidation — after the live HTTPS test (last)
- Optional preview documentation

#### Acceptance Criteria

- Unauthenticated webhook requests are rejected.
- Arbitrary cache paths cannot be supplied by callers.
- Draft content remains hidden from the public site.
- Valid publish events trigger revalidation — **after** the live HTTPS test. Not required to close A7 implementation.

---

### A8 — QA, accessibility, and security

**Role:** QA. **Story:** 2. **Depends on:** A6–A7 handler. **Human gate:** test runner packages. Read-only CMS access only. No Management token. Live Hygraph webhook e2e is last, after this phase’s other checks, and only if a public HTTPS URL exists.

#### Objective

Verify the project against the PRD and identify defects before release.

#### Test Categories

##### Unit Tests

- Weather response normalization
- Weather code mapping
- Temperature and date formatting
- Locale fallback
- Coordinate validation
- URL validation
- Google Maps directions URL generation
- Modular Content block selection

##### Integration Tests

- Published Hygraph City query
- Related Place, Category, and Neighborhood query
- Localized GraphQL query
- Weather Remote Source on City
- Webhook authentication and revalidation (unit/local; no live Hygraph HTTPS call unless a public URL already exists)
- Draft versus Published behavior

##### End-to-End Tests

- Visitor opens City landing page.
- Visitor changes locale.
- Visitor filters Places.
- Visitor opens a Place detail page.
- Visitor opens directions.
- Visitor opens the map page: with a key, selects a marker; without a key, uses the placeholder and list.
- Visitor views weather.
- Weather outage leaves the page usable.
- Google Maps outage leaves the list usable.
- Draft content is not visible publicly.
- Scheduled content becomes visible after publication.

##### Accessibility Tests

- Keyboard navigation
- Focus management
- Visible focus indicators
- Heading hierarchy
- Form labels
- Color contrast
- Alternative list for map
- Screen-reader weather and filter states

##### Security Tests

- Search the client bundle for management and weather credentials.
- Confirm webhook authentication.
- Test unsafe external URLs.
- Test malformed CMS data.
- Test invalid or extreme coordinates.
- Confirm server-side fetches do not accept arbitrary URLs.

#### Deliverables

- `docs/qa-report.md`
- Automated test results
- Accessibility report
- Security review
- List of defects and fixes
- Final acceptance checklist

---

### A9 — Release and certification evidence

**Role:** Release. **Story:** 2 last human step. **Depends on:** A8. **Human gate:** production deploy, optional Maps key HTTP-referrer restriction, production HTTPS webhook URL. Agents must not accept cloud billing or push production. Live webhook test happens here or immediately before, not during A4–A7.

#### Objective

Prepare the project for demonstration and certification review.

#### Tasks

- Human: deploy the frontend.
- Human: configure production environment variables.
- Human: restrict the Google Maps API key to the deployed domain.
- Human: set the production Hygraph webhook URL to `https://<production-host>/api/revalidate`.
- Confirm the site uses Published content.
- Run production smoke tests (human or agent against the deployed URL).
- Update the README only if production setup differs from local.
- Organize evidence screenshots and test reports.

#### Recommended Evidence

```
text
evidence/
├── 01-schema-overview.png
├── 02-model-relationships.png
├── 03-localization.png
├── 04-modular-content.png
├── 05-remote-source.png
├── 06-scheduled-publishing.png
├── 07-webhook-revalidation.png
├── 08-weather-panel.png
├── 09-google-map.png
├── 10-mobile-layout.png
└── qa-report.md
```

`05-remote-source.png` must show the configured weather Remote Source and a GraphQL query that returns City weather from that field.

## 8. GraphQL Implementation Contract

The frontend data layer should expose functions similar to:

```
typescript
getCity(options: {
slug: string; // from URL `/{locale}/{city}`
locale: string;
stage: "DRAFT" | "PUBLISHED";
}): Promise<City>;

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

The exact GraphQL query syntax must be generated or verified from the live Hygraph schema. Do not assume field names or filter syntax.

## 9. Failure and Fallback Strategy

| Failure                       | Expected behavior                                   |
| ----------------------------- | --------------------------------------------------- |
| Hygraph unavailable           | Show a controlled error state or cached content     |
| Weather unavailable           | Hide weather values and show a clear status message |
| Google Maps unavailable       | Show the place list and directions links            |
| Missing translation           | Use the default locale                              |
| Missing image                 | Use a neutral placeholder                           |
| Missing Google Place ID       | Generate directions using coordinates               |
| Invalid coordinates           | Exclude the marker and report the content problem   |
| Unknown Modular Content block | Log a warning and skip the block                    |

## 10. Definition of Done

The project is complete when:

- All P0 acceptance criteria in `PRD.md` pass.
- The Hygraph schema is documented.
- The weather integration mode is documented.
- Google Maps setup and restrictions are documented.
- The frontend uses GraphQL rather than hardcoded editorial data.
- Draft and Published behavior is verified.
- Scheduled publishing is demonstrated.
- Webhook revalidation is demonstrated.
- Automated tests pass.
- Accessibility and security checks are complete.
- The deployment works with production-like configuration.
- Certification evidence is organized and free of secrets.

# Apendix

## References — Official Resources

### Hygraph

#### Hygraph Documentation

Main documentation hub for Hygraph schemas, content modeling, GraphQL, localization, workflows, webhooks, Remote Sources, and Content Federation.

- Link: [Hygraph Documentation](https://hygraph.com/docs)
- URL: https://hygraph.com/docs

#### Hygraph API Reference

Reference documentation for the Content API, Management API, Asset Management API, authentication, and GraphQL operations.

- Link: [Hygraph API Reference](https://hygraph.com/docs/api-reference)
- URL: https://hygraph.com/docs/api-reference

#### Hygraph Developer Resources

Developer-focused documentation, examples, tooling, integrations, environments, previews, and webhooks.

- Link: [Hygraph Developer Resources](https://hygraph.com/docs/developer-resources)
- URL: https://hygraph.com/docs/developer-resources

#### Hygraph GitHub Organization

Official Hygraph repositories, examples, SDKs, integrations, and developer tooling.

- Link: [Hygraph on GitHub](https://github.com/hygraph)
- URL: https://github.com/hygraph

#### Hygraph Marketplace

Hygraph integrations, templates, plugins, and related ecosystem resources.

- Link: [Hygraph Marketplace](https://hygraph.com/marketplace)
- URL: https://hygraph.com/marketplace

#### Hygraph Blog

Product announcements, technical articles, integration guides, and updates about AI and developer tooling.

- Link: [Hygraph Blog](https://hygraph.com/blog)
- URL: https://hygraph.com/blog

#### Hygraph Documentation Search Topics

Use the search function on the Hygraph documentation site for these topics:

- `MCP Server`
- `AI`
- `Remote Sources`
- `Content Federation`
- `Webhooks`
- `Localization`
- `Content Stages`
- `Scheduled Publishing`
- `Modular Content`
- `Components`
- `Environments`
- `Roles and Permissions`
- `Management API`
- `Content API`

Documentation URL:

## 11. Git commit strategy (initial history)

**Status:** Ready to execute. Snapshot: 2026-09-04. Branch `main`. No commits yet. 134 untracked files. Nothing staged. Diff is empty because Git has no HEAD.

This section is the only allowed way to create the first history. Group by feature/domain. One `git add --` with an explicit path list, then one commit. No file appears in more than one step.

### 11.1 Rules

- Do not run `git add .`, `git add -A`, `git add --all`, or `git add -u`.
- Do not add a directory unless every file under it belongs to that same step. Prefer the explicit paths below.
- Quote paths that contain `[` or `]` so the shell does not glob them.
- Run exactly one `git add --` per step, then exactly one `git commit`. Do not stage a second add into the same commit.
- Do not add a path that already appears in an earlier step.
- Do not add paths that are not listed. Do not add `.env`, `.env.local`, tokens, `hygraph/backups/`, `node_modules/`, or `.next/`.
- Messages are one-line conventional commits, lowercase, under 72 characters (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `test:`, `remove:`).
- After each commit, confirm the index is empty (`git diff --cached` prints nothing) before the next `git add`.
- After the last commit, `git status` must show a clean tracked tree aside from ignored files. `git ls-files` must list 134 paths.

### 11.2 File ownership (each path once)

| Step | Domain | File count |
| --- | --- | ---: |
| 1 | Git and editor defaults | 7 |
| 2 | Env example | 1 |
| 3 | Product docs | 4 |
| 4 | Next.js / pnpm scaffold | 14 |
| 5 | Story 1 discovery and schema contracts | 7 |
| 6 | Hygraph schema as code | 4 |
| 7 | Hygraph backup, reset, remote patch | 11 |
| 8 | Fixtures and seed | 12 |
| 9 | Shared env, locale, routes | 9 |
| 10 | Hygraph Content API client | 12 |
| 11 | Node test harness | 5 |
| 12 | Weather | 9 |
| 13 | Visitor map | 8 |
| 14 | Locale routing and chrome | 12 |
| 15 | City landing and modular content | 5 |
| 16 | Place listing and detail | 8 |
| 17 | City map page | 1 |
| 18 | Webhook revalidation | 5 |
| | **Total** | **134** |

### 11.3 Execute in order

Working directory: repository root. Do not skip steps. Do not reorder.

#### Step 1 — Git and editor defaults

```
text
git add -- \
  .editorconfig \
  .gitignore \
  .nvmrc \
  .prettierignore \
  .prettierrc.json \
  .vscode/extensions.json \
  .vscode/settings.json
git commit -m "chore: add gitignore and editor defaults"
```

#### Step 2 — Env example

```
text
git add -- .env.example
git commit -m "chore: add env example without secrets"
```

#### Step 3 — Product docs

```
text
git add -- AGENTS.md PLAN.md PRD.md README.md
git commit -m "docs: add prd, agents, and plan"
```

#### Step 4 — Next.js / pnpm scaffold

```
text
git add -- \
  app/favicon.ico \
  app/globals.css \
  app/layout.tsx \
  app/not-found.tsx \
  app/page.tsx \
  eslint.config.mjs \
  next.config.ts \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  postcss.config.mjs \
  proxy.ts \
  public/.gitkeep \
  tsconfig.json
git commit -m "chore: scaffold next.js app and pnpm workspace"
```

#### Step 5 — Story 1 discovery and schema contracts

```
text
git add -- \
  docs/.gitkeep \
  docs/capability-matrix.md \
  docs/decisions.md \
  docs/graphql-contract.md \
  docs/relationship-diagram.md \
  docs/schema-manifest.md \
  docs/weather-remote-contract.md
git commit -m "docs: add discovery notes and schema contracts"
```

#### Step 6 — Hygraph schema as code

```
text
git add -- \
  hygraph/schema/.gitkeep \
  hygraph/schema/apply.ts \
  hygraph/schema/constants.ts \
  hygraph/schema/open-meteo-sdl.ts
git commit -m "feat: add hygraph schema as code"
```

#### Step 7 — Hygraph backup, reset, remote patch

```
text
git add -- \
  docs/hygraph-setup.md \
  docs/remote-source-setup.md \
  scripts/hygraph/.gitkeep \
  scripts/hygraph/backup.ts \
  scripts/hygraph/env.ts \
  scripts/hygraph/fail-closed.ts \
  scripts/hygraph/locales.ts \
  scripts/hygraph/management-graphql.ts \
  scripts/hygraph/permissions.ts \
  scripts/hygraph/reset.ts \
  scripts/hygraph/update-weather-remote.ts
git commit -m "feat: add hygraph backup and reset scripts"
```

#### Step 8 — Fixtures and seed

```
text
git add -- \
  docs/content-seed-report.md \
  evidence/.gitkeep \
  hygraph/fixtures/.gitkeep \
  hygraph/fixtures/assets.json \
  hygraph/fixtures/categories.json \
  hygraph/fixtures/cities.json \
  hygraph/fixtures/neighborhoods.json \
  hygraph/fixtures/places.json \
  scripts/hygraph/content-api.ts \
  scripts/hygraph/content-introspect.ts \
  scripts/hygraph/seed-types.ts \
  scripts/hygraph/seed.ts
git commit -m "feat: add hygraph fixtures and seed script"
```

#### Step 9 — Shared env, locale, routes

```
text
git add -- \
  lib/datetime.ts \
  lib/env.ts \
  lib/guards.ts \
  lib/i18n/messages.ts \
  lib/locale.ts \
  lib/routes.ts \
  lib/types/const-object.ts \
  lib/url.ts \
  lib/validation/.gitkeep
git commit -m "feat: add shared env, locale, and route helpers"
```

#### Step 10 — Hygraph Content API client

```
text
git add -- \
  lib/hygraph/.gitkeep \
  lib/hygraph/client.ts \
  lib/hygraph/enumerations.ts \
  lib/hygraph/get-cities.ts \
  lib/hygraph/get-city.ts \
  lib/hygraph/get-filters.ts \
  lib/hygraph/get-place.ts \
  lib/hygraph/get-places.ts \
  lib/hygraph/parse.ts \
  lib/hygraph/queries.ts \
  lib/hygraph/revalidate-tags.ts \
  lib/hygraph/types.ts
git commit -m "feat: add hygraph graphql client and queries"
```

`lib/hygraph/webhook-signature.ts` is step 18 only.

#### Step 11 — Node test harness

```
text
git add -- \
  scripts/test/alias-loader.mjs \
  scripts/test/register-alias.mjs \
  tests/e2e/.gitkeep \
  tests/integration/.gitkeep \
  tests/unit/.gitkeep
git commit -m "chore: add node test harness and test dirs"
```

#### Step 12 — Weather

```
text
git add -- \
  components/weather/.gitkeep \
  components/weather/WeatherPanel.tsx \
  docs/weather-integration.md \
  lib/weather/.gitkeep \
  lib/weather/codes.ts \
  lib/weather/normalize.ts \
  lib/weather/remote-source.ts \
  lib/weather/types.ts \
  scripts/test/weather-normalize.test.ts
git commit -m "feat: add weather normalize and panel"
```

#### Step 13 — Visitor map

```
text
git add -- \
  components/maps/.gitkeep \
  components/maps/CityMap.tsx \
  components/maps/MapFallback.tsx \
  docs/google-maps-setup.md \
  lib/maps/.gitkeep \
  lib/maps/directions.ts \
  lib/maps/public-config.ts \
  scripts/test/directions.test.ts
git commit -m "feat: add visitor map and directions links"
```

#### Step 14 — Locale routing and chrome

```
text
git add -- \
  'app/[locale]/error.tsx' \
  'app/[locale]/layout.tsx' \
  'app/[locale]/loading.tsx' \
  'app/[locale]/not-found.tsx' \
  'app/[locale]/page.tsx' \
  app/robots.ts \
  app/sitemap.ts \
  components/layout/CitySwitcher.tsx \
  components/layout/LocaleSwitcher.tsx \
  components/layout/SiteHeader.tsx \
  scripts/test/locale.test.ts \
  scripts/test/routes.test.ts
git commit -m "feat: add locale routing and site chrome"
```

Do not `git add 'app/[locale]'`. City, places, and map routes are later steps.

#### Step 15 — City landing and modular content

```
text
git add -- \
  'app/[locale]/[city]/layout.tsx' \
  'app/[locale]/[city]/page.tsx' \
  components/content/.gitkeep \
  components/content/PageSections.tsx \
  components/content/RichTextHtml.tsx
git commit -m "feat: add city landing and modular content"
```

#### Step 16 — Place listing and detail

```
text
git add -- \
  'app/[locale]/[city]/places/page.tsx' \
  'app/[locale]/[city]/places/[slug]/page.tsx' \
  components/icons/CategoryIcon.tsx \
  components/icons/ExternalLinkIcon.tsx \
  components/places/.gitkeep \
  components/places/PlaceCard.tsx \
  components/places/PlaceFilters.tsx \
  components/places/PlaceList.tsx
git commit -m "feat: add place listing and detail pages"
```

#### Step 17 — City map page

```
text
git add -- \
  'app/[locale]/[city]/map/page.tsx'
git commit -m "feat: add city map page"
```

#### Step 18 — Webhook revalidation

```
text
git add -- \
  app/api/revalidate/route.ts \
  docs/webhook-payload.example.json \
  docs/webhook-revalidation.md \
  lib/hygraph/webhook-signature.ts \
  scripts/test/webhook-signature.test.ts
git commit -m "feat: add webhook revalidation handler"
```

### 11.4 Verify after step 18

```
text
git status
git log --oneline
git ls-files | wc -l
```

Expect 18 commits, 134 tracked files, and no leftover untracked source files. If any listed path is missing or any path was committed twice, stop. Do not reset or rewrite history without a human request.
