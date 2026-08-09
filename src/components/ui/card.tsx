import type { HTMLAttributes } from "react";

export const cardClassName = "rounded-2xl border border-border bg-surface p-4 shadow-sm";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${cardClassName} ${className}`} {...props} />;
}
