# Capability matrix — A0

**Role:** Auditor  
**Date:** 2026-09-03  
**Live inspection:** Hygraph MCP `get_project_info`, `list_entity_types` (read-only). No secrets printed. `.env.local` not read.

## Seeded cities (from `PRD.md` §7)

| Slug            | City                      | Timezone              |
| --------------- | ------------------------- | --------------------- |
| `florianopolis` | Florianópolis, SC, Brazil | `America/Sao_Paulo`   |
| `araucaria`     | Araucária, PR, Brazil     | `America/Sao_Paulo`   |
| `san-francisco` | San Francisco, CA, USA    | `America/Los_Angeles` |

Locales required by PRD: `en-US` (default), `pt-BR`, `zh-CN`.

Weather path: Hygraph REST Remote Source on `City.weather`. No custom server weather adapter.

## Live project

| Item                       | Observed                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Models                     | None (greenfield)                                                                                                                              |
| Components / enumerations  | None                                                                                                                                           |
| Entity types               | System only: `Asset`, `ScheduledOperation`, `ScheduledRelease`, `User`                                                                         |
| Locales                    | `en` (English, default) only. Not `en-US` / `pt-BR` / `zh-CN`                                                                                  |
| Stages                     | `DRAFT`, `PUBLISHED`                                                                                                                           |
| Commercial plan name       | Not returned by MCP                                                                                                                            |
| Management ops of interest | `createLocale`, `createRESTRemoteSource`, `createRemoteField`, `createComponent`, `createWebhook`, `createStage` present on the operation list |

## Feature check

