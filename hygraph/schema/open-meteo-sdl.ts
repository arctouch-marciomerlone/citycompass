/**
 * Custom SDL for the Open-Meteo REST Remote Source.
 * Proven against a live Forecast API body on 2026-09-03
 * (current + daily arrays for the PRD query params).
 */
export const OPEN_METEO_SDL = `
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

input OpenMeteoQueryInput {
  latitude: Float!
  longitude: Float!
  timezone: String!
}
`.trim();

export const OPEN_METEO_QUERY_INPUT_SDL = `
input OpenMeteoQueryInput {
  latitude: Float!
  longitude: Float!
  timezone: String!
}
`.trim();
