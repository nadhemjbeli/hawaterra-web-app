import { fetchFarmWeather } from "@/lib/weather/open-meteo";
import { Card } from "@/components/ui/card";
import { WeatherCard } from "./weather-card";
import { WeatherForecast } from "./weather-forecast";

// Async Server Component: owns the fetch and the error state, so a weather
// provider outage can never break the rest of /plants. fetchFarmWeather()
// never throws, so there is nothing here to try/catch.
export async function FarmWeatherSection() {
  const result = await fetchFarmWeather();

  if (result.status === "error") {
    return (
      <Card className="flex flex-col gap-1">
        <h2 className="text-sm font-medium text-ink-muted">Farm Weather</h2>
        <p className="text-sm text-error">
          Weather unavailable right now. Your plants are unaffected.
        </p>
      </Card>
    );
  }

  const { weather } = result;
  const [today, ...upcoming] = weather.daily;

  return (
    <Card className="flex flex-col gap-3">
      <WeatherCard
        farmName={weather.farmName}
        current={weather.current}
        today={today}
      />
      <WeatherForecast days={upcoming} />
      <p className="text-right text-xs text-ink-muted">
        Regional forecast • Open-Meteo
      </p>
    </Card>
  );
}
