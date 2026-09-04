# Remote Source setup — A2

**Role:** Schema scripter  
**Path:** Hygraph REST Remote Source on `City.weather`. No custom Next.js Open-Meteo adapter.

Created by `pnpm hygraph:reset` (greenfield) or patched on a live project by `pnpm hygraph:update-weather-remote`. Do not edit in Studio.

## REST Remote Source

| Item         | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| Display name | Open-Meteo                                                         |
| Kind         | Custom                                                             |
| Prefix       | `OpenMeteo` (starts with A–Z; immutable)                           |
| Base URL     | `https://api.open-meteo.com/v1/forecast` (`OPEN_METEO_FORECAST_URL`) |
| Auth         | None. Open-Meteo does not use a key for this project. |

SDL types match a live Forecast API JSON body for the PRD params (2026-09-03). Source file: `hygraph/schema/open-meteo-sdl.ts`.

Hygraph prepends the prefix to GraphQL type names. Confirm the live names with introspection after reset.

## City Remote Field

| Item            | Value               |
| --------------- | ------------------- |
| Model           | City                |
| apiId           | `weather`           |
| Type            | REST                |
| Method          | GET                 |
| Return SDL type | `OpenMeteoForecast` |

Path (joined to the base URL, query string only). Input arg `query` is SDL type `OpenMeteoQueryInput` (D-A2-4):

```
text
?latitude={{args.query.latitude}}&longitude={{args.query.longitude}}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone={{args.query.timezone}}&temperature_unit=celsius&wind_speed_unit=kmh
```

Nested Map interpolation (`{{doc.location.latitude}}`) does not return Open-Meteo JSON. The app passes City Map coordinates as GraphQL args. See `docs/decisions.md` D-A2-4.

## Querying

Public pages query `weather` on City through the Content API, then normalize in Story 2 (`lib/weather`). Do not call Open-Meteo from Next.js as a substitute.

## External docs

- https://hygraph.com/docs/developer-guides/remote-data/overview
- https://hygraph.com/docs/developer-guides/remote-data/remote-sources
- https://hygraph.com/docs/developer-guides/remote-data/remote-content
- https://open-meteo.com/en/docs
