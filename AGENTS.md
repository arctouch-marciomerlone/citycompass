# AGENTS.md — CityCompass

Authority for agent behavior on this repository. Implementation steps live in `PLAN.md`. Product requirements live in `PRD.md`.

## 1. Authority

Follow in this order. Do not contradict a higher item without a recorded decision in `docs/decisions.md`.

1. This file
2. `PRD.md`
3. `PLAN.md`
4. `docs/schema-manifest.md` and `hygraph/schema/` once they exist
5. Official Hygraph, Next.js, and Open-Meteo documentation

If documents conflict, stop and record the conflict. Do not guess.

## 2. Stack

| Layer | Choice |
| --- | --- |
| Package manager | `pnpm` only. Do not add npm or Yarn lockfiles. |
| App | Next.js App Router, TypeScript |
| CMS | Hygraph. Schema and mock content are code in this repo. |
| Weather | Open-Meteo through a Hygraph REST Remote Source on `City` |
| Map | Google Maps JavaScript API for visitor rendering only. Coordinates come from Hygraph Map (`Location`) fields. |
| CMS access at runtime | Hygraph Content API / GraphQL |
| CMS mutation | `pnpm hygraph:backup`, `pnpm hygraph:reset`, `pnpm hygraph:seed`, `pnpm hygraph:update-weather-remote` only |
| CMS inspection | Read-only Hygraph MCP or GraphQL introspection |
| Types | GraphQL Code Generator against the live Hygraph schema |

Do not introduce another CMS client, weather adapter, or map SDK unless `PRD.md` is updated first.

## 3. Hard stops

Stop and hand off when any of these is true:

- A Hygraph schema or content change would be made outside the `pnpm` scripts
- A Hygraph MCP write tool would be required
- Remote Sources are missing on the project plan
- An API, field, or Management SDK method cannot be verified against official docs or the live schema
- A secret would be printed, committed, or prefixed with `NEXT_PUBLIC_`
- The task needs a business rule that is not in `PRD.md`
- The same approach has failed twice without new evidence

Do not start, stop, or restart the user’s dev server, Storybook, or other already-running processes.

Do not run `git add`, `git commit`, `git push`, or other history-changing Git commands unless the user asks in the current message.

## 4. Hygraph as code

The repository is the source of schema and demonstration content. Hygraph is the runtime store.

| Command | Allowed use |
| --- | --- |
| `pnpm hygraph:backup` | Export schema (official Schema as Code). Export content when the API allows. |
| `pnpm hygraph:reset` | Backup first, then apply repo schema. Fail closed if the environment is not clean. Official import is additive and does not wipe. |
| `pnpm hygraph:seed` | Idempotent mock fixtures. Stable slugs. |
| `pnpm hygraph:update-weather-remote` | Backup first, then patch `City.weather` Path and input args. Use when reset fail-closes because models already exist. |

Forbidden:

- Creating or changing schema or entries in Hygraph Studio
- Creating or changing schema or entries through Hygraph MCP
- Passing `HYGRAPH_MANAGEMENT_TOKEN` to MCP for writes
- Treating MCP as a runtime dependency of the public site

`pnpm hygraph:*` scripts use `HYGRAPH_MANAGEMENT_TOKEN` with `HYGRAPH_MANAGEMENT_API_URL` for Schema as Code and other Management API GraphQL. The Management SDK `endpoint` option is `HYGRAPH_CONTENT_API_URL`. Pass `HYGRAPH_MANAGEMENT_API_URL` as `managementEndpoint`. Do not derive the regional Management URL from memory.

After every script run, verify with read-only MCP (`get_project_info`, `list_entity_types`, `list_entities`) or GraphQL. Do not treat a script as successful without that check.

## 5. Hygraph MCP — read-only

Allowed: `get_project_info`, `list_entity_types`, `get_entity_schema`, `list_entities`, `get_entities_by_id`, `search_content`, `discover_entities`, `list_agents`, `get_ai_guidelines`, `get_management_operation_schema`, read-only `execute_graphql` queries.

Forbidden:

- `create_entry`
- `update_entry`
- `publish_entry`
- `submit_batch_migration`
- `execute_graphql` mutations, including `dry_run` mutations used as a substitute for scripts

If a write tool is the only way to finish a task, stop. Change `hygraph/schema/` or `hygraph/fixtures/` and a `pnpm` script instead.

## 6. Secrets and Git

Never commit or paste:

- `.env`, `.env.local`, tokens, API keys, webhook secrets
- Management or preview tokens
- Weather keys
- Google Maps unrestricted keys
- Customer or personal data

Rules:

- `HYGRAPH_MANAGEMENT_TOKEN`, `HYGRAPH_MANAGEMENT_API_URL`, and `HYGRAPH_PREVIEW_TOKEN` are server/script only
- `HYGRAPH_READ_TOKEN` and `HYGRAPH_CONTENT_API_URL` are server-only for public queries
- No Hygraph or weather secret may use a `NEXT_PUBLIC_` prefix
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is a restricted browser key when set, not a server secret. Empty is valid until A9.
- Do not accept cloud billing agreements
- Do not put tokens in `.cursor/mcp.json`

If asked to commit, use a single-line conventional commit, lowercase, under 72 characters (`feat:`, `fix:`, `refactor:`, `chore:`, `remove:`). Do not amend pushed commits. Do not skip hooks.

## 7. Environment variables

Canonical names live in `.env.example`. How to obtain values lives in `README.md`. Do not invent names. Do not put Hygraph or weather values on `NEXT_PUBLIC_` variables.

