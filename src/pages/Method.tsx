import { ExternalLink } from "lucide-react";
import { Card, CardHeader, PageHeader, TierBadge } from "../components/ui";
import { SOURCE_ORDER, SOURCES } from "../model";

export default function Method({ bare }: { bare?: boolean }) {
  return (
    <div className="grid gap-6">
      <PageHeader small={bare} title="Methodology & sources" description="How the planner is built, what it leaves out, and where every number comes from." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Approach" />
          <ul className="grid gap-3 p-5 text-sm text-ink">
            <li>A driver-based model of the ballpark's opening season, built from the outside in using public information.</li>
            <li className="flex flex-wrap items-center gap-1.5">Every input is tagged <TierBadge tier="D" /> stated by the club or Stadium Authority, <TierBadge tier="B" /> set from other MLB clubs or Las Vegas venues, or <TierBadge tier="E" /> a judgment kept inside a benchmark range.</li>
            <li>Three scenarios bracket the uncertainty, and the sensitivity view shows which inputs matter most.</li>
            <li>Revenue only. Operating costs aren't public enough to model credibly.</li>
            <li>Seat license fees are one-time and typically fund construction, so they sit outside operating revenue.</li>
          </ul>
        </Card>
        <Card>
          <CardHeader title="Out of scope" />
          <ul className="grid list-disc gap-2 py-5 pl-10 pr-5 text-sm text-ink">
            <li>National media, local broadcast and MLB revenue sharing</li>
            <li>Player payroll and baseball operations</li>
            <li>Stadium financing and public funding terms</li>
            <li>Development around the site</li>
            <li>Postseason games</li>
          </ul>
          <p className="px-5 pb-5 text-sm text-muted">The club's actual figures will differ. The point is the structure: which drivers matter, how they connect, and where the risk sits.</p>
        </Card>
      </div>
      <Card>
        <CardHeader title="Sources" subtitle="Numbered as cited on the Model page" />
        <ol className="grid gap-2.5 p-5 text-sm">
          {SOURCE_ORDER.map((k, i) => (
            <li key={k} className="flex gap-3">
              <span className="w-6 shrink-0 text-right font-mono text-muted">{i + 1}</span>
              <a href={SOURCES[k].url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-1.5 text-green-800 hover:underline">
                {SOURCES[k].title}<ExternalLink size={13} className="mt-1 shrink-0 opacity-60" />
              </a>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
