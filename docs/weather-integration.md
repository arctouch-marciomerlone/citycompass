# Weather integration — Story 2 / A4

**Role:** Weather  
**Path:** Hygraph REST Remote Source on `City.weather` only. The Next.js app does not call Open-Meteo.

## Query path

1. Public pages load City editorial content without the Remote Field.
2. A second Content API query selects `city { weather(query: { latitude, longitude, timezone }) { ... } }` with cache tags `city` and a 600 second `revalidate`. Coordinates come from the City Map field already loaded for the page.
3. `lib/weather/normalize.ts` maps the Open-Meteo-shaped GraphQL object to `WeatherViewModel`.
4. `WeatherBlock` renders that model when present. If the City has no `WeatherBlock`, the landing page still renders a default weather panel.

## Live Remote Field (D-A2-4)

Nested `{{doc.location.latitude}}` returned empty JSON (`unexpected end of JSON input`). The Path now uses `{{args.query.latitude}}` (custom input `OpenMeteoQueryInput`). A Published Florianópolis query on 2026-09-04 returned `current.temperature_2m` and a three-day forecast.

The app still does **not** call Open-Meteo (`PRD.md` FR-05). Patch a live field with `pnpm hygraph:update-weather-remote`; greenfield uses `pnpm hygraph:reset`.

## Cache

Weather is cached on the Hygraph `fetch` (~10 minutes). Do not cache by calling Open-Meteo from Next.js.

## Attribution

Open-Meteo: https://open-meteo.com/

## Tests

`pnpm test` covers WMO mapping and normalize success/failure.
