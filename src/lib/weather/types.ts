// Provider-neutral weather model. Nothing outside src/lib/weather/ should
// ever see an Open-Meteo field name or a raw WMO weather code — if the
// provider changes later, only open-meteo.ts (or its replacement) changes.

export type WeatherCondition = {
  code: number;
  label: string;
  icon: string;
};

export type CurrentFarmWeather = {
  temperatureC: number;
  apparentTemperatureC: number;
  relativeHumidityPercent: number;
  precipitationMm: number;
  windSpeedKmh: number;
  windGustsKmh: number;
  condition: WeatherCondition;
};

export type DailyForecastDay = {
  date: string; // "YYYY-MM-DD", local to the farm's timezone
  condition: WeatherCondition;
  temperatureMaxC: number;
  temperatureMinC: number;
  precipitationProbabilityPercent: number | null;
  precipitationSumMm: number;
  windGustsMaxKmh: number;
};

export type FarmWeather = {
  farmName: string;
  current: CurrentFarmWeather;
  daily: DailyForecastDay[]; // today first
  source: "open-meteo";
  fetchedAt: string; // ISO timestamp
};

export type WeatherResult =
  | { status: "ok"; weather: FarmWeather }
  | { status: "error"; message: string };
