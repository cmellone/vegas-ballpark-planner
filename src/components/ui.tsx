import { clsx } from "clsx";
import type { ReactNode } from "react";
import { TIER_LABEL, type Tier } from "../model";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("rounded-lg border border-line bg-white shadow-card", className)}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const tierStyle: Record<Tier, string> = {
  D: "bg-green-100 text-green-800 ring-green-700/20",
  B: "bg-gold-100 text-[#7A5600] ring-gold-600/25",
  E: "bg-slate-100 text-slate-600 ring-slate-400/25",
};
export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className={clsx("inline-flex items-center whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset", tierStyle[tier])}>
      {TIER_LABEL[tier]}
    </span>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "good" | "warn" | "neutral" | "gold"; children: ReactNode }) {
  const t = {
    good: "bg-green-100 text-green-800",
    warn: "bg-rust-100 text-rust-600",
    gold: "bg-gold-100 text-[#7A5600]",
    neutral: "bg-slate-100 text-slate-600",
  }[tone];
  return <span className={clsx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium", t)}>{children}</span>;
}

export function Stat({ label, value, sub, icon, accent }: { label: string; value: string; sub?: ReactNode; icon?: ReactNode; accent?: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        {icon && <span className={clsx("grid h-8 w-8 place-items-center rounded-md", accent ? "bg-gold-100 text-[#7A5600]" : "bg-green-50 text-green-700")}>{icon}</span>}
      </div>
      <div className="mt-3 font-mono text-[28px] font-semibold tracking-tight text-ink tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-[13px] text-muted">{sub}</div>}
    </Card>
  );
}

export function PageHeader({ title, description, children, small, id }: { title: string; description?: string; children?: ReactNode; small?: boolean; id?: string }) {
  const H = small ? "h2" : "h1";
  return (
    <div id={id} className={clsx("flex scroll-mt-24 flex-wrap items-end justify-between gap-4", small && "border-t border-line pt-8")}>
      <div className="min-w-0">
        <H className={clsx("font-semibold tracking-tight text-ink", small ? "text-lg" : "text-[22px]")}>{title}</H>
        {description && <p className="mt-1 max-w-[70ch] text-sm text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export const CHART = {
  green: "#0F6B57",
  greenLight: "#7FB8A4",
  gold: "#E3A512",
  slate: "#94A39E",
  rust: "#C2553A",
  grid: "#E9ECE9",
  axis: "#7A8681",
};

export function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-line bg-white px-3 py-2 text-xs shadow-lg">
      {label != null && <div className="mb-1 font-medium text-ink">{label}</div>}
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted">
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color || p.fill }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-3 font-mono text-ink tabular-nums">{formatter ? formatter(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
