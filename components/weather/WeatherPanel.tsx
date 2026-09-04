import { formatDateInTimeZone, formatDateTimeInTimeZone } from "@/lib/datetime";
import type { UiMessages } from "@/lib/i18n/messages";
import type { Locale } from "@/lib/locale";
import type { WeatherViewModel } from "@/lib/weather/types";

export function WeatherPanel({
  locale,
  heading,
  showCurrent,
  weather,
  messages,
}: {
  readonly locale: Locale;
  readonly heading: string | undefined;
  readonly showCurrent: boolean;
  readonly weather: WeatherViewModel | undefined;
  readonly messages: UiMessages;
}) {
  const title = heading ?? messages.forecastHeading;

  if (weather === undefined) {
    return (
      <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-xl font-medium">{title}</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {messages.weatherUnavailable}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-xl font-medium">{title}</h2>
      {showCurrent ? (
        <p className="mt-3 text-3xl font-semibold">
          {String(Math.round(weather.current.temperature))}°C
          <span className="ml-3 text-base font-normal">
            {weather.current.conditionLabel}
          </span>
        </p>
      ) : null}
      {showCurrent && weather.current.observationTime !== undefined ? (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {formatDateTimeInTimeZone(
            weather.current.observationTime,
            weather.timezone,
            locale,
          )}
        </p>
      ) : null}
      <h3 className="mt-4 text-sm font-medium">{messages.forecastHeading}</h3>
      <ol className="mt-2 grid gap-2 sm:grid-cols-3">
        {weather.forecast.map((day) => (
          <li
            key={day.date}
            className="rounded bg-zinc-50 p-3 text-sm dark:bg-zinc-900"
          >
            <div>
              {formatDateInTimeZone(day.date, weather.timezone, locale)}
            </div>
            <div>
              {String(Math.round(day.minTemperature))}° /{" "}
              {String(Math.round(day.maxTemperature))}°
            </div>
            <div>{day.conditionLabel}</div>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs">
        <a href={weather.attributionUrl} rel="noreferrer" className="underline">
          {messages.weatherAttribution}
        </a>
      </p>
    </section>
  );
}
