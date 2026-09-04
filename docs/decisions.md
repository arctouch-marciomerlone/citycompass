# Decisions

Record conflicts and choices that agents must not invent. Authority: `AGENTS.md` > `PRD.md` > `PLAN.md`.

## D-A0-1 — Scheduled publishing vs plan (conflict)

**Status:** Closed 2026-09-03. A3 Content API `schedulePublishPlace` succeeded on this project.

**Conflict (docs vs live):** Official Hygraph documentation still states scheduled publishing is **Enterprise only**: https://hygraph.com/docs/developer-guides/content/scheduled-publishing

**Live evidence:** `pnpm hygraph:seed` called `schedulePublishPlace` for draft place `floripa-cafe-agendado` with `releaseAt` `2026-09-07T21:12:02.263Z`. Operation id `cmtm0t9pmvbos07n4c8tpw61h`. A second seed found `scheduledIn` already present and did not create another operation. See `docs/content-seed-report.md`.

**Must not:** Invent a fake schedule (draft-only, cron in Next.js, or a custom adapter).

Studio screenshot `evidence/scheduled-publishing.png` was not created. Studio UI for schedule remains UNVERIFIED.

## D-A0-2 — Nested Map fields in Remote Field Path

**Status:** Live query failed. See D-A2-4. Confidence: H that nested Map Path does not currently return Open-Meteo JSON.

REST Remote Fields interpolate document fields with `{{doc.<field>}}`. Official examples use scalars (`{{doc.userId}}`), not `Location` subfields: https://hygraph.com/docs/developer-guides/remote-data/remote-content

A1/A2 will specify Path using `{{doc.location.latitude}}`, `{{doc.location.longitude}}`, and `{{doc.timezone}}`. If A2 cannot prove nested Map access, stop and record the gap. Do not add a Next.js Open-Meteo adapter (`PRD.md` FR-05).

## D-A0-3 — Live locales

**Status:** Gate before A2.

MCP `get_project_info` reports only locale `en`. PRD requires `en-US`, `pt-BR`, `zh-CN`. PLAN: human enables those locales before A2; A2 fails if they are missing.

Whether Hygraph accepts `en-US` as `apiId` (vs `en`) must be proven when creating locales. Do not invent `en` / `pt` / `zh` aliases in the app.

## D-A0-4 — Remote Sources on this project

**Status:** Gate before A2 weather Remote Source.

MCP does not return the commercial plan. Hobby has 0 Remote Sources. Human must confirm Growth or an active 30-day trial before A2 creates the Open-Meteo source.

## D-A1-1 — Locales owned by schema scripts

**Status:** Closed 2026-09-03. Human: approve A1 manifest + `@hygraph/management-sdk`; Growth/trial ready; **scripts create locales**.

PLAN §7.0 said a human enables `en-US`, `pt-BR`, `zh-CN` in Studio before A2. This project owns locale creation in `pnpm hygraph:reset` / Schema as Code instead. Do not click locales in Studio.

Live project currently has default locale `en`. A2 must use verified Management SDK / Schema as Code locale operations only. If `en-US` cannot be created or cannot become default without an unverified API, stop and record the gap. Do not invent `en` / `pt` / `zh` app aliases.

## D-A1-2 — A1 approved; A2 package approved

**Status:** Closed 2026-09-03.

Human approved `docs/schema-manifest.md` and installing `@hygraph/management-sdk`. A2 may add that package. Do not add other packages without a new approval.

## D-A2-1 — Relation `isRequired` is seed-enforced

**Status:** Closed 2026-09-03. Confirmed against `@hygraph/management-sdk` 1.6.1 `Client.createRelationalField` and the official example.

`isRequired: true` is only supported for `RelationalFieldType.ASSET`. PRD-required relations (`Place.city`, `Place.categories` min 1, `Neighborhood.city`) are not set `isRequired` on the schema. A3 seed and frontend must enforce them.

## D-A2-3 — City Remote Field apiId is `weather`

**Status:** Closed 2026-09-03.

A2 uses GraphQL name `weather` on City (not `openMeteo`). Path and SDL live in `hygraph/schema/`.

