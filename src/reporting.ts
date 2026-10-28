// Budget phasing, simulated actuals and variance analysis for the FY2028 reporting view.
// Revenue only. Budget = Base case of the model. Actuals are simulated from driver changes.
import { compute, type Inputs, type Result } from "./model";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Illustrative 81-game home schedule (opening in late March).
export const GAMES = [0, 0, 3, 13, 14, 13, 13, 14, 11, 0, 0, 0];
// Non-baseball dome events booked in the off-season months.
export const EVENT_WEIGHT = [0.2, 0.2, 0, 0, 0, 0, 0, 0, 0, 0.2, 0.2, 0.2];
export const SEASON_MONTHS = [2, 3, 4, 5, 6, 7, 8]; // Mar..Sep

export type Dept = { id: string; name: string; owner: string };
export const DEPTS: Dept[] = [
  { id: "ticketing", name: "Ticketing", owner: "Ticket sales" },
  { id: "premium", name: "Premium & hospitality", owner: "Premium sales" },
  { id: "partnerships", name: "Partnerships", owner: "Sponsorship" },
  { id: "fb", name: "Food & beverage", owner: "Concessions partner" },
  { id: "retail", name: "Retail", owner: "Merchandise" },
  { id: "venue", name: "Venue operations", owner: "Parking & events" },
];

// Simulated monthly driver outcomes vs plan (illustrative).
// att = attendance vs plan, tour = tourist share, fb / mer = per-fan spend vs plan.
export const SIM: Record<number, { att: number; tour: number; fb: number; mer: number }> = {
  2: { att: 1.04, tour: 0.31, fb: 1.05, mer: 1.12 },
  3: { att: 0.97, tour: 0.28, fb: 1.02, mer: 1.0 },
  4: { att: 0.95, tour: 0.27, fb: 1.05, mer: 0.98 },
  5: { att: 0.99, tour: 0.31, fb: 1.06, mer: 1.02 },
  6: { att: 1.01, tour: 0.33, fb: 1.03, mer: 1.0 },
  7: { att: 0.96, tour: 0.29, fb: 1.04, mer: 0.97 },
  8: { att: 0.94, tour: 0.26, fb: 1.02, mer: 0.95 },
};

function deptTotals(r: Result): Record<string, number> {
  return {
    ticketing: r.tickets,
    premium: r.clubs + r.suites,
    partnerships: r.spons,
    fb: r.fb,
    retail: r.merch,
    venue: r.parking + r.events,
  };
}

// Revenue for one department in one month, from an annual result.
function phase(r: Result, dept: string, m: number): number {
  const g = GAMES[m] / 81;
  switch (dept) {
    case "ticketing": return r.tickets * g;
    case "premium": return (r.clubs + r.suites) * g;
    case "partnerships": return r.spons * g;
    case "fb": return r.fb * g;
    case "retail": return r.merch * g;
    case "venue": return r.parking * g + r.events * EVENT_WEIGHT[m];
    default: return 0;
  }
}

export function simInputs(base: Inputs, m: number): Inputs {
  const s = SIM[m];
  if (!s) return base;
  return { ...base, att: base.att * s.att, tour: s.tour, fb: base.fb * s.fb, mer: base.mer * s.mer };
}

export type Line = { dept: string; budget: number; actual: number };

export function buildReport(base: Inputs, month: number) {
  const rb = compute(base);
  const budget: Record<string, number[]> = {};
  const actual: Record<string, number[]> = {};
  for (const d of DEPTS) { budget[d.id] = []; actual[d.id] = []; }
  for (let m = 0; m < 12; m++) {
    const ra = compute(simInputs(base, m));
    for (const d of DEPTS) {
      budget[d.id][m] = phase(rb, d.id, m);
      actual[d.id][m] = phase(ra, d.id, m);
    }
  }
  const sum = (a: number[], from: number, to: number) => a.slice(from, to + 1).reduce((x, y) => x + y, 0);
  const lines = DEPTS.map((d) => ({
    dept: d,
    mBudget: budget[d.id][month],
    mActual: actual[d.id][month],
    ytdBudget: sum(budget[d.id], 0, month),
    ytdActual: sum(actual[d.id], 0, month),
    fyBudget: sum(budget[d.id], 0, 11),
    fyForecast: sum(actual[d.id], 0, month) + sum(budget[d.id], month + 1, 11),
  }));
  const tot = (k: keyof (typeof lines)[number]) => lines.reduce((x, l) => x + (l[k] as number), 0);
  const totals = {
    mBudget: tot("mBudget"), mActual: tot("mActual"), ytdBudget: tot("ytdBudget"), ytdActual: tot("ytdActual"),
    fyBudget: tot("fyBudget"), fyForecast: tot("fyForecast"),
  };
  const monthly = MONTHS.map((name, m) => {
    const b = DEPTS.reduce((x, d) => x + budget[d.id][m], 0);
    const a = DEPTS.reduce((x, d) => x + actual[d.id][m], 0);
    return { name, budget: b, actual: m <= month ? a : null, forecast: m > month ? b : null };
  });

  // Price/volume variance for the selected month (game-day lines).
  const g = GAMES[month];
  const rbM = rb, raM = compute(simInputs(base, month));
  const tixB = rbM.gaFans * g, tixA = raM.gaFans * g;
  const ticketVol = (tixA - tixB) * rbM.gaPrice;
  const ticketRate = (raM.gaPrice - rbM.gaPrice) * tixA;
  const fbVol = (tixA - tixB) * base.fb * base.comm;
  const fbRate = (simInputs(base, month).fb - base.fb) * tixA * base.comm;
  const fansB = rbM.att * g, fansA = raM.att * g;
  const merchVol = (fansA - fansB) * base.mer;
  const merchRate = (simInputs(base, month).mer - base.mer) * fansA;

  // Deferred revenue: premium and suite season contracts collected before Opening Day.
  const premAnnual = rb.clubs + rb.suites;
  let bal = premAnnual;
  const deferred = MONTHS.map((name, m) => {
    const open = bal;
    const rec = premAnnual * GAMES[m] / 81;
    bal = open - rec;
    return { name, open, rec, close: bal };
  });

  const deptTot = deptTotals(rb);
  const checks = [
    { label: "Monthly budget sums to the annual plan", ok: Math.abs(monthly.reduce((x, r) => x + r.budget, 0) - rb.total) < 1 },
    { label: "Departments sum to the model total", ok: Math.abs(Object.values(deptTot).reduce((x, y) => x + y, 0) - rb.total) < 1 },
    { label: "Schedule totals 81 home games", ok: GAMES.reduce((x, y) => x + y, 0) === 81 },
    { label: "Forecast = actual to date + remaining budget", ok: Math.abs(totals.fyForecast - (totals.ytdActual + (totals.fyBudget - totals.ytdBudget))) < 1 },
    { label: "Deferred premium revenue closes the year at zero", ok: Math.abs(deferred[11].close) < 1 },
  ];

  return {
    rb, raM, lines, totals, monthly, deferred, checks,
    variance: { ticketVol, ticketRate, fbVol, fbRate, merchVol, merchRate, tixA, tixB, fansA, fansB },
    sim: SIM[month],
  };
}
