import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/mock-data";
import { priorityStyles } from "@/lib/mock-data";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        priorityStyles[priority],
      )}
    >
      {priority}
    </span>
  );
}

export function Gauge({ value, delta }: { value: number; delta?: number }) {
  const size = 200;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="var(--muted)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="var(--secondary)"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-primary">{value}%</span>
        <span className="text-xs text-muted-foreground">Overall Competency</span>
        {delta !== undefined && (
          <span className="mt-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success">
            +{delta}%
          </span>
        )}
      </div>
    </div>
  );
}

export function LabeledBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted-foreground">{value}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export function LevelDots({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            "size-2.5 rounded-full",
            i <= level ? "bg-secondary" : "bg-muted",
          )}
        />
      ))}
      <span className="ml-1.5 text-xs text-muted-foreground">{level}/5</span>
    </span>
  );
}
