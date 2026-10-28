import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DollarSign, Gem, Users } from "lucide-react";
import { Card, CardHeader, CHART, ChartTooltip, PageHeader, Pill, Stat } from "../components/ui";
import { compute, fmtM, SCENARIOS, STREAMS } from "../model";
import { useStore } from "../store";

export default function Plan() {
  const { result: r, all, scenario, inputs: x } = useStore();
  const label = SCENARIOS.find((s) => s.id === scenario)!.label;
  const mix = STREAMS.map((s) => ({ name: s.short, value: r[s.key] as number })).sort((a, b) => b.value - a.value);

  const guestShare = (r.prem + r.suiteFans) / r.att;
  const per1k = compute({ ...x, att: x.att + 1000 }).total - r.total;
  const contracted = (r.clubs + r.suites + r.spons) / r.total;

  const takeaways = [
    { h: "Premium is the engine", t: `Premium seats and suites bring in ${(r.premShare * 100).toFixed(0)}% of revenue from ${(guestShare * 100).toFixed(0)}% of the crowd, and the top clubs are already largely sold.` },
    { h: "Attendance is the biggest open risk", t: `Every 1,000 fans a game is worth about ${fmtM(per1k)} a season. Part of that crowd depends on visitors, and Las Vegas visitation fell 7.5% in 2025.` },
    { h: "Most revenue is set before Opening Day", t: `About ${(contracted * 100).toFixed(0)}% of revenue comes from premium seats, suites and sponsorship, sold on season or multi-year contracts. That makes the plan more predictable than the attendance swings suggest.` },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Ballpark plan"
        description="Opening-season revenue for the new Las Vegas ballpark, built from public information. This plan sets the budget on the next tab; every input and source is on the Model tab."
      >
        <Pill tone="gold">{label} case · 2028</Pill>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Opening-season revenue" value={fmtM(r.total)} icon={<DollarSign size={16} />} accent
          sub={<>Range {fmtM(all.c.total, 0)} to {fmtM(all.u.total, 0)} across scenarios</>} />
        <Stat label="Revenue per fan" value={"$" + r.perFan.toFixed(0)} icon={<Users size={16} />}
          sub={<>MLB benchmark ${r.brvPerFan.toFixed(0)} (Atlanta Braves, 2025)</>} />
        <Stat label="Premium share of revenue" value={(r.premShare * 100).toFixed(0) + "%"} icon={<Gem size={16} />}
          sub="Club seats and suites" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Revenue by stream" subtitle={`${label} case, $ millions`} />
          <div className="h-[330px] px-2 py-4">
            <ResponsiveContainer>
              <BarChart data={mix} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }} barCategoryGap={8}>
                <CartesianGrid horizontal={false} stroke={CHART.grid} />
                <XAxis type="number" tickFormatter={(v) => (v / 1e6).toFixed(0)} tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={92} tick={{ fill: "#13211E", fontSize: 13 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#F1F4F1" }} content={<ChartTooltip formatter={(v: number) => fmtM(v)} />} />
                <Bar dataKey="value" name="Revenue" radius={[0, 4, 4, 0]}>
                  {mix.map((m, i) => <Cell key={m.name} fill={i < 3 ? CHART.green : CHART.greenLight} />)}
                  <LabelList dataKey="value" position="right" formatter={(v: number) => (v / 1e6).toFixed(1)} style={{ fill: "#13211E", fontSize: 12, fontFamily: "Geist Mono Variable" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="What it means" />
          <ul className="grid gap-5 p-5">
            {takeaways.map((k) => (
              <li key={k.h} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" />
                <div>
                  <div className="text-sm font-semibold text-ink">{k.h}</div>
                  <p className="mt-0.5 text-sm text-muted">{k.t}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
