# Weather remote contract — A1

**Role:** Schema planner  
**Authority:** `AGENTS.md` > `PRD.md` FR-05 > `PLAN.md` A1/A4 > `docs/decisions.md`  
**Path:** Hygraph REST Remote Source on `City.weather`. No custom Next.js Open-Meteo adapter.

Weather is not Hygraph content. The CMS stores City `location` (Map) and `timezone`, plus optional `WeatherBlock` placement. Open-Meteo owns current and forecast values.

## Provider

| Item             | Value                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Provider         | Open-Meteo Forecast API                                                                                         |
| Key              | Not required. Open-Meteo is unauthenticated for this project. Never `NEXT_PUBLIC_`. |
| Base URL         | `https://api.open-meteo.com/v1/forecast` (`OPEN_METEO_FORECAST_URL`) |
| Default base URL | `https://api.open-meteo.com/v1/forecast`                                                                        |

Official API: https://open-meteo.com/en/docs

`latitude`, `longitude`, and `timezone` (required when `daily` is set) are documented inputs. `current`, `daily`, and `forecast_days` are documented query parameters.

## PRD example query params (exact)

FR-05 example:

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

A2 must request these parameters. Do not drop `temperature_unit` or `wind_speed_unit`. Do not add extra weather variables in A1.

`{city.location.latitude}`, `{city.location.longitude}`, and `{cityTimezone}` are PRD placeholders. Hygraph Path uses handlebars on the City document (below).

## Hygraph wiring

1. Custom **REST Remote Source** (Growth or 30-day trial — **D-A0-4**).
2. **Remote Field** on the `City` model (not a top-level Query field). Inputs come from the same City entry.
3. Frontend queries that field on City through the Content API, then normalizes in Story 2 (`lib/weather`).

Official concepts:

- Remote Sources: https://hygraph.com/docs/developer-guides/remote-data/overview
- REST source + custom SDL: https://hygraph.com/docs/developer-guides/remote-data/remote-sources
- Remote Field Path handlebars: https://hygraph.com/docs/developer-guides/remote-data/remote-content
- Schema as Code lists Remote Sources / Remote fields as supported: https://hygraph.com/docs/api-reference/schema/schema-as-code

Proposed display names until A2: Remote Source “Open-Meteo”; Remote Field API ID `weather` or `openMeteo` (**proposed**). Hygraph auto-prefixes custom SDL types. Prefix is UNVERIFIED until A2.

HTTP method: GET.

### Base URL vs Path

The Remote Source base URL is `https://api.open-meteo.com/v1/forecast`. Hygraph joins Remote Source **Base URL** + Remote Field **Path**.

| If A2 sets Base URL to                   | Path starts with                    |
| ---------------------------------------- | ----------------------------------- |
| `https://api.open-meteo.com/v1/forecast` | Query string only (`?latitude=...`) |
| `https://api.open-meteo.com`             | `/v1/forecast?latitude=...`         |

Choose one in A2 so the joined URL matches the PRD example. Do not invent a third origin.

### Path template (handlebars)

Cite: https://hygraph.com/docs/developer-guides/remote-data/remote-content

Official examples interpolate scalars (`{{doc.userId}}`) and Remote Field args (`{{args.productSlug}}`). Nested Map subfields are **not** shown in those examples.

**D-A2-4** (nested Map Path failed on live query). Use input args:

```
text
?latitude={{args.query.latitude}}&longitude={{args.query.longitude}}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone={{args.query.timezone}}&temperature_unit=celsius&wind_speed_unit=kmh
```

Inputs:

| Open-Meteo param | Source                                                         | Path fragment              | Confidence |
| ---------------- | -------------------------------------------------------------- | -------------------------- | ---------- |
| `latitude`       | City `location.latitude` passed as `weather(query.latitude)`   | `{{args.query.latitude}}`  | H          |
| `longitude`      | City `location.longitude` passed as `weather(query.longitude)` | `{{args.query.longitude}}` | H          |
| `timezone`       | City `timezone` passed as `weather(query.timezone)`            | `{{args.query.timezone}}`  | H          |

Do not add a custom server weather adapter (`PRD.md` FR-05). Patch a live field with `pnpm hygraph:update-weather-remote`.

## Proposed custom SDL (until A2)

Hygraph REST Remote Sources map the JSON body to GraphQL with SDL. Official JSON success object documents `latitude`, `longitude`, `timezone`, `current` (object + `time` / `interval`), `daily` (arrays + `time` array), and `*_units`: https://open-meteo.com/en/docs

The public Open-Meteo example snippet on that page shows `hourly`, not the exact `current` / `daily` payload for the PRD params. The sketch below follows the documented `current` / `daily` shapes for those parameters. **Proposed until A2 proves the SDL against a real response.**

```
graphql
# PROPOSED. Prefix will be added by Hygraph. Prove against a live Open-Meteo body in A2.

type OpenMeteoForecast {
  latitude: Float
  longitude: Float
  elevation: Float
  generationtime_ms: Float
  utc_offset_seconds: Int
  timezone: String
  timezone_abbreviation: String
  current: OpenMeteoCurrent
  current_units: OpenMeteoCurrentUnits
  daily: OpenMeteoDaily
  daily_units: OpenMeteoDailyUnits
}

type OpenMeteoCurrent {
  time: String
  interval: Int
  temperature_2m: Float
  apparent_temperature: Float
  weather_code: Int
  wind_speed_10m: Float
}

type OpenMeteoCurrentUnits {
  time: String
  interval: String
  temperature_2m: String
  apparent_temperature: String
  weather_code: String
  wind_speed_10m: String
}

type OpenMeteoDaily {
  time: [String]
  weather_code: [Int]
  temperature_2m_max: [Float]
  temperature_2m_min: [Float]
}

type OpenMeteoDailyUnits {
  time: String
  weather_code: String
  temperature_2m_max: String
  temperature_2m_min: String
}
```

Alternatively Hygraph allows a JSON scalar return type. Prefer typed SDL once a real response is confirmed. Do not treat this sketch as the live schema.

Story 2 normalizes to the PLAN A4 view model (`current.temperature`, `forecast[]`, WMO labels). That mapping is not CMS schema.

## Cache

| Layer                | Rule                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CMS content          | Do not store weather entries or snapshot fields on City.                                                                                                                             |
| Next.js (Story 2)    | Cache the Hygraph/weather query about **10 minutes**. Do not call Open-Meteo from Next.js to implement that cache.                                                                   |
| Hygraph Remote Field | Official default TTL is 15 minutes; minimum override 60 seconds; provider `cache-control` can override. Source: https://hygraph.com/docs/developer-guides/remote-data/remote-content |

A1 does not set a CMS weather store. Whether A2 changes Hygraph Remote Field TTL is out of this contract. The PRD ~10 minute number is Story 2 Next.js.

## Failure

Weather failure must not block editorial City content (FR-09). Timeout, invalid payload, and missing Remote Field values are Story 2 concerns.

## UNVERIFIED

- Nested Map Path interpolation (D-A0-2, confidence M)
- Remote Field API ID (`weather` vs `openMeteo`)
- Remote Source prefix and final GraphQL type names
- Custom SDL vs a real Open-Meteo `current` / `daily` JSON body
- Whether Schema as Code can create this REST source and field (official docs say yes; live apply is A2)
- Plan quota for Remote Sources (D-A0-4)
- Whether Open-Meteo `cache-control` changes Hygraph TTL
- GraphQL field names for units objects if Hygraph rejects keys with digits (prove in A2)
