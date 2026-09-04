# CityCompass

Localized city guide. Editorial content and coordinates come from Hygraph. Weather comes from Open-Meteo through a Hygraph Remote Source.

Product requirements: `PRD.md`. Implementation plan: `PLAN.md`.

# Features

CityCompass is a Hygraph certification project. Hygraph holds the schema, fixtures, locales, stages, assets, relations, and Map coordinates. The Next.js app queries the Published Content API. Weather is not stored as CMS content; it is federated onto `City.weather` through a REST Remote Source.

## Hygraph platform features used

- **Schema as Code / Management API** — `pnpm hygraph:backup`, `hygraph:reset`, `hygraph:seed`, and `hygraph:update-weather-remote` apply models, components, locales, Remote Sources, and fixtures from this repository. Studio is not used to create schema or entries.
- **Content models and references** — `City`, `Place`, `Category`, `Neighborhood`. Place belongs to a City, at least one Category, and an optional Neighborhood.
- **Components** — `SEO`, `OpeningHours`, `HeroBlock`, `RichTextBlock`, `FeaturedPlacesBlock`, `WeatherBlock`, `MapBlock`, `CallToActionBlock`.
- **Modular Content** — City `pageSections` is a union of those blocks. Editors compose the landing page without frontend changes.
- **Localization** — `en_US`, `pt_BR`, `zh_CN`. Missing copy falls back to `en_US`. URL prefixes use the same locale ids as Hygraph.
- **Content stages** — `DRAFT` and `PUBLISHED`. The public site queries Published only. Seed includes a draft Place.
- **Scheduled publishing** — seed schedules one future Place publish through the Content API.
- **Map (Location) fields** — City, Place, and Neighborhood store `location { latitude longitude }`. Editors set the point in Studio. No separate decimal coordinate fields.
- **Remote Sources / Content Federation** — Open-Meteo REST Remote Source and a City Remote Field. The app reads weather from Hygraph GraphQL, not from Open-Meteo directly.
- **Assets, Rich Text, Slug, enumerations** — city/place images; localized rich text; native Slug fields; `iconKey`, `priceBand`, featured layout, and opening-hours `day`.
- **GraphQL Content API and Permanent Auth Tokens** — High Performance Content API for public reads. Separate tokens for Published read, Draft preview, and Management scripts.
- **Webhooks** — handler implemented; Studio webhook not registered (see below).

## Webhook (implemented, not connected)

Hygraph webhooks notify the frontend when content is published or unpublished so Next.js can revalidate cache tags. The demo includes `POST /api/revalidate`: it verifies `gcms-signature` with `HYGRAPH_WEBHOOK_SECRET` and maps `__typename` to allowlisted tags (`city`, `place`, `category`, `neighborhood`, `map`). Callers cannot pass arbitrary paths.

The Studio webhook is **not set** in this demo. The route exists to show the platform contract. Hygraph Cloud cannot call `localhost` and requires a public `https://` URL. Leave the webhook paused until that URL exists. See `docs/webhook-revalidation.md`.

## Google Maps (out of scope)

The Google Maps JavaScript API is not integrated. This certification demo does not load Maps JS, Places, or Geocoding. Coordinates stay in Hygraph Map fields. The map route uses a placeholder and the place list. Directions URLs can still be built from those coordinates (or an optional editorial `googlePlaceId`) without embedding Google Maps.

## Post-MVP: more of the Hygraph platform

Not required for this demo. Each item uses a Hygraph capability that the MVP only touches or skips.

- Register the Studio webhook on a public `https://…/api/revalidate` URL (Publish/Unpublish, City, Place, Category, Neighborhood). Optionally create that webhook from Schema as Code.
- Live Preview in Studio (Draft token + Preview widget) and Click-to-Edit, using `HYGRAPH_PREVIEW_TOKEN` that already exists in env.
- Content workflows plus distinct editor and publisher roles (PRD FR-07).
- Environments (`development` / `staging` / `production`) kept in sync with the Management SDK.
- Scheduled Releases to publish related entries together.
- Taxonomies where Category or Neighborhood needs a hierarchy.
- Further Remote Sources (air quality, transit, commerce/PIM) as GraphQL or REST federation, still without custom Next.js adapters.
- Hygraph Asset API transformations instead of shipping full-size images.
- New relational models from PRD §5.2 (Events, Itineraries) composed with Modular Content and references.

