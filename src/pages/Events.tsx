import { useEffect, useState } from "react";
import { Card, CardHeader, PageHeader, Stat } from "../components/ui";
import { fmtM } from "../model";
import { useStore } from "../store";

function Field({ id, label, value, onChange, step }: { id: string; label: string; value: number; onChange: (n: number) => void; step: number }) {
  return (
    <label htmlFor={id} className="grid min-w-0 gap-1.5 text-[13px] font-medium text-muted">
      {label}
      <input
        id={id} type="number" inputMode="decimal" min={0} step={step} value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full min-w-0 rounded-md border border-line bg-white px-3 py-2 font-mono text-[15px] text-ink shadow-card outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
      />
    </label>
  );
}

export default function Events({ bare }: { bare?: boolean }) {
  const { inputs: x, result: r, scenario } = useStore();
  const [e, setE] = useState({ att: x.eva, fb: x.evf, rent: x.rent, comm: x.comm * 100, cost: 350000 });
  useEffect(() => setE((p) => ({ ...p, att: x.eva, fb: x.evf, rent: x.rent, comm: x.comm * 100 })), [scenario]);
  const n = (v: number) => (Number.isFinite(v) ? v : 0);
  const fbTake = n(e.att) * n(e.fb) * n(e.comm) / 100;
  const rev = fbTake + n(e.rent);
  const net = rev - n(e.cost);

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
      <div className="grid gap-6">
        <Card>
          <CardHeader title="Single-event evaluator" subtitle="Enter the terms of one proposed event. The figures shown are example terms." />
          <div className="grid items-end gap-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
            <Field id="e-att" label="Attendance" value={e.att} step={500} onChange={(v) => setE({ ...e, att: v })} />
            <Field id="e-fb" label="F&B spend per guest ($)" value={e.fb} step={1} onChange={(v) => setE({ ...e, fb: v })} />
            <Field id="e-rent" label="Facility rent ($)" value={e.rent} step={25000} onChange={(v) => setE({ ...e, rent: v })} />
            <Field id="e-comm" label="Club F&B share (%)" value={e.comm} step={1} onChange={(v) => setE({ ...e, comm: v })} />
            <Field id="e-cost" label="Event-day cost ($)" value={e.cost} step={25000} onChange={(v) => setE({ ...e, cost: v })} />
          </div>
          <div className="mx-5 mb-5 grid gap-4 rounded-lg bg-green-900 p-5 text-white sm:grid-cols-3">
            <div>
              <div className="text-[13px] text-white/60">Club revenue from the event</div>
              <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">{fmtM(rev, 2)}</div>
              <div className="mt-1 text-[13px] text-white/60">Rent {fmtM(n(e.rent), 2)} · F&amp;B {fmtM(fbTake, 2)}</div>
            </div>
            <div>
              <div className="text-[13px] text-white/60">Event-day cost</div>
              <div className="mt-1 font-mono text-3xl font-semibold tabular-nums">−{fmtM(n(e.cost), 2)}</div>
              <div className="mt-1 text-[13px] text-white/60">Staffing, security, conversion, cleanup</div>
            </div>
            <div>
              <div className="text-[13px] text-white/60">Net to the club</div>
              <div className={"mt-1 font-mono text-3xl font-semibold tabular-nums " + (net >= 0 ? "text-gold-500" : "text-[#F0957A]")}>{fmtM(net, 2)}</div>
              <div className="mt-1 text-[13px] text-white/60">{net >= 0 ? "The event adds money" : "The event loses money at these terms"}</div>
            </div>
          </div>
          <ul className="grid gap-1.5 px-5 pb-5 text-[13px] text-muted">
            <li>• Event-day costs aren't public. The $350K shown is an example to replace with a real estimate.</li>
            <li>• An event also has to fit the calendar without moving a baseball date.</li>
            <li>• The base case assumes 12 events a year. Nearby Allegiant Stadium, twice the size, hosted 22 non-football events in the year to June 2026.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
