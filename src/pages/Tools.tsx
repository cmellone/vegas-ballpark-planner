import { useState } from "react";
import { Card, CardHeader, PageHeader } from "../components/ui";
import { compute, fmtM, pick } from "../model";
import { useStore } from "../store";
import Events from "./Events";

function Field({ id, label, value, onChange, step, hint }: { id: string; label: string; value: number; onChange: (n: number) => void; step: number; hint?: string }) {
  return (
    <label htmlFor={id} className="grid gap-1.5 text-[13px] font-medium text-muted">
      {label}
      <input id={id} type="number" inputMode="decimal" step={step} value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="rounded-md border border-line bg-white px-3 py-2 font-mono text-[15px] text-ink shadow-card outline-none focus:border-green-700 focus:ring-2 focus:ring-green-700/15" />
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

function PaybackTool() {
  const { values } = useStore();
  const x = pick(values, "b"), r = compute(x);
  const [seats, setSeats] = useState(500);
  const [price, setPrice] = useState(150);
  const [sold, setSold] = useState(85);
  const [capex, setCapex] = useState(6);
  const occ = r.gaFans / Math.max(1, x.cap - x.acs - x.dcs - x.ops - x.st * x.scap);
  const gain = n(seats) * (n(sold) / 100) * n(price) * x.g;
  const lost = n(seats) * Math.min(1, occ) * x.g * (r.gaPrice + x.fb * x.comm);
  const net = gain - lost;
  const payback = net > 0 ? (n(capex) * 1e6) / net : Infinity;
  return (
    <Card>
      <CardHeader title="Premium conversion payback" subtitle="Converting general seats into a new premium product, Base case" />
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="c-seats" label="Seats converted" value={seats} step={50} onChange={setSeats} />
        <Field id="c-price" label="New price per game ($)" value={price} step={10} onChange={setPrice} />
        <Field id="c-sold" label="Sell-through (%)" value={sold} step={5} onChange={setSold} />
        <Field id="c-capex" label="Build cost ($M)" value={capex} step={0.5} onChange={setCapex} />
      </div>
      <div className="mx-5 mb-5"><Result items={[
        { k: "New premium revenue", v: fmtM(gain, 2), s: "per season" },
        { k: "General revenue given up", v: "−" + fmtM(lost, 2), s: `At ${(Math.min(1, occ) * 100).toFixed(0)}% general seating occupancy` },
        { k: "Revenue payback", v: Number.isFinite(payback) ? payback.toFixed(1) + " yrs" : "No payback", gold: true, s: `${fmtM(net, 2)} net a season` },
      ]} /></div>
      <p className="px-5 pb-5 text-[13px] text-muted">Revenue payback before the cost of running the product. A full decision would add hospitality costs and the renewal risk on premium contracts.</p>
    </Card>
  );
}

export default function Tools() {
  return (
    <div className="grid gap-6">
      <PageHeader title="Decision tools" description="Quick models for testing capital projects and new events. Each one runs off the Base case and its own inputs." />
      <PaybackTool />
      <Events bare />
    </div>
  );
}
