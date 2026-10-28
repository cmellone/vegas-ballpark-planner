import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleCheck, CircleAlert, DollarSign, Gem, Users, Landmark } from "lucide-react";
import { Card, CardHeader, CHART, ChartTooltip, PageHeader, Pill, Stat } from "../components/ui";
import { fmtInt, fmtM, SCENARIOS, STREAMS } from "../model";
import { useStore } from "../store";

export default function Overview() {
  const { result: r, all, scenario } = useStore();
  const label = SCENARIOS.find((s) => s.id === scenario)!.label;

  const mix = STREAMS.map((s) => ({ name: s.short, value: r[s.key] as number })).sort((a, b) => b.value - a.value);
  const scen = SCENARIOS.map((s) => {
    const x = all[s.id];
    return {
      name: s.label,
      Tickets: x.tickets,
      Premium: x.clubs + x.suites,
      Sponsorship: x.spons,
      "F&B, merch, parking & events": x.fb + x.merch + x.parking + x.events,
      total: x.total,
    };
  });

  const ratio = r.perFan / r.brvPerFan;
  const checks = [
    { ok: ratio <= 1.05, text: `Revenue per fan is ${(ratio * 100).toFixed(0)}% of the Braves' $${r.brvPerFan.toFixed(0)}. The Braves are the only MLB club that publishes game-day financials.` },
    { ok: r.occ <= 0.95, text: `The average crowd fills ${(r.occ * 100).toFixed(0)}% of capacity. MLB averaged 29,471 a game in 2025.` },
    { ok: Math.abs(r.spons - 68e6) / 68e6 < 0.3, text: `Sponsorship of ${fmtM(r.spons)} is within range of the 2025 MLB club average of about $68M.` },
    { ok: r.gaPrice <= 45, text: `The blended general ticket of $${r.gaPrice.toFixed(0)} is within the range of current MLB team averages.` },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Ballpark plan"
        description="The long-range plan for the first season in the new ballpark: ballpark and commercial revenue by stream, scenario and risk. National media and MLB revenue sharing are out of scope. Every figure flows from the Model tab and sets the budget on Budget & reporting."
      >
        <Pill tone="gold">{label} case · 2028</Pill>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Opening-season revenue" value={fmtM(r.total)} icon={<DollarSign size={16} />} accent
          sub={<>Range {fmtM(all.c.total, 0)} to {fmtM(all.u.total, 0)}</>} />
        <Stat label="Revenue per fan" value={"$" + r.perFan.toFixed(0)} icon={<Users size={16} />}
          sub={<>Braves benchmark ${r.brvPerFan.toFixed(0)}</>} />
        <Stat label="Premium share of revenue" value={(r.premShare * 100).toFixed(0) + "%"} icon={<Gem size={16} />}
          sub={<>From {fmtInt(r.prem + r.suiteFans)} premium guests a game</>} />
        <Stat label="Seat license funding" value={fmtM(r.psl)} icon={<Landmark size={16} />}
          sub="One-time, kept out of revenue" />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader title="Revenue by stream" subtitle={`${label} case, $ millions`} />
          <div className="h-[340px] px-2 py-4">
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
          <CardHeader title="Model checks" subtitle="Tested live against public benchmarks" />
          <ul className="grid gap-4 p-5">
            {checks.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink">
                {c.ok ? <CircleCheck size={18} className="mt-0.5 shrink-0 text-green-700" /> : <CircleAlert size={18} className="mt-0.5 shrink-0 text-rust-600" />}
                <span>{!c.ok && <b className="font-medium text-rust-600">Review: </b>}{c.text}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Scenario comparison" subtitle="Opening-season revenue by scenario, $ millions" />
        <div className="h-[320px] px-2 py-4">
          <ResponsiveContainer>
            <BarChart data={scen} margin={{ left: 8, right: 16, top: 20, bottom: 4 }} barCategoryGap="28%">
              <CartesianGrid vertical={false} stroke={CHART.grid} />
              <XAxis dataKey="name" tick={{ fill: "#13211E", fontSize: 13 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => (v / 1e6).toFixed(0)} tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip cursor={{ fill: "#F1F4F1" }} content={<ChartTooltip formatter={(v: number) => fmtM(v)} />} />
              <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 12, color: CHART.axis }} />
              <Bar dataKey="Tickets" stackId="a" fill={CHART.green} />
              <Bar dataKey="Premium" stackId="a" fill={CHART.gold} />
              <Bar dataKey="Sponsorship" stackId="a" fill={CHART.greenLight} />
              <Bar dataKey="F&B, merch, parking & events" stackId="a" fill={CHART.slate} radius={[4, 4, 0, 0]}>
                <LabelList dataKey="total" position="top" formatter={(v: number) => fmtM(v, 0)} style={{ fill: "#13211E", fontSize: 12, fontFamily: "Geist Mono Variable" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
