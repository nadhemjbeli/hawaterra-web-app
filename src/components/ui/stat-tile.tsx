import { Card } from "./card";

export function StatTile({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card className="flex flex-1 flex-col gap-1 p-4">
      <span className="text-2xl font-semibold tabular-nums text-ink">
        {value}
      </span>
      <span className="text-sm text-ink-muted">{label}</span>
    </Card>
  );
}
