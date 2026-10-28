import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleAlert, CircleCheck, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardHeader, CHART, ChartTooltip, PageHeader, Pill } from "../components/ui";
import { fmtInt, fmtM, pick } from "../model";
import { buildReport, MONTHS, SEASON_MONTHS } from "../reporting";
import { useStore } from "../store";

const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0);
function Var({ a, b, pctOnly }: { a: number; b: number; pctOnly?: boolean }) {
  const d = a - b;
  if (Math.abs(d) < 5e3) return <span className="font-mono text-muted">—</span>;
  const tone = Math.abs(d) < 5e3 ? "text-muted" : d > 0 ? "text-green-700" : "text-rust-600";
  return <span className={clsx("font-mono", tone)}>{pctOnly ? `${pct(a, b) >= 0 ? "+" : ""}${pct(a, b).toFixed(1)}%` : `${d >= 0 ? "+" : "−"}$${(Math.abs(d) / 1e6).toFixed(2)}M`}</span>;
}

export default function Reporting() {
  const { values } = useStore();
  const [month, setMonth] = useState(5);
  const base = pick(values, "b");
  const rep = useMemo(() => buildReport(base, month), [values, month]); // eslint-disable-line
  const { totals: t, variance: v, sim } = rep;
  const mName = MONTHS[month] === "Jun" ? "June" : { Mar: "March", Apr: "April", May: "May", Jul: "July", Aug: "August", Sep: "September" }[MONTHS[month]];

  const planAtt = base.att, actAtt = base.att * sim.att;
  const notes: string[] = [];
  const tixNet = v.ticketVol + v.ticketRate;
  notes.push(`Ticketing ${tixNet >= 0 ? "beat" : "missed"} budget by ${fmtM(Math.abs(tixNet), 2)}. Attendance averaged ${fmtInt(actAtt)} against a plan of ${fmtInt(planAtt)} (${pct(actAtt, planAtt) >= 0 ? "+" : ""}${pct(actAtt, planAtt).toFixed(0)}%), a volume effect of ${fmtM(v.ticketVol, 2)}. Tourists made up ${(sim.tour * 100).toFixed(0)}% of the crowd against 30% planned, a price and mix effect of ${fmtM(v.ticketRate, 2)}.`);
  notes.push(`Food & beverage per-fan spend ran ${pct(sim.fb, 1) >= 0 ? "+" : ""}${pct(sim.fb, 1).toFixed(0)}% against plan (rate effect ${fmtM(v.fbRate, 2)}), against a volume effect of ${fmtM(v.fbVol, 2)} from attendance.`);
  notes.push(`Retail: volume ${fmtM(v.merchVol, 2)}, spend per fan ${fmtM(v.merchRate, 2)}.`);
  notes.push(`Premium, suites and partnerships are recognized from contracted season and sponsorship agreements, so they track budget exactly.`);

  const kpis: { label: string; plan: string; act: string; ok: boolean }[] = [
    { label: "Attendance per game", plan: fmtInt(planAtt), act: fmtInt(actAtt), ok: actAtt >= planAtt * 0.97 },
    { label: "Tourist share", plan: "30%", act: (sim.tour * 100).toFixed(0) + "%", ok: sim.tour >= 0.28 },
    { label: "Blended general ticket", plan: "$" + rep.rb.gaPrice.toFixed(2), act: "$" + rep.raM.gaPrice.toFixed(2), ok: rep.raM.gaPrice >= rep.rb.gaPrice * 0.98 },
    { label: "F&B per general fan", plan: "$" + base.fb.toFixed(2), act: "$" + (base.fb * sim.fb).toFixed(2), ok: sim.fb >= 1 },
    { label: "Merchandise per fan", plan: "$" + base.mer.toFixed(2), act: "$" + (base.mer * sim.mer).toFixed(2), ok: sim.mer >= 0.97 },
    { label: "Premium sell-through", plan: "On contract", act: "On contract", ok: true },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Budget & reporting"
        description="The FY2028 revenue budget comes straight from the Base case, phased across an 81-game schedule and owned by department. The monthly report compares a simulated season to that budget and explains each variance by price and volume."
      >
        <Pill tone="neutral">Revenue only · actuals simulated for illustration</Pill>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[13px] font-medium text-muted">Report month</span>
        {SEASON_MONTHS.map((m) => (
          <button key={m} type="button" aria-pressed={m === month} onClick={() => setMonth(m)}
            className={clsx("rounded-md border px-3 py-1.5 text-[13px] font-medium", m === month ? "border-green-900 bg-green-900 text-white" : "border-line bg-white text-muted hover:text-ink")}>
            {MONTHS[m]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { l: `${mName} revenue`, a: t.mActual, b: t.mBudget },
          { l: "Year to date", a: t.ytdActual, b: t.ytdBudget },
          { l: "Full-year forecast", a: t.fyForecast, b: t.fyBudget },
        ].map((k) => (
          <Card key={k.l} className="p-5">
            <div className="text-[13px] font-medium text-muted">{k.l}</div>
            <div className="mt-3 font-mono text-[28px] font-semibold tracking-tight text-ink">{fmtM(k.a)}</div>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-muted">
              {k.a >= k.b ? <TrendingUp size={14} className="text-green-700" /> : <TrendingDown size={14} className="text-rust-600" />}
              <Var a={k.a} b={k.b} /> vs budget {fmtM(k.b)}
            </div>
          </Card>
        ))}
        <Card className="p-5">
          <div className="text-[13px] font-medium text-muted">Attendance vs plan</div>
          <div className="mt-3 font-mono text-[28px] font-semibold tracking-tight text-ink">{pct(actAtt, planAtt) >= 0 ? "+" : ""}{pct(actAtt, planAtt).toFixed(0)}%</div>
          <div className="mt-1 text-[13px] text-muted">{fmtInt(actAtt)} a game in {mName}</div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title={`Monthly ownership report · ${mName} 2028`} subtitle="Revenue by department, $ millions. Budget is the Base case; actuals are simulated." />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm tabular-nums">
            <thead className="bg-page text-xs font-medium text-muted">
              <tr className="text-left">
                <th className="px-5 py-2.5" rowSpan={2}>Department</th>
                <th className="border-l border-line px-4 py-2.5 text-center" colSpan={3}>{mName}</th>
                <th className="border-l border-line px-4 py-2.5 text-center" colSpan={3}>Year to date</th>
                <th className="border-l border-line px-4 py-2.5 text-center" colSpan={3}>Full year</th>
              </tr>
              <tr className="text-right">
                {["Budget", "Actual", "Var", "Budget", "Actual", "Var", "Budget", "Forecast", "Var"].map((h, i) => (
                  <th key={i} className={clsx("px-4 py-2", i % 3 === 0 && "border-l border-line")}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rep.lines.map((l) => (
                <tr key={l.dept.id} className="hover:bg-green-50/60">
                  <td className="px-5 py-3"><div className="font-medium text-ink">{l.dept.name}</div><div className="text-xs text-muted">{l.dept.owner}</div></td>
                  <td className="border-l border-line px-4 py-3 text-right font-mono text-muted">{(l.mBudget / 1e6).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-ink">{(l.mActual / 1e6).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right"><Var a={l.mActual} b={l.mBudget} /></td>
                  <td className="border-l border-line px-4 py-3 text-right font-mono text-muted">{(l.ytdBudget / 1e6).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-ink">{(l.ytdActual / 1e6).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right"><Var a={l.ytdActual} b={l.ytdBudget} /></td>
                  <td className="border-l border-line px-4 py-3 text-right font-mono text-muted">{(l.fyBudget / 1e6).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right font-mono text-ink">{(l.fyForecast / 1e6).toFixed(2)}</td>
                  <td className="px-4 py-3 text-right"><Var a={l.fyForecast} b={l.fyBudget} /></td>
                </tr>
              ))}
              <tr className="bg-page font-semibold text-ink">
                <td className="px-5 py-3">Total revenue</td>
                <td className="border-l border-line px-4 py-3 text-right font-mono">{(t.mBudget / 1e6).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">{(t.mActual / 1e6).toFixed(2)}</td>
                <td className="px-4 py-3 text-right"><Var a={t.mActual} b={t.mBudget} /></td>
                <td className="border-l border-line px-4 py-3 text-right font-mono">{(t.ytdBudget / 1e6).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">{(t.ytdActual / 1e6).toFixed(2)}</td>
                <td className="px-4 py-3 text-right"><Var a={t.ytdActual} b={t.ytdBudget} /></td>
                <td className="border-l border-line px-4 py-3 text-right font-mono">{(t.fyBudget / 1e6).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">{(t.fyForecast / 1e6).toFixed(2)}</td>
                <td className="px-4 py-3 text-right"><Var a={t.fyForecast} b={t.fyBudget} /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-2 border-t border-line px-5 py-3 text-[13px] text-muted">
          {rep.checks.every((c) => c.ok)
            ? <><CircleCheck size={15} className="shrink-0 text-green-700" />Ties to the revenue plan: budget, departments and forecast all reconcile.</>
            : <><CircleAlert size={15} className="shrink-0 text-rust-600" />Check: these figures no longer reconcile to the revenue plan.</>}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Variance commentary" subtitle={`What drove ${mName}, split into price and volume`} />
          <ul className="grid gap-3 p-5 text-sm text-ink">
            {notes.map((n, i) => <li key={i} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />{n}</li>)}
          </ul>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader title="KPI scorecard" subtitle={`${mName}, actual vs plan`} />
          <table className="w-full text-sm tabular-nums">
            <tbody className="divide-y divide-line">
              {kpis.map((k) => (
                <tr key={k.label}>
                  <td className="px-5 py-2.5 text-ink">{k.label}</td>
                  <td className="px-2 py-2.5 text-right font-mono text-muted">{k.plan}</td>
                  <td className="px-2 py-2.5 text-right font-mono text-ink">{k.act}</td>
                  <td className="px-5 py-2.5 text-right"><Pill tone={k.ok ? "good" : "warn"}>{k.ok ? "On track" : "Watch"}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <CardHeader title="FY2028 revenue by month" subtitle="Actual through the report month, budget for the rest of the year, $ millions" />
        <div className="h-[300px] px-2 py-4">
          <ResponsiveContainer>
            <ComposedChart data={rep.monthly} margin={{ left: 8, right: 16, top: 8, bottom: 0 }} barCategoryGap="22%">
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="name" tick={{ fill: "#13211E", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(x) => (x / 1e6).toFixed(0)} tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip cursor={{ fill: "#F1F4F1" }} content={<ChartTooltip formatter={(x: number) => fmtM(x)} />} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, color: CHART.axis }} />
              <Bar dataKey="actual" name="Actual" stackId="m" fill={CHART.green} radius={[3, 3, 0, 0]} />
              <Bar dataKey="forecast" name="Forecast (at budget)" stackId="m" fill={CHART.greenLight} radius={[3, 3, 0, 0]} />
              <Line dataKey="budget" name="Budget" type="linear" stroke={CHART.gold} strokeWidth={2} dot={{ r: 3, fill: CHART.gold }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
