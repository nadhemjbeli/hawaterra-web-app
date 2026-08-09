import type { ReactNode } from "react";
import type { PlantStatus } from "@/lib/constants";

export const STATUS_VARS: Record<PlantStatus, { bg: string; text: string }> = {
  cutting: { bg: "var(--lifecycle-1)", text: "var(--lifecycle-1-text)" },
  rooting: { bg: "var(--lifecycle-2)", text: "var(--lifecycle-2-text)" },
  growing: { bg: "var(--lifecycle-3)", text: "var(--lifecycle-3-text)" },
  flowering: { bg: "var(--lifecycle-4)", text: "var(--lifecycle-4-text)" },
  fruiting: { bg: "var(--lifecycle-5)", text: "var(--lifecycle-5-text)" },
  dormant: { bg: "var(--status-warning)", text: "var(--status-text-on-light)" },
  stressed: { bg: "var(--status-warning)", text: "var(--status-text-on-light)" },
  sick: { bg: "var(--status-serious)", text: "var(--status-text-on-light)" },
  dead: { bg: "var(--status-critical)", text: "var(--status-text-on-dark)" },
  archived: { bg: "var(--neutral-muted)", text: "var(--neutral-muted-text)" },
};

export function StatusBadge({ status }: { status: string }) {
  const vars = STATUS_VARS[status as PlantStatus] ?? STATUS_VARS.archived;
  return (
    <span
      className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: vars.bg, color: vars.text }}
    >
      {status}
    </span>
  );
}

export function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full bg-background px-2.5 py-0.5 text-xs font-medium capitalize text-ink-muted ${className}`}
    >
      {children}
    </span>
  );
}
