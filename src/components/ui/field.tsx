import type { LabelHTMLAttributes, ReactNode } from "react";

export const fieldInputClassName =
  "rounded-xl border border-border bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/40";

export const fieldSelectClassName = `${fieldInputClassName} cursor-pointer`;

export function FieldGroup({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`flex flex-col gap-1 ${className}`}>{children}</div>;
}

export function FieldLabel({
  className = "",
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`text-sm font-medium text-ink ${className}`} {...props} />
  );
}

export function FieldError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="text-sm font-medium text-error">{children}</p>;
}
