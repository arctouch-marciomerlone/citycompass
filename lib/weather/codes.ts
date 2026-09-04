import type { Locale } from "@/lib/locale";

interface WmoRange {
  readonly max: number;
  readonly key: WeatherConditionKey;
}

export type WeatherConditionKey =
  | "clear"
  | "mainlyClear"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "showers"
  | "thunderstorm"
  | "unknown";

const RANGES: readonly WmoRange[] = [
  { max: 0, key: "clear" },
  { max: 3, key: "mainlyClear" },
  { max: 48, key: "fog" },
  { max: 57, key: "drizzle" },
  { max: 67, key: "rain" },
  { max: 77, key: "snow" },
  { max: 82, key: "showers" },
  { max: 99, key: "thunderstorm" },
];

export function weatherConditionKey(code: number): WeatherConditionKey {
  if (!Number.isInteger(code) || code < 0) {
    return "unknown";
  }
  for (const range of RANGES) {
    if (code <= range.max) {
      return range.key;
    }
  }
  return "unknown";
}

const LABELS: Record<WeatherConditionKey, Record<Locale, string>> = {
  clear: {
    en_US: "Clear",
    pt_BR: "Céu limpo",
    zh_CN: "晴",
  },
  mainlyClear: {
    en_US: "Partly cloudy",
    pt_BR: "Parcialmente nublado",
    zh_CN: "多云",
  },
  fog: {
    en_US: "Fog",
    pt_BR: "Neblina",
    zh_CN: "雾",
  },
  drizzle: {
    en_US: "Drizzle",
    pt_BR: "Garoa",
    zh_CN: "毛毛雨",
  },
  rain: {
    en_US: "Rain",
    pt_BR: "Chuva",
    zh_CN: "雨",
  },
  snow: {
    en_US: "Snow",
    pt_BR: "Neve",
    zh_CN: "雪",
  },
  showers: {
    en_US: "Showers",
    pt_BR: "Pancadas",
    zh_CN: "阵雨",
  },
  thunderstorm: {
    en_US: "Thunderstorm",
    pt_BR: "Trovoada",
    zh_CN: "雷暴",
  },
  unknown: {
    en_US: "Weather unavailable",
    pt_BR: "Tempo indisponível",
    zh_CN: "天气不可用",
  },
};

export function weatherConditionLabel(code: number, locale: Locale): string {
  const labels = LABELS[weatherConditionKey(code)];
  return labels[locale];
}
