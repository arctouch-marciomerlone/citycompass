import { contentGraphql } from "@/lib/hygraph/client";
import { CITY_WEATHER_QUERY } from "@/lib/hygraph/queries";
import { CacheTag } from "@/lib/hygraph/enumerations";
import { isRecord, readRecord } from "@/lib/guards";
import type { Locale } from "@/lib/locale";
import { weatherTimeoutMs, weatherRevalidateSeconds } from "@/lib/env";
import { normalizeWeather } from "@/lib/weather/normalize";
import type { WeatherViewModel } from "@/lib/weather/types";

export async function fetchCityWeather(options: {
  readonly slug: string;
  readonly locale: Locale;
  readonly latitude: number;
  readonly longitude: number;
  readonly timezone: string;
}): Promise<WeatherViewModel | undefined> {
  try {
    const data = await contentGraphql(CITY_WEATHER_QUERY, {
      variables: {
        slug: options.slug,
        latitude: options.latitude,
        longitude: options.longitude,
        timezone: options.timezone,
      },
      tags: [CacheTag.City],
      revalidateSeconds: weatherRevalidateSeconds(),
      timeoutMs: weatherTimeoutMs(),
    });
    if (!isRecord(data)) {
      return undefined;
    }
    const city = readRecord(data, "city");
    if (city === undefined) {
      return undefined;
    }
    return normalizeWeather(
      city["weather"],
      options.locale,
      options.timezone,
      new Date().toISOString(),
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "unknown weather error";
    console.error(`City.weather query failed: ${message}`);
    return undefined;
  }
}
