# Hygraph setup — A2

**Role:** Schema scripter  
**Apply path:** `pnpm hygraph:backup`, `pnpm hygraph:reset` (greenfield), and `pnpm hygraph:update-weather-remote` (live `City.weather` Path). Do not edit schema in Studio or through Hygraph MCP writes.

## Prerequisites

- Node 24.20.0 (`.nvmrc`).
- `.env.local` with `HYGRAPH_CONTENT_API_URL`, `HYGRAPH_MANAGEMENT_API_URL`, `HYGRAPH_MANAGEMENT_TOKEN`.
- Growth or a 30-day trial (three locales + one REST Remote Source).
- Approved `@hygraph/management-sdk` (installed).
- `HYGRAPH_MANAGEMENT_TOKEN` Management API permissions (a new PAT starts with none). Minimum for A2:

| Permission                                                           | Action                                                                                     |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Read existing environments                                           | `ENVIRONMENT_READ` — required for Schema as Code `schemaDefinition` and the Management SDK |
| Read/create models, fields, components, enumerations, remote sources | `MODEL_*`, `FIELD_*`, `COMPONENT_*`, `ENUMERATION_*`, `REMOTE_SOURCE_*` (read + create)    |
| Read/create/update/delete locales                                    | `LOCALE_READ`, `LOCALE_CREATE`, `LOCALE_UPDATE`, `LOCALE_DELETE`                           |

Official list: https://hygraph.com/docs/getting-started/access-and-permissions/management-api-permissions  
SDK note: https://hygraph.com/blog/management-sdk

Scripts load env with Node `--env-file=.env.local`. There is no `dotenv` package. Node may warn that the repo `package.json` has no `"type": "module"`; the scripts still run as ESM via `--experimental-detect-module`.

## Commands

```bash
nvm use
pnpm hygraph:backup
pnpm hygraph:reset
```

`hygraph:reset` runs a backup first, then a fail-closed live-schema check, then locales, then `client.run(true)` for `hygraph/schema/`.

To patch `City.weather` on an environment that already has models (`hygraph:reset` will exit):

```bash
pnpm hygraph:update-weather-remote
```

Empty Published content is expected until A3. That is not a reset failure.

## Fail closed

Reset inspects Management API `contentModel.models(includeSystemModels: true)`.

| Live state                                                   | Result                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Only system models (`isSystem: true`) or no editorial models | Apply                                                               |
| City, Place, Category, or Neighborhood already present       | Exit. Schema is already applied.                                    |
| Any other non-system model                                   | Exit. Official Schema as Code import is additive and will conflict. |

Official import does not wipe an existing schema: https://hygraph.com/docs/api-reference/schema/schema-as-code

## Locales (D-A1-1)

Growth max is 3 locales. The project cannot keep default `en` plus `en_US`, `pt_BR`, and `zh_CN`.

Reset tries `updateLocale` rename `en` → `en_US`. If that fails, it creates `en_US`, sets `isDefault`, then `deleteLocale` `en`. Then it creates `pt_BR` and `zh_CN`. URL prefixes use the same ids (D-A2-6).

Do not click locales in Studio.

## Schema in the repo

`hygraph/schema/apply.ts` schedules Management SDK operations. Models: City, Place, Category, Neighborhood. Enums: IconKey, PriceBand, FeaturedPlacesLayout, OpeningHoursDay. Components: SEO, OpeningHours, and the six `pageSections` blocks.

- Title fields: `name` on each model.
- Slugs: `STRING` + unique + `formRenderer` / `tableRenderer` `GCMS_SLUG` (verified Management SDK field example).
- Map fields: simple field type `LOCATION`, apiId `location`.
- Assets: `createRelationalField` type `ASSET`. `isRequired: true` is only used on ASSET fields.
- Relations: `isRequired` is not set (SDK allows required only for ASSET). PRD-required relations are seed-enforced. See `docs/decisions.md`.
- URLs: `STRING` with `validations.String.matches` `^https?://.+`.
- City Modular Content: `pageSections` component union, `isList` true, `isRequired` true.

Reverse relation apiIds created by the script:

| Forward                    | Reverse                                         |
| -------------------------- | ----------------------------------------------- |
| Place.city                 | City.places                                     |
| Place.categories           | Category.places                                 |
| Place.neighborhood         | Neighborhood.places                             |
| Neighborhood.city          | City.neighborhoods                              |
| FeaturedPlacesBlock.places | Place.featuredInBlocks (hidden, unidirectional) |

## Backup

`Environment.schemaDefinition` on the Management API (from `@hygraph/management-sdk` 1.6.1 types). Written to `hygraph/backups/` (gitignored). Keys that look like secrets are replaced with `[redacted]`.

Content export is skipped: the Management `Mutation` type only has `submitBatchChanges`.

## Evidence not captured

Studio screenshots listed in PLAN A2 (`evidence/schema-overview.png`, `localization.png`, `modular-content.png`, `remote-source.png`) were not taken. Parent verifies with read-only MCP after reset.

## External docs

- https://hygraph.com/docs/api-reference/management-sdk/management-sdk-quickstart
- https://hygraph.com/docs/api-reference/management-sdk/management-sdk-example
- https://hygraph.com/docs/api-reference/management-sdk/management-sdk-methods-reference
- https://hygraph.com/docs/api-reference/schema/schema-as-code
- https://hygraph.com/classic-docs/api-reference/management-sdk/management-sdk-field-examples
- https://hygraph.com/docs/developer-guides/schema/slug-field
