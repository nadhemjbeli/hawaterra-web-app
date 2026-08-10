import type {
  CurrentFarmWeather,
  DailyForecastDay,
  FarmWeather,
  WeatherCondition,
  WeatherResult,
} from "./types";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REVALIDATE_SECONDS = 900; // 15 minutes

const CURRENT_FIELDS = [
  "temperature_2m",
  "relative_humidity_2m",
  "apparent_temperature",
  "precipitation",
  "weather_code",
  "wind_speed_10m",
  "wind_gusts_10m",
];

const DAILY_FIELDS = [
  "weather_code",
  "temperature_2m_max",
  "temperature_2m_min",
  "precipitation_probability_max",
  "precipitation_sum",
  "wind_gusts_10m_max",
];

// WMO weather interpretation codes, as used by Open-Meteo.
// https://open-meteo.com/en/docs — "WMO Weather interpretation codes"
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Depositing rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Moderate drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌦️" },
  56: { label: "Light freezing drizzle", icon: "🌦️" },
  57: { label: "Dense freezing drizzle", icon: "🌦️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Moderate rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Light freezing rain", icon: "🌧️" },
  67: { label: "Heavy freezing rain", icon: "🌧️" },
  71: { label: "Slight snow fall", icon: "🌨️" },
  73: { label: "Moderate snow fall", icon: "🌨️" },
  75: { label: "Heavy snow fall", icon: "🌨️" },
  77: { label: "Snow grains", icon: "🌨️" },
  80: { label: "Slight rain showers", icon: "🌦️" },
  81: { label: "Moderate rain showers", icon: "🌦️" },
  82: { label: "Violent rain showers", icon: "🌧️" },
  85: { label: "Slight snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm with slight hail", icon: "⛈️" },
  99: { label: "Thunderstorm with heavy hail", icon: "⛈️" },
};

function describeWeatherCode(code: number): WeatherCondition {
  const known = WMO_CODES[code];
  return known
    ? { code, label: known.label, icon: known.icon }
    : { code, label: "Unknown conditions", icon: "🌡️" };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

type OpenMeteoResponse = {
  current?: Record<string, unknown>;
  daily?: Record<string, unknown[]>;
};

function mapCurrent(raw: Record<string, unknown>): CurrentFarmWeather | null {
  const {
    temperature_2m,
    relative_humidity_2m,
    apparent_temperature,
    precipitation,
    weather_code,
    wind_speed_10m,
    wind_gusts_10m,
  } = raw;

  if (
    !isFiniteNumber(temperature_2m) ||
    !isFiniteNumber(relative_humidity_2m) ||
    !isFiniteNumber(apparent_temperature) ||
    !isFiniteNumber(precipitation) ||
    !isFiniteNumber(weather_code) ||
    !isFiniteNumber(wind_speed_10m) ||
    !isFiniteNumber(wind_gusts_10m)
  ) {
    return null;
  }

  return {
    temperatureC: temperature_2m,
    apparentTemperatureC: apparent_temperature,
    relativeHumidityPercent: relative_humidity_2m,
    precipitationMm: precipitation,
    windSpeedKmh: wind_speed_10m,
    windGustsKmh: wind_gusts_10m,
    condition: describeWeatherCode(weather_code),
  };
}

function mapDaily(raw: Record<string, unknown[]>): DailyForecastDay[] | null {
  const time = raw.time;
  const weatherCode = raw.weather_code;
  const tempMax = raw.temperature_2m_max;
  const tempMin = raw.temperature_2m_min;
  const precipProbability = raw.precipitation_probability_max;
  const precipSum = raw.precipitation_sum;
  const windGustsMax = raw.wind_gusts_10m_max;

  if (
    !Array.isArray(time) ||
    !Array.isArray(weatherCode) ||
    !Array.isArray(tempMax) ||
    !Array.isArray(tempMin) ||
    !Array.isArray(precipSum) ||
    !Array.isArray(windGustsMax)
  ) {
    return null;
  }

  const days: DailyForecastDay[] = [];
  for (let i = 0; i < time.length; i++) {
    const date = time[i];
    const code = weatherCode[i];
    const max = tempMax[i];
    const min = tempMin[i];
    const gusts = windGustsMax[i];
    const sum = precipSum[i];
    const probability = Array.isArray(precipProbability)
      ? precipProbability[i]
      : undefined;

    if (
      typeof date !== "string" ||
      !isFiniteNumber(code) ||
      !isFiniteNumber(max) ||
      !isFiniteNumber(min) ||
      !isFiniteNumber(gusts) ||
      !isFiniteNumber(sum)
    ) {
      return null;
    }

    days.push({
      date,
      condition: describeWeatherCode(code),
      temperatureMaxC: max,
      temperatureMinC: min,
      precipitationProbabilityPercent: isFiniteNumber(probability)
        ? probability
        : null,
      precipitationSumMm: sum,
      windGustsMaxKmh: gusts,
    });
  }

  return days;
}

export async function fetchFarmWeather(): Promise<WeatherResult> {
  const farmName = process.env.HAWATERRA_FARM_NAME;
  const latitude = process.env.HAWATERRA_FARM_LATITUDE;
  const longitude = process.env.HAWATERRA_FARM_LONGITUDE;

  if (!farmName || !latitude || !longitude) {
    return {
      status: "error",
      message: "Farm location is not configured.",
    };
  }

  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("current", CURRENT_FIELDS.join(","));
  url.searchParams.set("daily", DAILY_FIELDS.join(","));
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return {
        status: "error",
        message: `Weather provider returned ${response.status}.`,
      };
    }

    const data = (await response.json()) as OpenMeteoResponse;

    if (!data.current || !data.daily) {
      return { status: "error", message: "Weather response was incomplete." };
    }

    const current = mapCurrent(data.current);
    const daily = mapDaily(data.daily);

    if (!current || !daily) {
      return { status: "error", message: "Weather response was malformed." };
    }

    const weather: FarmWeather = {
      farmName,
      current,
      daily,
      source: "open-meteo",
      fetchedAt: new Date().toISOString(),
    };

    return { status: "ok", weather };
  } catch {
    return {
      status: "error",
      message: "Could not reach the weather provider.",
    };
  }
}
