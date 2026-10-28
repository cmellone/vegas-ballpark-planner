import { useEffect, useState } from "react";
import { Card, CardHeader, PageHeader, Stat } from "../components/ui";
import { fmtM } from "../model";
import { useStore } from "../store";

function Field({ id, label, value, onChange, step }: { id: string; label: string; value: number; onChange: (n: number) => void; step: number }) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-[13px] font-medium text-muted">
      {label}
      <input
        id={id} type="number" inputMode="decimal" min={0} step={step} value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="rounded-md border border-line bg-white px-3 py-2 font-mono text-[15px] text-ink shadow-card outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
      />
    </label>
  );
}

export default function Events({ bare }: { bare?: boolean }) {
  const { inputs: x, result: r, scenario } = useStore();
  const [e, setE] = useState({ att: x.eva, fb: x.evf, rent: x.rent, comm: x.comm * 100 });
  useEffect(() => setE({ att: x.eva, fb: x.evf, rent: x.rent, comm: x.comm * 100 }), [scenario]);
  const n = (v: number) => (Number.isFinite(v) ? v : 0);
  const fbTake = n(e.att) * n(e.fb) * n(e.comm) / 100;
  const net = fbTake + n(e.rent);

  return (
    <div className="grid gap-6">
      <PageHeader small={bare}
        title="Dome events"
        description="A climate-controlled ballpark on the Strip can host concerts, fights and neutral-site games on non-baseball dates. This section sizes the annual line and tests a single event."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Events per year" value={String(x.ev)} sub="Non-baseball dates" />
        <Stat label="Club take per event" value={fmtM(r.evPer, 2)} sub="Rent plus F&B share" />
        <Stat label="Annual events revenue" value={fmtM(r.events)} sub={`${((r.events / r.total) * 100).toFixed(1)}% of total`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Single-event evaluator" subtitle="Enter the terms of one proposed event" />
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <Field id="e-att" label="Attendance" value={e.att} step={500} onChange={(v) => setE({ ...e, att: v })} />
            <Field id="e-fb" label="F&B spend per guest ($)" value={e.fb} step={1} onChange={(v) => setE({ ...e, fb: v })} />
            <Field id="e-rent" label="Facility rent ($)" value={e.rent} step={25000} onChange={(v) => setE({ ...e, rent: v })} />
            <Field id="e-comm" label="Club F&B share (%)" value={e.comm} step={1} onChange={(v) => setE({ ...e, comm: v })} />
          </div>
          <div className="mx-5 mb-5 grid gap-4 rounded-lg bg-green-900 p-5 text-white sm:grid-cols-2">
            <div>
              <div className="text-[13px] text-white/60">Club revenue from the event</div>
              <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">{fmtM(net, 2)}</div>
              <div className="mt-1 text-[13px] text-white/60">Rent {fmtM(n(e.rent), 2)} · F&amp;B {fmtM(fbTake, 2)}</div>
            </div>
            <div>
              <div className="text-[13px] text-white/60">Breakeven event-day cost</div>
              <div className="mt-1 font-mono text-3xl font-semibold tabular-nums text-gold-500">{fmtM(net, 2)}</div>
              <div className="mt-1 text-[13px] text-white/60">Most the event can cost the club and still pay</div>
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="How to read it" />
          <div className="grid gap-3 p-5 text-sm text-ink">
            <p>Event-day costs (staffing, security, field conversion, cleanup) aren't public, so the tool doesn't guess them. It returns the ceiling instead: if the club's costs come in below the breakeven figure, the event adds money.</p>
            <p className="text-muted">The other test is the calendar. An event only works if it doesn't push a baseball date or damage the field before a homestand.</p>
            <p className="text-muted">Why 12 events in the base case: Allegiant Stadium hosted 15 concerts and seven other ticketed events in the year to June 2026, on top of football. The ballpark is half that size and has 81 home dates to work around.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