## Prerequisites

- Node.js 20.9 or newer. `.nvmrc` pins 22.20.0 (Homebrew `pnpm` 11 needs Node 22.13+)
- `pnpm` 11
- A Hygraph project on Growth or higher, or a 30-day trial, so Remote Sources are available
- A Google Cloud project for the visitor map (Maps JavaScript API only)

```bash
nvm use
pnpm install
cp .env.example .env.local
```

Fill `.env.local` using the sections below. Do not commit `.env.local`.

Recommended editor extensions are listed in `.vscode/extensions.json`.

## Get API keys and endpoints

### Hygraph

1. Open the project in [Hygraph Studio](https://app.hygraph.com/).
2. Copy endpoints from **Project Settings → Access → Endpoints**. See [API access](https://hygraph.com/docs/getting-started/access-and-permissions/api-access).
   - High Performance Content API → `HYGRAPH_CONTENT_API_URL`
   - Management API → `HYGRAPH_MANAGEMENT_API_URL` (regional, for example `https://management-<region>.hygraph.com/graphql`)
3. Create Permanent Auth Tokens under **Project Settings → Access → Permanent Auth Tokens**. A new token has no permissions until you add them. See [Permanent Auth Tokens](https://hygraph.com/docs/api-reference/basics/authorization).

Create three tokens:

| Token env var              | Default stage | Permissions                                                                                                                    |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `HYGRAPH_READ_TOKEN`       | Published     | Content API read only                                                                                                          |
| `HYGRAPH_PREVIEW_TOKEN`    | Draft         | Content API read, including Draft                                                                                              |
| `HYGRAPH_MANAGEMENT_TOKEN` | n/a           | Management API permissions required by `pnpm hygraph:*` scripts. Must include `ENVIRONMENT_READ`. See `docs/hygraph-setup.md`. |

Do not put Hygraph tokens on `NEXT_PUBLIC_` variables. Do not use the management token for public or preview queries.

4. Webhook Studio setup is **TBD until Story 2 is implemented and the live HTTPS test runs last**. Do not block Story 1 or frontend implementation on a public URL. When the URL exists, create a webhook under **Project Settings → Automation → Webhooks**. See [Configure webhooks](https://hygraph.com/docs/developer-guides/webhooks/webhooks-overview) and [Webhooks](https://hygraph.com/docs/api-reference/basics/webhooks). Use:

| Field           | Value                                                                                                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name            | Revalidate CityCompass                                                                                                                                                                         |
| Include payload | On. The app maps `__typename` / `id` to cache tags. Callers must not supply arbitrary paths.                                                                                                   |
| Method          | `POST`. Hygraph sends JSON in the body. The App Router handler will be `app/api/revalidate/route.ts`. Do not use GET.                                                                          |
| URL             | A public `https://` origin plus `/api/revalidate`. Hygraph rejects `http://` and cannot reach `localhost`.                                                                                     |
| Secret key      | A random string. Paste the same value into `HYGRAPH_WEBHOOK_SECRET`. Hygraph sends `gcms-signature`; the app verifies it.                                                                      |
| Headers         | Leave empty. Auth is the secret, not extra headers.                                                                                                                                            |
| Triggers        | Stage `PUBLISHED`. Actions `Publish` and `Unpublish`. Models: editorial types once they exist (City, Place, Category, Neighborhood), or leave empty to match all models. Sources: leave empty. |

Hygraph Cloud cannot call `http://localhost:3000`. Do not put that URL in the webhook form. Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for the Next.js app. For the Hygraph webhook URL, pick one:

1. Pause the webhook until a deployed `https://` origin exists. Day-to-day `pnpm dev` does not need Hygraph to hit the machine.
2. For a live Hygraph → local test, terminate TLS with a tunnel and paste that URL into Hygraph only. The app can stay on HTTP behind the tunnel.

```bash
cloudflared tunnel --url http://localhost:3000
```

Use `https://<subdomain>.trycloudflare.com/api/revalidate`. [ngrok](https://ngrok.com/docs/integrations/webhooks/hygraph-webhooks) is the same pattern (`ngrok http 3000`). Do not write the tunnel URL into `NEXT_PUBLIC_SITE_URL`. Pause or update the webhook when the tunnel URL changes.

The handler is `app/api/revalidate/route.ts`. Pause the Studio webhook until a public `https://` URL exists. Hygraph times out after 3 seconds and cannot call `localhost`. Leave `HYGRAPH_WEBHOOK_SECRET` unused until that live test. See `docs/webhook-revalidation.md`.

### Google Maps

Leave `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` empty for now. The app must render a placeholder and the list fallback; it must not load the Maps JavaScript API until the key is set.

When a key is added later, enable **only** the Maps JavaScript API. Do not enable Places or Geocoding as content sources.

1. Create or select a Google Cloud project and enable the Maps JavaScript API. Official steps: [Set up the Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/get-api-key).
2. Create an API key. Restrict it to HTTP referrers (for local: `http://localhost:3000/*`) and to the Maps JavaScript API. Set quotas. That key is `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
3. Create a JavaScript Map ID on the [Map Management](https://developers.google.com/maps/documentation/javascript/map-ids/get-map-id) page if Advanced Markers are used. That value is `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`.

The browser key is public by nature. Restriction and quota are the controls.

### Open-Meteo

Open-Meteo’s forecast API does not require a key. The Remote Source base URL is `https://api.open-meteo.com/v1/forecast` (`OPEN_METEO_FORECAST_URL` in `hygraph/schema/constants.ts`). The public site queries `City.weather` through Hygraph, not Open-Meteo. See [Open-Meteo forecast API](https://open-meteo.com/en/docs).

## Environment variables

Copy from `.env.example`. Names may change during implementation; public vs server-only separation must not.

### Hygraph (server only)

| Variable                     | Purpose                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `HYGRAPH_CONTENT_API_URL`    | GraphQL Content API endpoint used by the app, seed scripts, and Management SDK `endpoint`     |
| `HYGRAPH_READ_TOKEN`         | Published-stage reads for the public site                                                     |
| `HYGRAPH_PREVIEW_TOKEN`      | Draft-stage reads for preview. Never used on public requests                                  |
| `HYGRAPH_MANAGEMENT_API_URL` | Regional Management API GraphQL URL for Schema as Code and SDK `managementEndpoint`           |
| `HYGRAPH_MANAGEMENT_TOKEN`   | Schema and content mutation scripts only (`pnpm hygraph:*`)                                   |
| `HYGRAPH_WEBHOOK_SECRET`     | Shared secret for authenticating Hygraph webhook calls. Not needed until the live HTTPS test. |

### App config (server)

| Variable            | Purpose                                              |
| ------------------- | ---------------------------------------------------- |
| `DEFAULT_LOCALE`    | Fallback locale. Default `en_US`                     |
| `SUPPORTED_LOCALES` | Comma-separated locales. Default `en_US,pt_BR,zh_CN` |

### Public (browser)

| Variable                          | Purpose                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Restricted Maps JavaScript API key. Empty until a human adds one; use a placeholder map. |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`  | Map ID for Advanced Markers. Optional until a key exists.                                |
| `NEXT_PUBLIC_SITE_URL`            | Public origin of this app (local default `http://localhost:3000`)                        |

## Scripts

| Command                              | Purpose                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                           | Next.js dev server                                                                                         |
| `pnpm build`                         | Production build                                                                                           |
| `pnpm start`                         | Serve the production build                                                                                 |
| `pnpm lint`                          | ESLint with zero warnings                                                                                  |
| `pnpm typecheck`                     | Generate Next.js types, then `tsc --noEmit`                                                                |
| `pnpm format`                        | Prettier write                                                                                             |
| `pnpm format:check`                  | Prettier check                                                                                             |
| `pnpm hygraph:backup`                | Export live schema JSON to `hygraph/backups/` (gitignored). Content export is skipped.                     |
| `pnpm hygraph:reset`                 | Backup, fail closed if the project is not clean, apply `hygraph/schema/`. Requires Node 22.20 (`nvm use`). |
| `pnpm hygraph:update-weather-remote` | Backup, then patch `City.weather` Path and input args on a live schema.                                    |
