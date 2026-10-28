import { Bar, BarChart, CartesianGrid, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CHART, ChartTooltip, PageHeader } from "../components/ui";
import { compute, fmtInt, fmtM, pick, SENS } from "../model";
import { useStore } from "../store";

export default function Risk({ bare }: { bare?: boolean }) {
  const { values, scenario, inputs: x, result: r } = useStore();
  const base = compute(pick(values, "b")).total;
  const sens = SENS.map(([id, label]) => {
    const lo = compute(pick(values, "b", { [id]: values[id].c })).total - base;
    const hi = compute(pick(values, "b", { [id]: values[id].u })).total - base;
    return { label, down: Math.min(lo, hi, 0), up: Math.max(lo, hi, 0) };
  }).sort((a, b) => b.up - b.down - (a.up - a.down));
  const ext = Math.ceil(Math.max(...sens.map((d) => Math.max(-d.down, d.up))) / 5e6) * 5e6;
  const ticks = Array.from({ length: (2 * ext) / 5e6 + 1 }, (_, i) => -ext + i * 5e6);

  const ramp = [["2028", 1], ["2029", x.h2], ["2030", x.h3], ["2031", x.h4]].map(([y, i]) => ({ year: y as string, total: compute(x, i as number).total }));
  const tourLow = compute(pick(values, scenario, { tour: values.tour.c })).total - r.total;
  const perGame = r.att * x.tour;

  return (
    <div className="grid gap-6">
      <PageHeader small={bare} id={bare ? "sec-risk" : undefined} title="Risk & ramp" description="Which assumptions move the number most, and how revenue settles once the new-ballpark effect fades." />
      <Card>
        <CardHeader title="Sensitivity to each input" subtitle={`Change from the base case of ${fmtM(base)} when one input moves to its conservative or upside value, $ millions`} />
        <div className="h-[470px] px-2 py-4">
          <ResponsiveContainer>
            <BarChart data={sens} layout="vertical" stackOffset="sign" margin={{ left: 8, right: 40, top: 4, bottom: 4 }} barCategoryGap={6}>
              <CartesianGrid horizontal={false} stroke={CHART.grid} />
              <XAxis type="number" domain={[-ext, ext]} ticks={ticks} tickFormatter={(v) => (v > 0 ? "+" : "") + (v / 1e6).toFixed(0)} tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" width={142} tick={{ fill: "#13211E", fontSize: 13 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: "#F1F4F1" }} content={<ChartTooltip formatter={(v: number) => (v >= 0 ? "+" : "") + fmtM(v)} />} />
              <ReferenceLine x={0} stroke="#13211E" strokeWidth={1} />
              <Bar dataKey="down" name="Downside" stackId="s" fill={CHART.rust} radius={[4, 0, 0, 4]}>
                <LabelList dataKey="down" position="insideLeft" formatter={(v: number) => (v <= -1.5e6 ? (v / 1e6).toFixed(0) : "")} style={{ fill: "#FFFFFF", fontSize: 11, fontFamily: "Geist Mono Variable" }} />
              </Bar>
              <Bar dataKey="up" name="Upside" stackId="s" fill={CHART.green} radius={[0, 4, 4, 0]}>
                <LabelList dataKey="up" position="insideRight" formatter={(v: number) => (v >= 1.5e6 ? "+" + (v / 1e6).toFixed(0) : "")} style={{ fill: "#FFFFFF", fontSize: 11, fontFamily: "Geist Mono Variable" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Four-season ramp" subtitle="Current scenario, constant 2028 dollars, $ millions" />
          <div className="h-[260px] px-2 py-4">
            <ResponsiveContainer>
              <BarChart data={ramp} margin={{ left: 0, right: 12, top: 22, bottom: 0 }} barCategoryGap="32%">
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="year" tick={{ fill: "#13211E", fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => (v / 1e6).toFixed(0)} tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip cursor={{ fill: "#F1F4F1" }} content={<ChartTooltip formatter={(v: number) => fmtM(v)} />} />
                <Bar dataKey="total" name="Revenue" radius={[4, 4, 0, 0]}>
                  {ramp.map((d, i) => <Cell key={d.year} fill={i === 0 ? CHART.gold : CHART.green} />)}
                  <LabelList dataKey="total" position="top" formatter={(v: number) => (v / 1e6).toFixed(0)} style={{ fill: "#13211E", fontSize: 12, fontFamily: "Geist Mono Variable" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="px-5 pb-5 text-[13px] text-muted">Attendance follows the average path of new MLB ballparks since 1991 (100, 91, 87, 87). Premium seats and sponsorship hold on multi-year contracts.</p>
        </Card>
        <Card>
          <CardHeader title="The tourism assumption" subtitle="The input most exposed to the wider Las Vegas economy" />
          <div className="grid gap-3 p-5 text-sm text-ink">
            <p>At {(x.tour * 100).toFixed(0)}%, the model needs about <b className="font-mono font-semibold">{fmtInt(perGame)}</b> visitors at every game, or about {fmtInt(r.tourFans)} a season. That's {(r.tourFans / 38.5e6 * 100).toFixed(1)}% of the 38.5 million people who visited Las Vegas in 2025, a year when visitation fell 7.5%.</p>
            <p>Dropping to {(values.tour.c * 100).toFixed(0)}% changes revenue by <b className="font-mono font-semibold">{fmtM(tourLow)}</b>, because visitors buy single games at higher prices.</p>
            <p className="text-muted">Two things cushion it. About three quarters of premium buyers so far are local, and hotel ticket packages, like the one Circa announced as the club's first founding partner, can turn visitor demand into dependable volume.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
