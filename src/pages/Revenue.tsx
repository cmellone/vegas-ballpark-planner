import { Card, CardHeader, PageHeader, TierBadge } from "../components/ui";
import { DEFS, fmtM, STREAMS, tierOf } from "../model";
import { useStore } from "../store";

export default function Revenue() {
  const { result: r, all } = useStore();
  const rows = STREAMS.slice().sort((a, b) => (r[b.key] as number) - (r[a.key] as number));
  return (
    <div className="grid gap-6">
      <PageHeader
        title="Revenue streams"
        description="How each line is built and how solid its inputs are. Disclosed means stated by the club, Benchmarked means set from other MLB clubs or Las Vegas venues, and Estimated means a judgment kept inside a benchmark range."
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm tabular-nums">
            <thead className="bg-page text-left text-xs font-medium text-muted">
              <tr>
                <th className="px-5 py-3">Stream</th>
                <th className="px-5 py-3">How it's built</th>
                <th className="px-5 py-3">Key inputs</th>
                <th className="px-5 py-3">Basis</th>
                <th className="px-5 py-3 text-right">Conservative</th>
                <th className="px-5 py-3 text-right">Base</th>
                <th className="px-5 py-3 text-right">Upside</th>
                <th className="px-5 py-3 text-right">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((s) => {
                const v = r[s.key] as number;
                return (
                  <tr key={s.key} className="align-top hover:bg-green-50/60">
                    <td className="px-5 py-3.5 font-medium text-ink">{s.name}</td>
                    <td className="px-5 py-3.5 text-muted">{s.how}</td>
                    <td className="px-5 py-3.5 text-muted">{s.inputs.map((i) => DEFS[i].label).join(", ")}</td>
                    <td className="px-5 py-3.5"><TierBadge tier={tierOf(s.inputs)} /></td>
                    <td className="px-5 py-3.5 text-right font-mono text-muted">{fmtM(all.c[s.key] as number)}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-muted">{fmtM(all.b[s.key] as number)}</td>
                    <td className="px-5 py-3.5 text-right font-mono text-muted">{fmtM(all.u[s.key] as number)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-page"><div className="h-full rounded-full bg-green-700" style={{ width: `${(v / r.total) * 100}%` }} /></div>
                        <span className="w-9 font-mono text-ink">{((v / r.total) * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-page font-semibold text-ink">
                <td className="px-5 py-3.5">Total</td><td colSpan={3} />
                <td className="px-5 py-3.5 text-right font-mono">{fmtM(all.c.total)}</td>
                <td className="px-5 py-3.5 text-right font-mono">{fmtM(all.b.total)}</td>
                <td className="px-5 py-3.5 text-right font-mono">{fmtM(all.u.total)}</td>
                <td className="px-5 py-3.5 text-right font-mono">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Ticket pricing" subtitle="General seating, current scenario" />
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-5 text-sm">
            <div><dt className="text-muted">General seating fans a game</dt><dd className="mt-1 font-mono text-lg text-ink">{Math.round(r.gaFans).toLocaleString("en-US")}</dd></div>
            <div><dt className="text-muted">Blended ticket price</dt><dd className="mt-1 font-mono text-lg text-ink">${r.gaPrice.toFixed(2)}</dd></div>
            <div className="col-span-2 text-muted">The club floated a general reserved season seat at about $22 a game. Mid-market MLB teams average about $30–40 a ticket. Tourists buy single games at higher prices, which is why the tourist share moves this line.</div>
          </dl>
        </Card>
        <Card>
          <CardHeader title="What's left out" subtitle="By design" />
          <ul className="grid list-disc gap-2 py-5 pl-10 pr-5 text-sm text-muted">
            <li>National media, local broadcast and MLB revenue sharing</li>
            <li>Operating costs, which aren't public enough to model credibly</li>
            <li>Seat license fees, which are one-time and shown separately</li>
            <li>Postseason games and development around the site</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