| Capability           | PRD need                              | Official availability                                                                                                                                                                                  | Live project                                                  | Verdict                                                                                     |
| -------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Localization         | 3 locales                             | Hobby: 2. Growth: 3. Trial: 15. [Billing limits](https://hygraph.com/docs/getting-started/update-billing)                                                                                              | Only `en`                                                     | Human must add `en-US`, `pt-BR`, `zh-CN` before A2. Growth or trial required for 3 locales. |
| Components           | ~8 reusable components                | Hobby 10 / Growth 20                                                                                                                                                                                   | None                                                          | Count OK on Hobby; other gates fail Hobby.                                                  |
| Modular Content      | City `pageSections` union of 6 blocks | Component union fields exist in Management ops                                                                                                                                                         | None                                                          | Schema work is A2.                                                                          |
| Content stages       | Draft + Published                     | Hobby/Growth: 2 stages                                                                                                                                                                                 | `DRAFT`, `PUBLISHED`                                          | Met.                                                                                        |
| Scheduled publishing | At least one scheduled change         | [Enterprise only](https://hygraph.com/docs/developer-guides/content/scheduled-publishing)                                                                                                              | GraphQL types `ScheduledOperation` / `ScheduledRelease` exist | **Conflict with PRD.** See `docs/decisions.md`. Blocks A3 evidence, not A1 docs.            |
| Webhooks             | Revalidate on publish                 | Hobby 5 / Growth 10                                                                                                                                                                                    | Not configured (Story 2 live test TBD)                        | Handler is Story 2. Studio HTTPS URL is last.                                               |
| Remote Sources       | 1 REST Open-Meteo source              | Hobby: 0. Growth: 1. Trial: 6. [Tutorial](https://hygraph.com/docs/getting-started/tutorial/tutorial-remote-sources-overview)                                                                          | Plan unknown via MCP                                          | **Human gate:** Growth or 30-day trial before A2 Remote Source.                             |
| Management API       | Schema as Code                        | SDK `endpoint` = Content API; `managementEndpoint` = Management API URL                                                                                                                                | Ops list present                                              | Scripts only in A2.                                                                         |
| Map / Location       | City, Place, Neighborhood `location`  | GraphQL `Location` with `latitude` / `longitude`. [Map field](https://hygraph.com/docs/editor-guides/content/field-types#map) [Field types](https://hygraph.com/docs/api-reference/schema/field-types) | No models yet                                                 | Do not add separate decimal coordinate fields.                                              |
| Google Maps JS       | Visitor render only                   | Key required to load Maps JS. [Get API key](https://developers.google.com/maps/documentation/javascript/get-api-key)                                                                                   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` unset by plan               | Placeholder + list in Story 2. Not a Story 1 blocker.                                       |

## Remote Source interpolation

REST Remote Field `Path` supports handlebars `{{doc.<field>}}` and `{{args.<name>}}`. Official example uses a scalar (`{{doc.userId}}`). Source: [Remote content](https://hygraph.com/docs/developer-guides/remote-data/remote-content).

| City input           | Intended Path fragment     | Confidence | Notes                                                                        |
| -------------------- | -------------------------- | ---------- | ---------------------------------------------------------------------------- |
| `timezone`           | `{{args.query.timezone}}`  | H          | Scalar passed as Remote Field arg (D-A2-4).                                  |
| `location.latitude`  | `{{args.query.latitude}}`  | H          | Nested Map Path failed. App passes City Map coords as `weather(query: ...)`. |
| `location.longitude` | `{{args.query.longitude}}` | H          | Same.                                                                        |

Open-Meteo (no key for this project): `latitude`, `longitude`, `timezone` (required with `daily`), `current`, `daily`, `forecast_days`. Source: [Open-Meteo forecast API](https://open-meteo.com/en/docs). PRD example also sets `temperature_unit=celsius` and `wind_speed_unit=kmh`.

Schema as Code **does** list Remote Sources and Remote fields as supported: [Schema as Code](https://hygraph.com/docs/api-reference/schema/schema-as-code). Import is additive.

## `.env.example` vs `AGENTS.md` §7

Names match. Weather has no env switch; Open-Meteo base URL is hardcoded.

Maps key empty is valid. Webhook secret unused until live HTTPS test.

## PLAN §3 human prerequisites

| Prerequisite                                                     | Status                                                                     |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Hygraph project selected                                         | Live MCP connected; project is empty                                       |
| Three cities seeded; visitor city is `/{locale}/{city}` (D-A2-9) | Recorded from PRD. Seed is A3                                              |
| Locales `en-US`, `pt-BR`, `zh-CN`                                | **Unmet** on live project                                                  |
| Remote Sources (Growth or trial)                                 | **Unverified** (plan not in MCP). Required before A2 weather Remote Source |
| Seed image sources                                               | Policy recorded. Assets in A3                                              |
| Google Maps credentials                                          | Not required for Story 1 or Story 2 until a human provides a key           |

## Human gates before A2

1. Confirm Billing is Growth or an active 30-day trial (Remote Sources + 3 locales).
2. Enable locales `en-US`, `pt-BR`, `zh-CN` on the project (Studio or later via Schema as Code `createLocale`; PLAN prefers human enable before A2).
3. Approve `docs/schema-manifest.md` (A1).
4. Approve `@hygraph/management-sdk` before install.

## Verification not performed

- Billing UI plan name
- Creating locales
- Live Remote Field Path with nested `location.*`
- Any schema or content mutation
- Reading `.env.local`

## External docs checked

- https://hygraph.com/docs/editor-guides/content/field-types#map
- https://hygraph.com/docs/api-reference/schema/field-types
- https://hygraph.com/docs/developer-guides/remote-data/overview
- https://hygraph.com/docs/developer-guides/remote-data/remote-content
- https://hygraph.com/docs/developer-guides/remote-data/remote-sources
- https://hygraph.com/docs/getting-started/tutorial/tutorial-remote-sources-overview
- https://hygraph.com/docs/getting-started/update-billing
- https://hygraph.com/docs/api-reference/schema/schema-as-code
- https://hygraph.com/docs/api-reference/management-sdk/management-sdk-quickstart
- https://hygraph.com/docs/developer-guides/content/scheduled-publishing
- https://open-meteo.com/en/docs
- https://developers.google.com/maps/documentation/javascript/get-api-key
