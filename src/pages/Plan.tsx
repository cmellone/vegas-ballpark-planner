import Overview from "./Overview";
import Revenue from "./Revenue";
import Premium from "./Premium";
import Risk from "./Risk";

const JUMPS = [["sec-streams", "Revenue streams"], ["sec-premium", "Premium seating"], ["sec-risk", "Risk & ramp"]];

export default function Plan() {
  return (
    <div className="grid gap-10">
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="self-center text-[13px] font-medium text-muted">Jump to</span>
          {JUMPS.map(([id, l]) => (
            <button key={id} type="button" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-full border border-line bg-white px-3 py-1 text-[13px] text-ink shadow-card hover:border-green-700">{l}</button>
          ))}
        </div>
        <Overview />
      </div>
      <Revenue bare />
      <Premium bare />
      <Risk bare />
    </div>
  );
}