| Variable | Audience | Agent rules |
| --- | --- | --- |
| `HYGRAPH_CONTENT_API_URL` | Server | High Performance Content API from **Project Settings → Access → Endpoints**. Public queries, seed scripts, and Management SDK `endpoint`. |
| `HYGRAPH_READ_TOKEN` | Server | Permanent Auth Token, Published-stage Content API read. Public site only. |
| `HYGRAPH_PREVIEW_TOKEN` | Server | Permanent Auth Token with Draft read. Never use for public requests. |
| `HYGRAPH_MANAGEMENT_API_URL` | Server / `pnpm hygraph:*` | Regional Management API GraphQL URL from **Project Settings → Access → Endpoints** (example: `https://management-<region>.hygraph.com/graphql`). Schema as Code and SDK `managementEndpoint`. Not the Content API URL. Not used by the public site. |
| `HYGRAPH_MANAGEMENT_TOKEN` | Server / `pnpm hygraph:*` | Permanent Auth Token with Management API permissions. Scripts only. Never pass to Hygraph MCP for writes. |
| `HYGRAPH_WEBHOOK_SECRET` | Server | Shared secret for authenticating Hygraph webhook calls. The webhook URL in Studio must be public `https://` when live-tested. Do not use `http://localhost`. Live HTTPS test is last in Story 2 and is TBD until then. Implement `POST /api/revalidate` without waiting for that URL. |
| `DEFAULT_LOCALE` | Server | Fallback locale. Default `en_US`. |
| `SUPPORTED_LOCALES` | Server | Comma-separated. Default `en_US,pt_BR,zh_CN`. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Browser | Restricted Maps JavaScript API key. May be empty. Frontend must use a placeholder and list fallback; do not load Maps JS until the key is set. |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Browser | Map ID for Advanced Markers. Optional until a key exists. |
| `NEXT_PUBLIC_SITE_URL` | Browser | Public origin of this app. Local default `http://localhost:3000`. Not the Hygraph webhook URL. |

## 8. Content and data rules

- Public pages query the Published stage only
- Do not hardcode places, categories, neighborhoods, or editorial copy
- Do not store live weather as Hygraph content
- Do not copy Google reviews, photos, opening hours, or place descriptions into Hygraph
- Do not call Google Places, Geocoding, or any Google Maps API as a content source
- Do not geocode visitor input
- Coordinates come from Hygraph `location { latitude longitude }`
- Seed images: Unsplash, then Pexels, then Wikimedia Commons. Record license and attribution. No Google photos
- Locales: `en_US` (default), `pt_BR`, `zh_CN`. Fall back to `en_US`
- Active city: URL `/{locale}/{city}`. Published cities come from Hygraph. No `CITY_SLUG`
- Weather: Hygraph Remote Source only. No custom server weather adapter
- Unknown Modular Content blocks: log and skip. Do not crash

## 9. Frontend rules

- TypeScript. Prefer generated GraphQL types and module-provided types over new aliases
- Closed sets are const objects via `defineConstObject`. Derive the union with `ValueOf`. Do not use TypeScript `enum`
- Do not type-assert (`as Type`) except `as const`, which the linter allows. Narrow with type guards. Use `unknown` at untrusted boundaries. Do not use `any`
- Use `satisfies` when checking a value against a type without widening
- Inspect the live schema before writing a query. Do not invent field names or filters
- Keep CMS, weather, and webhook work on the server
- Load Google Maps only on the client, and lazily
- Weather and map failures must not block editorial content
- Provide a list alternative to the map
- Format dates and times with the City timezone
- Do not accept arbitrary URLs or coordinates from query parameters for server fetches

## 10. Scope

Touch only files required by the current task. Do not refactor, restyle, or add dependencies “while here.”

Do not add npm packages, change the lockfile, or migrate SDKs without approval.

Match existing project patterns. Prefer the smallest change that satisfies `PRD.md`.

## 11. Roles

Use the smallest role that can finish the task. Do not combine schema writes, seeding, and frontend work in one unscoped pass.

| Role | Does | CMS access |
| --- | --- | --- |
| Auditor | Compare live Hygraph to `PRD.md` and `docs/schema-manifest.md` | Read-only MCP / GraphQL |
| Schema planner | Write `docs/schema-manifest.md` and GraphQL contracts | Read-only |
| Schema scripter | Write `hygraph/schema/` and `pnpm hygraph:backup` / `reset` | Scripts only; verify read-only |
| Seeder | Write `hygraph/fixtures/` and `pnpm hygraph:seed` | Scripts only; verify read-only |
| Frontend | App Router pages, components, typed queries | Content API read |
| Weather | Remote Source contract and `lib/weather` normalization | No CMS mutation |
| Maps | Client map from Hygraph coordinates | No CMS mutation |
| QA | Tests, a11y, secret scan | Read-only |
| Release | Deploy, evidence, README | Human approval for production |

Auditor and QA must never receive a write-capable Management API token.

## 12. Quality gates

Before reporting a task complete, run what exists and report what was not run:

1. Format
2. Lint
3. Typecheck
4. Unit tests for changed behavior
5. GraphQL validate / codegen when queries or schema changed
6. Secret scan of the diff
7. For UI changes: exercise the flow; a screenshot alone is not verification

Do not claim checks passed unless they were run. Do not skip, weaken, or delete tests to get a green result.

Do not invent Hygraph, Next.js, or Google Maps APIs. Verify against official docs and the installed package version.

## 13. Handoff

Every completed or stopped task reports:

- Task and role
- Files changed
- Commands run and results
- MCP or GraphQL verification performed
- Verification not performed
- External docs checked (full URLs)
- Assumptions (`ASSUMPTION`, confidence H/M/L, risk if wrong)
- Remaining risks
- Next command

If stopped, also report what is known, what is uncertain, and whether a narrower path or a different model is recommended.
