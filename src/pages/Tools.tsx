import { useState } from "react";
import { Card, CardHeader, PageHeader } from "../components/ui";
import { fmtM, pick } from "../model";
import { useStore } from "../store";
import Events from "./Events";

function Field({ id, label, value, onChange, step, hint }: { id: string; label: string; value: number; onChange: (n: number) => void; step: number; hint?: string }) {
  return (
    <label htmlFor={id} className="grid min-w-0 gap-1.5 text-[13px] font-medium text-muted">
      {label}
      <input id={id} type="number" inputMode="decimal" step={step} value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full min-w-0 rounded-md border border-line bg-white px-3 py-2 font-mono text-[15px] text-ink shadow-card outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
      {hint && <span className="text-xs font-normal text-muted">{hint}</span>}
    </label>
  );
}
const n = (v: number) => (Number.isFinite(v) ? v : 0);

function Result({ items }: { items: { k: string; v: string; s?: string; gold?: boolean }[] }) {
  return (
    <div className="grid gap-4 rounded-lg bg-green-900 p-5 text-white sm:grid-cols-3">
      {items.map((i) => (
        <div key={i.k}>
          <div className="text-[13px] text-white/60">{i.k}</div>
          <div className={"mt-1 font-mono text-2xl font-semibold tabular-nums " + (i.gold ? "text-gold-500" : "")}>{i.v}</div>
          {i.s && <div className="mt-1 text-[12px] text-white/60">{i.s}</div>}
        </div>
      ))}
    </div>
  );
}

function SponsorshipTool() {
  const { values } = useStore();
  const budget = pick(values, "b").sp2;
  const [fee, setFee] = useState(2);
  const [esc, setEsc] = useState(3);
  const [term, setTerm] = useState(5);
  const [cost, setCost] = useState(15);
  const [rate, setRate] = useState(8);
  const years = Math.max(1, Math.min(20, Math.round(n(term))));
  const rows = Array.from({ length: years }, (_, i) => {
    const f = n(fee) * 1e6 * Math.pow(1 + n(esc) / 100, i);
    const c = f * n(cost) / 100;
    const net = f - c;
    const pv = net / Math.pow(1 + n(rate) / 100, i + 1);
    return { y: i + 1, f, c, net, pv };
  });
  const tcv = rows.reduce((x, r) => x + r.f, 0);
  const npv = rows.reduce((x, r) => x + r.pv, 0);
  const share = budget ? (n(fee) * 1e6) / budget : 0;
  return (
    <Card>
      <CardHeader title="Sponsorship deal evaluator" subtitle="Enter the terms of a proposed multi-year partnership. The figures shown are example terms." />
      <div className="grid items-end gap-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
        <Field id="s-fee" label="Year-one fee ($M)" value={fee} step={0.25} onChange={setFee} />
        <Field id="s-esc" label="Yearly increase (%)" value={esc} step={0.5} onChange={setEsc} />
        <Field id="s-term" label="Term (years)" value={term} step={1} onChange={setTerm} />
        <Field id="s-cost" label="Delivery cost (% of fee)" value={cost} step={1} onChange={setCost} />
        <Field id="s-rate" label="Discount rate (%)" value={rate} step={0.5} onChange={setRate} />
      </div>
      <div className="mx-5 mb-5"><Result items={[
        { k: "Total contract value", v: fmtM(tcv, 2), s: `${years} years of fees` },
        { k: "Value in today's dollars", v: fmtM(npv, 2), s: "Net of delivery cost, discounted", gold: true },
        { k: "Share of sponsorship budget", v: (share * 100).toFixed(1) + "%", s: `Year one vs ${fmtM(budget, 0)} plan` },
      ]} /></div>
      <div className="overflow-x-auto px-5 pb-5">
        <table className="w-full min-w-[520px] text-sm tabular-nums">
          <thead className="text-xs font-medium text-muted">
            <tr className="border-b border-line text-right">
              <th className="py-2 text-left">Year</th><th className="py-2">Fee</th><th className="py-2">Delivery cost</th><th className="py-2">Net</th><th className="py-2">Today's dollars</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line font-mono">
            {rows.map((r) => (
              <tr key={r.y} className="text-right">
                <td className="py-2 text-left font-sans text-ink">{r.y}</td>
                <td className="py-2 text-ink">{fmtM(r.f, 2)}</td>
                <td className="py-2 text-muted">−{fmtM(r.c, 2)}</td>
                <td className="py-2 text-ink">{fmtM(r.net, 2)}</td>
                <td className="py-2 text-ink">{fmtM(r.pv, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[13px] text-muted">Delivery cost covers signage, hospitality and activation. Fees are assumed to be paid once a year. A longer term or higher increase raises the headline value; the discount rate shows what that value is worth today.</p>
      </div>
    </Card>
  );
}

export default function Tools() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Decision tools" description="Quick models for testing new partnerships and events. Each one runs off the Base case and its own inputs." />
      <SponsorshipTool />
      <Events bare />
    </div>
  );
}
