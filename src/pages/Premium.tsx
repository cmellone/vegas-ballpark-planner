import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CHART, ChartTooltip, PageHeader, Pill, TierBadge } from "../components/ui";
import { fmtInt, fmtM, type Tier } from "../model";
import { useStore } from "../store";

export default function Premium({ bare }: { bare?: boolean }) {
  const { inputs: x, result: r } = useStore();
  const products: { name: string; seats: number; price: string; sold: number; rev: number; psl: number | null; status: [string, "good" | "gold" | "neutral"]; tier: Tier }[] = [
    { name: "Athletic Club", seats: x.acs, price: `$${fmtInt(x.acp)} / season`, sold: x.acsold, rev: r.acRev, psl: x.acs * x.acsold * x.psla, status: ["Sold out", "good"], tier: "D" },
    { name: "Diamond Club", seats: x.dcs, price: `$${fmtInt(x.dcp)} / season`, sold: x.dcsold, rev: r.dcRev, psl: x.dcs * x.dcsold * x.psld, status: ["Limited", "gold"], tier: "E" },
    { name: "Other premium (Dugout Clubs, Legends Lounge, club seats)", seats: x.ops, price: `$${fmtInt(x.opp)} / game`, sold: x.opsold, rev: r.opRev, psl: null, status: ["On sale", "neutral"], tier: "E" },
    { name: "Suites", seats: x.st * x.scap, price: `$${fmtInt(x.sp)} / season`, sold: 1, rev: r.suites, psl: null, status: ["First set sold", "good"], tier: "E" },
  ];
  const chart = products.map((p) => ({ name: p.name.split(" (")[0], rev: p.rev }));
  const premTotal = r.clubs + r.suites;
  return (
    <div className="grid gap-6">
      <PageHeader small={bare} id={bare ? "sec-premium" : undefined}
        title="Premium seating"
        description="About one in five seats carries a seat license, the highest premium share in MLB according to local reporting. The two clubs behind home plate are priced and largely sold, which makes this the best-documented part of the model."
      />
      <Card className="overflow-hidden">
        <CardHeader title="Premium inventory" subtitle="Current scenario" action={<span className="font-mono text-sm text-ink">{fmtM(premTotal)}</span>} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm tabular-nums">
            <thead className="bg-page text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-3">Product</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Seats</th>
                <th className="px-5 py-3 text-right">Price</th><th className="px-5 py-3 text-right">Sold</th>
                <th className="px-5 py-3 text-right">Annual revenue</th><th className="px-5 py-3 text-right">Seat licenses</th><th className="px-5 py-3">Basis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => (
                <tr key={p.name} className="hover:bg-green-50/60">
                  <td className="px-5 py-3.5 font-medium text-ink">{p.name}</td>
                  <td className="px-5 py-3.5"><Pill tone={p.status[1]}>{p.status[0]}</Pill></td>
                  <td className="px-5 py-3.5 text-right font-mono">{fmtInt(p.seats)}</td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-right font-mono text-muted">{p.price}</td>
                  <td className="px-5 py-3.5 text-right font-mono">{(p.sold * 100).toFixed(0)}%</td>
                  <td className="px-5 py-3.5 text-right font-mono text-ink">{fmtM(p.rev)}</td>
                  <td className="px-5 py-3.5 text-right font-mono text-muted">{p.psl == null ? "Not disclosed" : fmtM(p.psl)}</td>
                  <td className="px-5 py-3.5"><TierBadge tier={p.tier} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {!bare && <Card>
          <CardHeader title="Annual premium revenue by product" subtitle="$ millions" />
          <div className="h-[260px] px-2 py-4">
            <ResponsiveContainer>
              <BarChart data={chart} margin={{ left: 0, right: 12, top: 20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid vertical={false} stroke={CHART.grid} />
                <XAxis dataKey="name" tick={{ fill: "#13211E", fontSize: 12 }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tickFormatter={(v) => (v / 1e6).toFixed(0)} tick={{ fill: CHART.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip cursor={{ fill: "#F1F4F1" }} content={<ChartTooltip formatter={(v: number) => fmtM(v)} />} />
                <Bar dataKey="rev" name="Revenue" fill={CHART.gold} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="rev" position="top" formatter={(v: number) => (v / 1e6).toFixed(1)} style={{ fill: "#13211E", fontSize: 12, fontFamily: "Geist Mono Variable" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>}
        <Card className={bare ? "lg:col-span-2" : undefined}>
          <CardHeader title="Seat licenses: funding, not revenue" />
          <div className="grid gap-3 p-5 text-sm text-ink">
            <p>Disclosed seat licenses on the two clubs total <b className="font-mono font-semibold">{fmtM(r.psl)}</b>. They're collected once and typically go toward construction. For reporting they're usually recognized over the life of the license, not in the opening season.</p>
            <p className="text-muted">The model keeps them out of operating revenue. License prices on the other ~5,000 premium seats aren't public, so they're left out rather than guessed.</p>
            <p className="text-muted">Concentration to watch: {((premTotal / r.total) * 100).toFixed(0)}% of revenue comes from about {fmtInt(r.prem + r.suiteFans)} guests a game. That's a strength while demand is strong and a renewal risk from season two.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
