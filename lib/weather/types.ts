export const WEATHER_PROVIDER = "Open-Meteo";
export const WEATHER_ATTRIBUTION_URL = "https://open-meteo.com/";

export interface WeatherCurrentView {
  readonly temperature: number;
  readonly apparentTemperature?: number;
  readonly weatherCode: number;
  readonly conditionLabel: string;
  readonly windSpeed?: number;
  readonly observationTime?: string;
}

export interface WeatherForecastDayView {
  readonly date: string;
  readonly minTemperature: number;
  readonly maxTemperature: number;
  readonly weatherCode: number;
  readonly conditionLabel: string;
}

export interface WeatherViewModel {
  readonly provider: string;
  readonly attributionUrl: string;
  readonly timezone: string;
  readonly retrievedAt: string;
  readonly current: WeatherCurrentView;
  readonly forecast: readonly WeatherForecastDayView[];
}
