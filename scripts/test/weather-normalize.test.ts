import assert from "node:assert/strict";
import test from "node:test";

import {
  weatherConditionKey,
  weatherConditionLabel,
} from "../../lib/weather/codes.ts";
import { normalizeWeather } from "../../lib/weather/normalize.ts";
import { CITY_WEATHER_QUERY } from "../../lib/hygraph/queries.ts";

test("maps WMO codes to condition keys", () => {
  assert.equal(weatherConditionKey(0), "clear");
  assert.equal(weatherConditionKey(2), "mainlyClear");
  assert.equal(weatherConditionKey(45), "fog");
  assert.equal(weatherConditionKey(61), "rain");
  assert.equal(weatherConditionKey(95), "thunderstorm");
  assert.equal(weatherConditionKey(-1), "unknown");
});

test("localizes condition labels", () => {
  assert.equal(weatherConditionLabel(0, "en_US"), "Clear");
  assert.equal(weatherConditionLabel(0, "pt_BR"), "Céu limpo");
  assert.equal(weatherConditionLabel(0, "zh_CN"), "晴");
});

test("normalizes a valid Open-Meteo payload", () => {
  const view = normalizeWeather(
    {
      timezone: "America/Sao_Paulo",
      current: {
        time: "2026-09-04T12:00",
        temperature_2m: 22.4,
        apparent_temperature: 23.1,
        weather_code: 1,
        wind_speed_10m: 12,
      },
      daily: {
        time: ["2026-09-04", "2026-09-05", "2026-09-06"],
        weather_code: [1, 61, 0],
        temperature_2m_max: [24, 20, 26],
        temperature_2m_min: [18, 16, 19],
      },
    },
    "en_US",
    "UTC",
    "2026-09-04T15:00:00.000Z",
  );
  if (view === undefined) {
    throw new Error("expected a weather view");
  }
  assert.equal(view.provider, "Open-Meteo");
  assert.equal(view.current.temperature, 22.4);
  assert.equal(view.forecast.length, 3);
  const day = view.forecast[1];
  if (day === undefined) {
    throw new Error("expected a second forecast day");
  }
  assert.equal(day.conditionLabel, "Rain");
});

test("rejects incomplete weather payloads", () => {
  assert.equal(
    normalizeWeather({}, "en_US", "UTC", "2026-09-04T15:00:00.000Z"),
    undefined,
  );
  assert.equal(
    normalizeWeather({ current: { temperature_2m: 20 } }, "en_US", "UTC", "t"),
    undefined,
  );
});

test("City.weather query passes Map coordinates as Remote Field args", () => {
  assert.match(CITY_WEATHER_QUERY, /\$latitude: Float!/);
  assert.match(CITY_WEATHER_QUERY, /\$longitude: Float!/);
  assert.match(CITY_WEATHER_QUERY, /\$timezone: String!/);
  assert.match(CITY_WEATHER_QUERY, /weather\(\s*query:/);
});
