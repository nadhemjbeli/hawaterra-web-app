"use client";

import { motion } from "motion/react";
import { PLANT_STATUSES } from "@/lib/constants";
import { STATUS_VARS } from "@/components/ui/badge";

export function StatusChart({
  counts,
}: {
  counts: Partial<Record<string, number>>;
}) {
  const rows = PLANT_STATUSES.map((status) => ({
    status,
    count: counts[status] ?? 0,
  })).filter((row) => row.count > 0);

  if (rows.length === 0) return null;

  const max = Math.max(...rows.map((row) => row.count));

  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((row) => {
        const vars = STATUS_VARS[row.status];
        const widthPct = Math.max((row.count / max) * 100, 6);
        return (
          <div key={row.status} className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium capitalize text-ink-muted">
              {row.status}
            </span>
            <div className="h-5 flex-1 overflow-hidden rounded-full bg-background">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: vars.bg }}
                initial={{ width: 0 }}
                animate={{ width: `${widthPct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="w-5 shrink-0 text-right text-xs font-semibold tabular-nums text-ink">
              {row.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
