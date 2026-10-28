import { clsx } from "clsx";
import type { ReactNode } from "react";
import { BarChart3, Calculator, LayoutDashboard, RotateCcw, Table2 } from "lucide-react";
import { SCENARIOS } from "../model";
import { useStore } from "../store";

export const PAGES = [
  { id: "plan", label: "Revenue plan", icon: LayoutDashboard },
  { id: "reporting", label: "Budget & reporting", icon: BarChart3 },
  { id: "tools", label: "Decision tools", icon: Calculator },
  { id: "model", label: "Model", icon: Table2 },
] as const;
export type PageId = (typeof PAGES)[number]["id"];

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0A4A40" />
      <path d="M8 22 L16 9 L24 22" fill="none" stroke="#EFB21E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="19" r="2.2" fill="#EFB21E" />
    </svg>
  );
}

export function ScenarioSwitch() {
  const { scenario, setScenario } = useStore();
  return (
    <div role="group" aria-label="Scenario" className="inline-flex rounded-lg border border-line bg-white p-0.5 shadow-card">
      {SCENARIOS.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-pressed={scenario === s.id}
          onClick={() => setScenario(s.id)}
          className={clsx(
            "rounded-md px-2.5 py-1.5 text-[12.5px] font-medium transition-colors sm:px-3 sm:text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500",
            scenario === s.id ? "bg-green-900 text-white" : "text-muted hover:text-ink",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function Shell({ page, children }: { page: PageId; children: ReactNode }) {
  const { edits, reset } = useStore();
  const current = PAGES.find((p) => p.id === page)!;
  return (
    <div className="min-h-screen bg-page lg:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-green-900 text-white lg:flex">
        <div className="flex items-center gap-3 px-5 pb-6 pt-6">
          <Mark />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold">Strategic Finance</div>
            <div className="text-xs text-white/55">Business operations · FY2028</div>
          </div>
        </div>
        <div className="px-5 pb-2 text-[11px] font-medium uppercase tracking-wider text-white/40">Finance</div>
        <nav className="flex flex-col gap-0.5 px-3" aria-label="Pages">
          {PAGES.map((p) => {
            const Icon = p.icon;
            const on = p.id === page;
            return (
              <a
                key={p.id}
                href={"#" + p.id}
                aria-current={on ? "page" : undefined}
                className={clsx(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500",
                  on ? "bg-white/10 font-medium text-white" : "text-white/65 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon size={17} strokeWidth={1.8} className={on ? "text-gold-500" : ""} />
                {p.label}
              </a>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 px-5 py-5 text-xs leading-relaxed text-white/55">
          <div className="font-medium text-white/85">Concept by Cole Mellone</div>
          Built from public information. Not affiliated with the A's or MLB.
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-white/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3 sm:px-8">
          <div className="hidden items-center gap-2 sm:flex lg:hidden"><Mark /></div>
          <div className="min-w-0 flex-1">
            <div className="hidden text-[12px] text-muted sm:block">Business operations</div>
            <div className="truncate text-[15px] font-semibold text-ink">{current.label}</div>
          </div>
          {edits > 0 && (
            <button type="button" onClick={reset} className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-muted hover:bg-page hover:text-ink sm:inline-flex">
              <RotateCcw size={14} /> {edits} edited {edits === 1 ? "input" : "inputs"} · Reset
            </button>
          )}
          <ScenarioSwitch />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 lg:hidden" aria-label="Pages">
          {PAGES.map((p) => (
            <a key={p.id} href={"#" + p.id} aria-current={p.id === page ? "page" : undefined}
              className={clsx("whitespace-nowrap rounded-md px-3 py-1.5 text-[13px]", p.id === page ? "bg-green-900 text-white" : "text-muted")}>
              {p.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 py-7 sm:px-8">{children}</main>
      <footer className="px-4 pb-8 text-xs text-muted sm:px-8 lg:hidden">Concept by Cole Mellone. Built from public information. Not affiliated with the A's or MLB.</footer>
    </div>
  );
}
