import { useState } from "react";
import { clsx } from "clsx";
import { RotateCcw } from "lucide-react";
import { PageHeader, TierBadge } from "../components/ui";
import { cell, DEFS, fmtInt, fmtM, fmtVal, parseVal, SCENARIOS, SECTIONS, SOURCE_ORDER, SOURCES, type Scenario } from "../model";
import { useStore } from "../store";
import Method from "./Method";

type Sel = { ref: string; text: string } | null;

function InputCell({ id, s, active, onSelect }: { id: string; s: Scenario; active: boolean; onSelect: (sel: Sel) => void }) {
  const { values, setValue } = useStore();
  const d = DEFS[id];
  const v = values[id][s];
  const [draft, setDraft] = useState<string | null>(null);
  const edited = v !== d[s];
  return (
    <td className={clsx("relative h-8 border border-[#E2E5E2] p-0", active && "bg-gold-100/60")}>
      <input
        id={`cell-${id}-${s}`}
        aria-label={`${d.label}, ${SCENARIOS.find((x) => x.id === s)!.label}`}
        spellCheck={false}
        value={draft ?? fmtVal(v, d.fmt)}
        onFocus={(e) => { setDraft(String(v)); onSelect({ ref: cell(id, s), text: `${d.label} · ${d.note}` }); requestAnimationFrame(() => e.target.select()); }}
        onChange={(e) => { setDraft(e.target.value); const n = parseVal(e.target.value, d.fmt); if (n != null) setValue(id, s, n); }}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
        className={clsx(
          "h-full w-full bg-transparent px-2.5 text-right font-mono text-[12.5px] tabular-nums outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-[#1F7A4D]",
          edited ? "font-semibold text-[#8A5D00]" : "text-ink",
        )}
      />
    </td>
  );
}

