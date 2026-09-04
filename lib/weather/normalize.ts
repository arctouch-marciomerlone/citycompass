import {
  isRecord,
  readNumber,
  readRecord,
  readUnknownArray,
} from "@/lib/guards";
import type { Locale } from "@/lib/locale";
import { weatherConditionLabel } from "@/lib/weather/codes";
import {
  WEATHER_ATTRIBUTION_URL,
  WEATHER_PROVIDER,
  type WeatherForecastDayView,
  type WeatherViewModel,
} from "@/lib/weather/types";

function readNumberArray(
  record: Record<string, unknown>,
  key: string,
): number[] | undefined {
  const items = readUnknownArray(record, key);
  if (items === undefined) {
    return undefined;
  }
  const numbers: number[] = [];
  for (const item of items) {
    if (typeof item !== "number" || !Number.isFinite(item)) {
      return undefined;
    }
    numbers.push(item);
  }
  return numbers;
}

function readStringArray(
  record: Record<string, unknown>,
  key: string,
): string[] | undefined {
  const items = readUnknownArray(record, key);
  if (items === undefined) {
    return undefined;
  }
  const strings: string[] = [];
  for (const item of items) {
    if (typeof item !== "string") {
      return undefined;
    }
    strings.push(item);
  }
  return strings;
}

export function normalizeWeather(
  payload: unknown,
  locale: Locale,
  fallbackTimezone: string,
  retrievedAt: string,
): WeatherViewModel | undefined {
  if (!isRecord(payload)) {
    return undefined;
  }

  const current = readRecord(payload, "current");
  const daily = readRecord(payload, "daily");
  if (current === undefined || daily === undefined) {
    return undefined;
  }

  const temperature = readNumber(current, "temperature_2m");
  const weatherCode = readNumber(current, "weather_code");
  if (temperature === undefined || weatherCode === undefined) {
    return undefined;
  }

  const times = readStringArray(daily, "time");
  const codes = readNumberArray(daily, "weather_code");
  const maxTemps = readNumberArray(daily, "temperature_2m_max");
  const minTemps = readNumberArray(daily, "temperature_2m_min");
  if (
    times === undefined ||
    codes === undefined ||
    maxTemps === undefined ||
    minTemps === undefined
  ) {
    return undefined;
  }

  const forecast: WeatherForecastDayView[] = [];
  const count = Math.min(
    times.length,
    codes.length,
    maxTemps.length,
    minTemps.length,
    3,
  );
  for (let index = 0; index < count; index += 1) {
    const date = times[index];
    const dayCode = codes[index];
    const maxTemperature = maxTemps[index];
    const minTemperature = minTemps[index];
    if (
      date === undefined ||
      dayCode === undefined ||
      maxTemperature === undefined ||
      minTemperature === undefined
    ) {
      return undefined;
    }
    forecast.push({
      date,
      minTemperature,
      maxTemperature,
      weatherCode: dayCode,
      conditionLabel: weatherConditionLabel(dayCode, locale),
    });
  }

  if (forecast.length === 0) {
    return undefined;
  }

  const timezoneValue = payload["timezone"];
  const timezone =
    typeof timezoneValue === "string" && timezoneValue.length > 0
      ? timezoneValue
      : fallbackTimezone;

  const apparentTemperature = readNumber(current, "apparent_temperature");
  const windSpeed = readNumber(current, "wind_speed_10m");
  const observationTimeValue = current["time"];
  const observationTime =
    typeof observationTimeValue === "string" ? observationTimeValue : undefined;

  return {
    provider: WEATHER_PROVIDER,
    attributionUrl: WEATHER_ATTRIBUTION_URL,
    timezone,
    retrievedAt,
    current: {
      temperature,
      apparentTemperature,
      weatherCode,
      conditionLabel: weatherConditionLabel(weatherCode, locale),
      windSpeed,
      observationTime,
    },
    forecast,
  };
}
