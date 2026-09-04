import {
  defineConstObject,
  type ValueOf,
} from "../../lib/types/const-object.ts";

export const ModelApiId = defineConstObject({
  City: "City",
  Place: "Place",
  Category: "Category",
  Neighborhood: "Neighborhood",
});

export type ModelApiId = ValueOf<typeof ModelApiId>;

export const CITYCOMPASS_MODEL_API_IDS: readonly ModelApiId[] = [
  ModelApiId.City,
  ModelApiId.Place,
  ModelApiId.Category,
  ModelApiId.Neighborhood,
];

export const LocaleApiId = defineConstObject({
  En: "en",
  EnUs: "en_US",
  PtBr: "pt_BR",
  ZhCn: "zh_CN",
});

export type LocaleApiId = ValueOf<typeof LocaleApiId>;

export const REQUIRED_LOCALES: readonly string[] = [
  LocaleApiId.EnUs,
  LocaleApiId.PtBr,
  LocaleApiId.ZhCn,
];

export const EnumerationApiId = defineConstObject({
  IconKey: "IconKey",
  PriceBand: "PriceBand",
  FeaturedPlacesLayout: "FeaturedPlacesLayout",
  OpeningHoursDay: "OpeningHoursDay",
});

export const ComponentApiId = defineConstObject({
  Seo: "SEO",
  OpeningHours: "OpeningHours",
  HeroBlock: "HeroBlock",
  RichTextBlock: "RichTextBlock",
  FeaturedPlacesBlock: "FeaturedPlacesBlock",
  WeatherBlock: "WeatherBlock",
  MapBlock: "MapBlock",
  CallToActionBlock: "CallToActionBlock",
});

export const PAGE_SECTION_COMPONENT_API_IDS: readonly string[] = [
  ComponentApiId.HeroBlock,
  ComponentApiId.RichTextBlock,
  ComponentApiId.FeaturedPlacesBlock,
  ComponentApiId.WeatherBlock,
  ComponentApiId.MapBlock,
  ComponentApiId.CallToActionBlock,
];

export const REMOTE_SOURCE_PREFIX = "OpenMeteo";
export const REMOTE_FORECAST_TYPE = "OpenMeteoForecast";
export const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
export const CITY_WEATHER_FIELD = "weather";
export const WEATHER_QUERY_ARG_API_ID = "query";
export const WEATHER_QUERY_INPUT_TYPE = "OpenMeteoQueryInput";
export const SLUG_RENDERER = "GCMS_SLUG";

export const HTTP_URL_PATTERN = "^https?://.+";

export const WEATHER_REMOTE_INPUT_ARGS = [
  {
    apiId: WEATHER_QUERY_ARG_API_ID,
    remoteTypeApiId: WEATHER_QUERY_INPUT_TYPE,
    isRequired: true,
    isList: false,
  },
];

export const WEATHER_REST_PATH =
  "?latitude={{args.query.latitude}}&longitude={{args.query.longitude}}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=3&timezone={{args.query.timezone}}&temperature_unit=celsius&wind_speed_unit=kmh";