export default function Model() {
  const { scenario, inputs: x, result: r, edits, reset } = useStore();
  const [tab, setTab] = useState<"inputs" | "calc">("inputs");
  const [sel, setSel] = useState<Sel>(null);
  const R = (id: string) => cell(id, scenario);
  const scen = SCENARIOS.find((s) => s.id === scenario)!.label;

  const calcs: [string, string, string, string][] = [
    ["K1", "Premium seat guests per game", `=${R("acs")}*${R("acsold")}+${R("dcs")}*${R("dcsold")}+${R("ops")}*${R("opsold")}`, fmtInt(r.prem)],
    ["K2", "Suite guests per game", `=${R("st")}*${R("scap")}`, fmtInt(r.suiteFans)],
    ["K3", "General seating fans per game", `=${R("att")}-K1-K2`, fmtInt(r.gaFans)],
    ["K4", "General tickets per season", `=K3*${R("g")}`, fmtInt(r.gaTix)],
    ["K5", "Blended general ticket price", `=(1-${R("tour")})*${R("loc")}+${R("tour")}*${R("tou")}`, "$" + r.gaPrice.toFixed(2)],
    ["K6", "General ticket revenue", "=K4*K5", fmtM(r.tickets)],
    ["K7", "Premium club seat revenue", `=${R("acs")}*${R("acsold")}*${R("acp")}+${R("dcs")}*${R("dcsold")}*${R("dcp")}+${R("ops")}*${R("opsold")}*${R("opp")}*${R("g")}`, fmtM(r.clubs)],
    ["K8", "Suite revenue", `=${R("st")}*${R("sp")}`, fmtM(r.suites)],
    ["K9", "F&B revenue (club share)", `=K4*${R("fb")}*${R("comm")}`, fmtM(r.fb)],
    ["K10", "Merchandise", `=${R("att")}*${R("g")}*${R("mer")}`, fmtM(r.merch)],
    ["K11", "Parking", `=${R("pk")}*${R("pku")}*${R("g")}*${R("pkp")}`, fmtM(r.parking)],
    ["K12", "Sponsorship & naming", `=${R("nm")}+${R("sp2")}`, fmtM(r.spons)],
    ["K13", "Dome events", `=${R("ev")}*(${R("eva")}*${R("evf")}*${R("comm")}+${R("rent")})`, fmtM(r.events)],
    ["K14", "Total opening-season revenue", "=SUM(K6:K13)", fmtM(r.total)],
    ["K15", "Revenue per fan", `=K14/(${R("att")}*${R("g")})`, "$" + r.perFan.toFixed(2)],
    ["K16", "Benchmark: Braves revenue per fan", `=${R("brv")}/${R("brva")}`, "$" + r.brvPerFan.toFixed(2)],
    ["K17", "One-time seat licenses (not revenue)", `=${R("acs")}*${R("acsold")}*${R("psla")}+${R("dcs")}*${R("dcsold")}*${R("psld")}`, fmtM(r.psl)],
  ];
  void x;

  let row = 1;
  return (
    <div className="grid gap-5">
      <PageHeader
        title="Model"
        description="Every input behind the site, with its source. Change any cell and every tab updates."
      >
        <button type="button" onClick={reset} disabled={!edits}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-medium text-ink shadow-card disabled:opacity-40">
          <RotateCcw size={14} /> Reset to sourced values
        </button>
      </PageHeader>

      <div className="overflow-hidden rounded-lg border border-[#D5DAD5] bg-white shadow-card">
        <div className="flex items-center border-b border-[#D5DAD5] bg-[#F8F9F8] text-[12.5px]">
          <div className="w-20 shrink-0 border-r border-[#D5DAD5] px-3 py-2 text-center font-mono text-ink">{sel?.ref ?? "A1"}</div>
          <div className="px-3 py-2 font-serif italic text-muted">fx</div>
          <div className="min-w-0 flex-1 truncate py-2 pr-3 font-mono text-ink">{sel?.text ?? "Select a cell to see its basis or formula."}</div>
        </div>

        <div className="max-h-[68vh] overflow-auto">
          {tab === "inputs" ? (
            <table className="w-full min-w-[1000px] border-collapse text-[13px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#EFF1EF] text-[11px] font-medium text-muted">
                  <th className="w-11 border border-[#D5DAD5]" />
                  {["A", "B", "C", "D", "E", "F"].map((c, i) => (
                    <th key={c} className={clsx("border border-[#D5DAD5] py-1 font-normal", i - 2 === ["c", "b", "u"].indexOf(scenario) && "bg-gold-100 text-ink")}>{c}</th>
                  ))}
                </tr>
                <tr className="bg-white text-left text-[12px] font-semibold text-ink">
                  <td className="border border-[#D5DAD5] bg-[#EFF1EF] text-center text-[11px] font-normal text-muted">1</td>
                  <th className="border border-[#D5DAD5] px-2.5 py-1.5">Input</th>
                  <th className="border border-[#D5DAD5] px-2.5 py-1.5">Basis</th>
                  {SCENARIOS.map((s) => <th key={s.id} className={clsx("w-[120px] border border-[#D5DAD5] px-2.5 py-1.5 text-right", s.id === scenario && "bg-gold-100/60")}>{s.label}</th>)}
                  <th className="border border-[#D5DAD5] px-2.5 py-1.5">Source &amp; rationale</th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((sec) => {
                  row++;
                  const head = (
                    <tr key={sec.name}>
                      <td className="border border-[#D5DAD5] bg-[#EFF1EF] text-center text-[11px] text-muted">{row}</td>
                      <td colSpan={6} className="border border-[#E2E5E2] bg-green-50 px-2.5 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-green-800">{sec.name}</td>
                    </tr>
                  );
                  return [head, ...sec.rows.map((d) => {
                    row++;
                    return (
                      <tr key={d.id} className="hover:bg-page/60">
                        <td className="border border-[#D5DAD5] bg-[#EFF1EF] text-center text-[11px] text-muted">{row}</td>
                        <td className="whitespace-nowrap border border-[#E2E5E2] px-2.5 text-ink">{d.label}</td>
                        <td className="border border-[#E2E5E2] px-2.5"><TierBadge tier={d.tier} /></td>
                        {SCENARIOS.map((s) => <InputCell key={s.id} id={d.id} s={s.id} active={s.id === scenario} onSelect={setSel} />)}
                        <td className="border border-[#E2E5E2] px-2.5 py-1.5 text-[12px] text-muted">
                          {d.src.map((k) => (
                            <a key={k} href={SOURCES[k].url} target="_blank" rel="noopener noreferrer" className="mr-1 font-mono text-green-700 hover:underline">[{SOURCE_ORDER.indexOf(k) + 1}]</a>
                          ))}
                          {d.note}
                        </td>
                      </tr>
                    );
                  })];
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[900px] border-collapse text-[13px]">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#EFF1EF] text-[11px] text-muted">
                  <th className="w-14 border border-[#D5DAD5] font-normal" />
                  {["A", "B", "C"].map((c) => <th key={c} className="border border-[#D5DAD5] py-1 font-normal">{c}</th>)}
                </tr>
                <tr className="bg-white text-left text-[12px] font-semibold text-ink">
                  <td className="border border-[#D5DAD5] bg-[#EFF1EF]" />
                  <th className="border border-[#D5DAD5] px-2.5 py-1.5">Calculation</th>
                  <th className="border border-[#D5DAD5] px-2.5 py-1.5">Formula ({scen} column)</th>
                  <th className="w-[150px] border border-[#D5DAD5] px-2.5 py-1.5 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {calcs.map(([ref, label, f, v]) => (
                  <tr key={ref} tabIndex={0} onFocus={() => setSel({ ref, text: f })} onClick={() => setSel({ ref, text: f })}
                    className={clsx("cursor-default outline-none hover:bg-page/60 focus:bg-gold-100/50", ref === "K14" && "font-semibold")}>
                    <td className="border border-[#D5DAD5] bg-[#EFF1EF] text-center font-mono text-[11px] text-muted">{ref}</td>
                    <td className="whitespace-nowrap border border-[#E2E5E2] px-2.5 py-1.5 text-ink">{label}</td>
                    <td className="whitespace-nowrap border border-[#E2E5E2] px-2.5 py-1.5 font-mono text-[12px] text-muted">{f}</td>
                    <td className={clsx("border border-[#E2E5E2] px-2.5 py-1.5 text-right font-mono tabular-nums text-ink", ref === "K14" && "bg-green-50")}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center gap-1 border-t border-[#D5DAD5] bg-[#F8F9F8] px-2 pt-1" role="tablist" aria-label="Sheets">
          {([["inputs", "Inputs"], ["calc", "Calculations"]] as const).map(([id, l]) => (
            <button key={id} role="tab" aria-selected={tab === id} type="button" onClick={() => { setTab(id); setSel(null); }}
              className={clsx("rounded-t-md border-x border-t px-4 py-1.5 text-[12.5px]", tab === id ? "-mb-px border-[#D5DAD5] bg-white font-semibold text-green-800" : "border-transparent text-muted hover:text-ink")}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <Method bare />
    </div>
  );
}