## D-A2-5 — Management PAT needs `ENVIRONMENT_READ`

**Status:** Closed 2026-09-03. Token re-test succeeded after the human enabled **Read existing environments**.

`pnpm hygraph:backup` wrote `hygraph/backups/schema-2026-09-03T20-52-42.116Z.json`. Content export skipped (Management API has no content-export field).

## D-A2-6 — Locale ids are `en_US`, `pt_BR`, `zh_CN` (Hygraph and URLs)

**Status:** Closed 2026-09-03. Human approved after live validation rejected hyphenated `apiId`s.

Live Management API: `en-US` is invalid (`ApiId` must start with a letter and use only alphanumeric characters or underscores).

Use the same ids everywhere: Hygraph locale `apiId`, URL prefixes, `DEFAULT_LOCALE`, `SUPPORTED_LOCALES`. No hyphen↔underscore conversion. Do not use `en` / `pt` / `zh`.

This supersedes PRD hyphenated locale codes (`en-US`, …) for this project. Same languages; encoding required by Hygraph.

## D-A2-2 — Locale rename path

**Status:** Closed 2026-09-03. `en` renamed to `en_US` (default), then `pt_BR` and `zh_CN` created.

## D-A2-7 — Asset reverse displayName uniqueness

**Status:** Closed 2026-09-03. Hidden Asset reverse fields must not share `displayName`. SEO `image` and HeroBlock `image` both used `"Image reverse"` and failed apply. Reverse `displayName` now matches unique `reverseApiId` (`seoImage`, `heroBlockImage`, `cityHeroImage`, `placeImages`).

## D-A2-4 — Nested Map Remote Field Path

**Status:** Closed 2026-09-04. Nested `{{doc.location.latitude}}` does not interpolate. `City.weather` now uses Remote Field input args.

Path in `hygraph/schema/constants.ts` is `{{args.query.latitude}}` / `{{args.query.longitude}}` / `{{args.query.timezone}}`. The app reads City Map `location` and `timezone` from the Content API and passes them as `weather(query: { latitude, longitude, timezone })`. That is still Hygraph-remote (`PRD.md` FR-05). No Next.js Open-Meteo adapter.

Live Published query on 2026-09-04 for `florianopolis` (`-27.5954`, `-48.548`, `America/Sao_Paulo`) returned Open-Meteo `current.temperature_2m` and a three-day `daily` array.

`pnpm hygraph:reset` fail-closes on existing models, so the live field was patched with `pnpm hygraph:update-weather-remote`. Greenfield reset uses the same Path and `OpenMeteoQueryInput` SDL.

## D-A2-8 — Additive weather Remote Field patch script

**Status:** Closed 2026-09-04.

`hygraph:reset` cannot change a live Remote Field Path because City already exists. `pnpm hygraph:update-weather-remote` is an allowed schema mutation script (backup first, Management SDK only). Studio and Hygraph MCP writes remain forbidden.

## D-A2-9 — Visitor city in the URL

**Status:** Closed 2026-09-04.

`CITY_SLUG` is removed. The public site shows one city at a time from the path `/{locale}/{city}`. Published cities come from Hygraph (`cities`, `orderBy: createdAt_ASC`). `/{locale}` redirects to the first Published city. Header city links go to that city’s home. Locale switcher keeps the city segment.

Do not restore `CITY_SLUG` or a cookie/query city. Do not hardcode city slugs in the app.

## D-A2-10 — Weather env is Hygraph-remote only

**Status:** Closed 2026-09-04.

`WEATHER_MODE`, `WEATHER_API_KEY`, and `WEATHER_API_BASE_URL` are removed. The app only queries `City.weather` through the Content API. The Open-Meteo Remote Source base URL is hardcoded as `https://api.open-meteo.com/v1/forecast` in `hygraph/schema/constants.ts`. Open-Meteo does not use a key.

## D-A0-5 — Maps key and webhook URL

**Status:** Closed for Story 1 (already in PLAN).

`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` stays empty. Story 2 uses a placeholder. Public HTTPS webhook URL is TBD; live test last. Not Story 1 blockers.
