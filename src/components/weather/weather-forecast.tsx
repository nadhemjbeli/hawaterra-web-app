"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { DailyForecastDay } from "@/lib/weather/types";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
import { buttonClassName } from "@/components/ui/button-styles";

// dateStr is a plain "YYYY-MM-DD" calendar date (already localized to the
// farm's timezone by Open-Meteo's timezone=auto). Parsing/formatting via
// UTC keeps it an opaque calendar date instead of re-interpreting it
// through whatever timezone this server happens to run in.
function formatWeekday(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    timeZone: "UTC",
  }).format(date);
}

function formatFullDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function round(value: number) {
  return Math.round(value);
}

export function WeatherForecast({ days }: { days: DailyForecastDay[] }) {
  const [selected, setSelected] = useState<DailyForecastDay | null>(null);

  useLockBodyScroll(selected !== null);

  if (days.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2 border-t border-border pt-3">
        {days.map((day) => (
          <button
            key={day.date}
            type="button"
            onClick={() => setSelected(day)}
            className="flex min-w-18 flex-1 cursor-pointer flex-col items-center gap-0.5 rounded-xl bg-background px-2 py-2 text-center transition-colors hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
          >
            <span className="text-xs font-medium text-ink-muted">
              {formatWeekday(day.date)}
            </span>
            <span className="text-lg leading-none" aria-hidden="true">
              {day.condition.icon}
            </span>
            <span className="text-sm text-ink">
              {round(day.temperatureMaxC)}°/{round(day.temperatureMinC)}°
            </span>
            {day.precipitationProbabilityPercent !== null && (
              <span className="text-xs text-ink-muted">
                {round(day.precipitationProbabilityPercent)}%
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="forecast-day-title"
              className="w-full max-w-xs rounded-2xl border border-border bg-surface p-5 shadow-lg"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl leading-none" aria-hidden="true">
                  {selected.condition.icon}
                </span>
                <div>
                  <p
                    id="forecast-day-title"
                    className="text-base font-semibold text-ink"
                  >
                    {formatFullDate(selected.date)}
                  </p>
                  <p className="text-sm text-ink-muted">
                    {selected.condition.label}
                  </p>
                </div>
              </div>

              <dl className="mt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-muted">High / Low</dt>
                  <dd className="text-ink">
                    {round(selected.temperatureMaxC)}° /{" "}
                    {round(selected.temperatureMinC)}°
                  </dd>
                </div>
                {selected.precipitationProbabilityPercent !== null && (
                  <div className="flex justify-between">
                    <dt className="text-ink-muted">Rain probability</dt>
                    <dd className="text-ink">
                      {round(selected.precipitationProbabilityPercent)}%
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Precipitation total</dt>
                  <dd className="text-ink">
                    {selected.precipitationSumMm} mm
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-muted">Wind gusts</dt>
                  <dd className="text-ink">
                    {round(selected.windGustsMaxKmh)} km/h
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className={`${buttonClassName("secondary")} mt-4 w-full`}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
