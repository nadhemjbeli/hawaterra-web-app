export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-foreground shadow-sm",
  secondary: "border border-border bg-surface text-ink",
  ghost: "text-ink-muted",
  destructive: "bg-[var(--status-critical)] text-white shadow-sm",
};

export const buttonBaseClassName =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-medium transition-colors disabled:pointer-events-none disabled:opacity-50";

export function buttonClassName(
  variant: ButtonVariant = "primary",
  className = "",
) {
  return `${buttonBaseClassName} ${VARIANT_CLASSES[variant]} ${className}`;
}
