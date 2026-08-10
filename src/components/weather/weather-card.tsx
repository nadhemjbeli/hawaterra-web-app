import type { CurrentFarmWeather, DailyForecastDay } from "@/lib/weather/types";

function round(value: number) {
  return Math.round(value);
}

export function WeatherCard({
  farmName,
  current,
  today,
}: {
  farmName: string;
  current: CurrentFarmWeather;
  today: DailyForecastDay | undefined;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium text-ink-muted">Farm Weather</h2>
        <p className="text-base font-semibold text-ink">{farmName}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-4xl leading-none" aria-hidden="true">
          {current.condition.icon}
        </span>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold tabular-nums text-ink">
            {round(current.temperatureC)}°C
          </span>
          <span className="text-sm text-ink-muted">
            {current.condition.label} · feels like{" "}
            {round(current.apparentTemperatureC)}°C
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
        <span>Humidity {round(current.relativeHumidityPercent)}%</span>
        <span>Wind {round(current.windSpeedKmh)} km/h</span>
        <span>Gusts {round(current.windGustsKmh)} km/h</span>
        <span>Now {current.precipitationMm} mm</span>
      </div>

      {today && (
        <div className="flex items-center gap-4 border-t border-border pt-3 text-sm">
          <span className="font-medium text-ink">Today</span>
          <span className="text-ink">
            H {round(today.temperatureMaxC)}° / L{" "}
            {round(today.temperatureMinC)}°
          </span>
          {today.precipitationProbabilityPercent !== null && (
            <span className="text-ink-muted">
              Rain {round(today.precipitationProbabilityPercent)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
