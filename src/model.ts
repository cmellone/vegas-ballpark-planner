// Driver-based opening-season revenue model. Every screen reads from compute().

export type Scenario = "c" | "b" | "u";
export type Tier = "D" | "B" | "E";
export type Fmt = "int" | "usd" | "pct";

export const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: "c", label: "Conservative" },
  { id: "b", label: "Base" },
  { id: "u", label: "Upside" },
];
export const TIER_LABEL: Record<Tier, string> = { D: "Disclosed", B: "Benchmarked", E: "Estimated" };

export const SOURCES: Record<string, { title: string; url: string }> = {
  s1: { title: "A's $2B Las Vegas stadium remains on schedule for '28 opening (ESPN / ABC7, May 2026)", url: "https://abc7news.com/post/2b-las-vegas-stadium-remains-schedule-28-opening/19147520/" },
  s2: { title: "A's expect 30% of crowds to be tourists (Sports Illustrated, 2023)", url: "https://www.si.com/mlb/2023/06/01/oakland-athletics-unusual-game-times-expected-move-las-vegas-strip-tourists" },
  s2b: { title: "Club projection of 27,000 average attendance (Joe Sheehan Newsletter, 2023)", url: "https://www.joesheehan.com/2023/06/joe-sheehan-newsletter-june-12-2023-las.html" },
  s3: { title: "Las Vegas A's season tickets may start at $22 per game (Review-Journal via CDC Gaming, Oct 2025)", url: "https://cdcgaming.com/brief/las-vegas-as-season-tickets-may-start-at-22-per-game/" },
  s4: { title: "Floated Las Vegas season ticket prices (Sports Illustrated, Oct 2025)", url: "https://www.si.com/mlb/athletics/relocation/there-s-no-way-a-s-season-tickets-in-las-vegas-will-cost-this-much" },
  s4b: { title: "2025 MLB ticket and concession prices by team (WDBO)", url: "https://www.wdbo.com/news/see-how-much-it/2W53Z76OXQ2BDOR3GT2FZWXX4E/" },
  s5: { title: "Athletic Club and Diamond Club seats, pricing and seat licenses (LVSportsBiz, Jul 2026)", url: "https://lvsportsbiz.com/2026/07/08/as-to-vegas-athletics-have-sold-92-percent-of-their-294-high-end-seats-in-exclusive-athletic-club-behind-home-plate-at-las-vegas-stadium-on-strip/" },
  s6: { title: "Athletic Club sells out 17 months ahead of opening (MLB.com, Oct 2026)", url: "https://www.mlb.com/news/a-s-athletic-club-sells-out-17-months-ahead-of-2028-ballpark-opening" },
  s7: { title: "Red Sox game-day prices: beer, food, parking (2025)", url: "https://homenewshere.com/news/state/article_57831937-63f2-50de-a298-9ffa1f91a2d0.html" },
  s8: { title: "The economics of stadium concessions (Beyond the Sideline)", url: "https://beyondthesideline.beehiiv.com/p/the-economics-of-stadium-concessions" },
  s9: { title: "Atlanta Braves Holdings 2025 full-year results (Business Wire, Feb 2026)", url: "https://www.businesswire.com/news/home/20260225509584/en/Atlanta-Braves-Holdings-Reports-Fourth-Quarter-and-Year-End-2025-Financial-Results" },
  s10: { title: "1,500-space garage planned at the ballpark site (Review-Journal via News-Gazette)", url: "https://www.news-gazette.com/a-s-have-spent-600m-on-las-vegas-ballpark-construction/article_7da3cc55-4eda-5968-be61-841f58fb4cdf.html" },
  s11: { title: "Braves naming rights above $10M a year (SportsBusiness Daily)", url: "https://www.sportsbusinessdaily.com/Daily/Issues/2014/09/17/Facilities/Braves.aspx" },
  s11b: { title: "Globe Life Field naming rights at $11M a year (SportsBusiness Daily)", url: "https://www.sportsbusinessdaily.com/Daily/Issues/2017/08/24/Facilities/Globe-Life-Rangers.aspx" },
  s12: { title: "MLB team sponsorship revenue reached $2.05B in 2025 (DocSports, citing SponsorUnited)", url: "https://www.docsports.com/2025/mlb-financial-statistics.html" },
  s13: { title: "Allegiant Stadium hosted 38 ticketed events in 12 months (LVSportsBiz, 2026)", url: "https://lvsportsbiz.com/?p=94159" },
  s14: { title: "Clapp & Hakes, How Long a Honeymoon? (Journal of Sports Economics, 2005)", url: "https://ideas.repec.org/a/sae/jospec/v6y2005i3p237-263.html" },
  s14b: { title: "Attendance index for new ballparks opened since 1991 (Twins Daily)", url: "https://twinsdaily.com/forums/topic/12166-article-when-does-the-honeymoon-end-at-target-field" },
  s15: { title: "Braves drew 2,903,167 fans in 2025 (Sports Illustrated)", url: "https://www.si.com/mlb/braves/onsi/news/atlanta-braves-down-year-sees-surprising-attendance-numbers" },
  s16: { title: "Las Vegas recorded 38.5M visitors in 2025, down 7.5% (Yogonet, citing LVCVA)", url: "https://www.yogonet.com/international/news/2026/01/29/117360-las-vegas-tourism-sees-75-drop-in-2025-recording-385-million-visitors" },
  s17: { title: "Forbes 2026 MLB valuations (Hutch Post)", url: "https://hutchpost.com/posts/4c4cf7d9-2ad8-4e42-a452-8f3e3d67d593" },
  s18: { title: "MLB 2025 average attendance of 29,471 (theScore)", url: "https://www.thescore.com/mlb/news/3357226/major-league-baseball-attendance-1980-2025" },
};
export const SOURCE_ORDER = Object.keys(SOURCES);

export type InputDef = {
  id: string; label: string; fmt: Fmt; c: number; b: number; u: number;
  tier: Tier; src: string[]; note: string;
};
export type Section = { name: string; rows: InputDef[] };

const r = (id: string, label: string, fmt: Fmt, c: number, b: number, u: number, tier: Tier, src: string[], note: string): InputDef =>
  ({ id, label, fmt, c, b, u, tier, src, note });

export const SECTIONS: Section[] = [
  { name: "Attendance & tickets", rows: [
    r("g", "Home games", "int", 81, 81, 81, "D", ["s1"], "Regular-season home schedule."),
    r("cap", "Capacity", "int", 33000, 33000, 33000, "D", ["s1", "s5"], "30,000 fixed seats plus 3,000 standing."),
    r("att", "Average attendance per game", "int", 24000, 27000, 30000, "D", ["s2b", "s18"], "Club projection of 27,000. MLB averaged 29,471 in 2025."),
    r("tour", "Tourist share of crowd", "pct", 0.2, 0.3, 0.35, "D", ["s2", "s16"], "Club's consultant projected 30%. Las Vegas visitation fell 7.5% in 2025."),
    r("loc", "General ticket, local average", "usd", 26, 32, 40, "B", ["s3", "s4b"], "Floated floor about $22 a game. Mid-market MLB teams average about $30–40."),
    r("tou", "General ticket, tourist average", "usd", 40, 55, 70, "E", ["s4", "s4b"], "Single-game buyers pay more than season holders. Standing room floated at $27."),
  ]},
  { name: "Premium seating", rows: [
    r("acs", "Athletic Club seats", "int", 294, 294, 294, "D", ["s5"], "Behind home plate."),
    r("acp", "Athletic Club season price", "usd", 72900, 72900, 72900, "D", ["s5"], "$900 a game, all-inclusive."),
    r("acsold", "Athletic Club sold", "pct", 1, 1, 1, "D", ["s6"], "Sold out as of October 2026."),
    r("dcs", "Diamond Club seats", "int", 694, 694, 694, "D", ["s5"], "Adjacent to the Athletic Club."),
    r("dcp", "Diamond Club season price", "usd", 44550, 44550, 44550, "D", ["s5"], "$550 a game, all-inclusive."),
    r("dcsold", "Diamond Club sold", "pct", 0.85, 0.9, 1, "E", ["s6"], "Club says limited space remains."),
    r("ops", "Other premium seats", "int", 5012, 5012, 5012, "D", ["s5"], "About 6,000 premium seats in total, less the two clubs."),
    r("opp", "Other premium, average per game", "usd", 80, 110, 150, "E", ["s5"], "Between general seating and the $550 Diamond Club."),
    r("opsold", "Other premium sold", "pct", 0.7, 0.85, 0.95, "E", [], "Below the top clubs' sell-through."),
    r("st", "Suites", "int", 20, 30, 40, "E", [], "Count not disclosed. First set of suites sold out."),
    r("sp", "Suite average season price", "usd", 200000, 300000, 400000, "E", ["s3"], "Top 16-person suite floated at $570,000."),
    r("scap", "Guests per suite", "int", 16, 16, 16, "D", ["s3"], "16-person executive suite in floated pricing."),
    r("psla", "Athletic Club seat license (one-time)", "usd", 100000, 100000, 100000, "D", ["s5"], "Per seat."),
    r("psld", "Diamond Club seat license (one-time)", "usd", 60000, 60000, 60000, "D", ["s5"], "Per seat."),
  ]},
  { name: "Concessions, retail & parking", rows: [
    r("fb", "F&B spend per general fan", "usd", 22, 28, 35, "E", ["s7"], "About one beer and one food item at 2025 MLB prices. Premium is all-inclusive."),
    r("comm", "Club share of F&B sales", "pct", 0.35, 0.45, 0.55, "B", ["s8"], "Concessionaires typically pay teams 35–55% of sales."),
    r("mer", "Merchandise per fan", "usd", 6, 8, 10, "B", ["s9", "s15"], "Braves retail and licensing is about $16 per fan including licensing. Set at about half."),
    r("pk", "Parking spaces", "int", 1500, 1500, 1500, "D", ["s10"], "Garage on site."),
    r("pku", "Parking used per game", "pct", 0.85, 0.85, 0.85, "E", [], "Judgment."),
    r("pkp", "Parking price", "usd", 25, 35, 45, "B", ["s7"], "MLB parking runs about $12–34. Strip parking is priced high."),
  ]},
  { name: "Sponsorship", rows: [
    r("nm", "Naming rights per year", "usd", 8e6, 12e6, 18e6, "B", ["s11", "s11b"], "Recent ballpark deals run $10–11M a year. Not yet sold."),
    r("sp2", "Other sponsorship per year", "usd", 40e6, 55e6, 70e6, "B", ["s12"], "MLB clubs averaged about $68M in sponsorship in 2025."),
  ]},
  { name: "Dome events", rows: [
    r("ev", "Non-baseball events per year", "int", 6, 12, 20, "B", ["s13"], "Allegiant hosted 22 non-football ticketed events in a year."),
    r("eva", "Guests per event", "int", 20000, 25000, 30000, "E", ["s1"], "Capacity up to 33,000."),
    r("evf", "Event F&B per guest", "usd", 30, 30, 30, "E", ["s7"], "Concert crowds spend more per head than ballgame crowds."),
    r("rent", "Facility rent per event", "usd", 150000, 250000, 400000, "E", [], "Judgment for a venue this size."),
  ]},
  { name: "Ramp & benchmarks", rows: [
    r("h2", "Attendance index, season 2", "pct", 0.91, 0.91, 0.91, "B", ["s14b"], "New parks since 1991 averaged 91% of year-one attendance in year two."),
    r("h3", "Attendance index, season 3", "pct", 0.87, 0.87, 0.87, "B", ["s14b"], "87% in year three."),
    r("h4", "Attendance index, season 4", "pct", 0.87, 0.87, 0.87, "B", ["s14", "s14b"], "87% in year four."),
    r("brv", "Braves game-day & commercial revenue", "usd", 446.4e6, 446.4e6, 446.4e6, "B", ["s9"], "Baseball event, retail & licensing and other revenue, 2025."),
    r("brva", "Braves 2025 attendance", "int", 2903167, 2903167, 2903167, "B", ["s15"], "Paid attendance."),
  ]},
];

export const DEFS: Record<string, InputDef> = {};
SECTIONS.forEach((s) => s.rows.forEach((d) => (DEFS[d.id] = d)));

// Spreadsheet references: column C/D/E = Conservative/Base/Upside, rows numbered down the sheet.
export const COL: Record<Scenario, string> = { c: "C", b: "D", u: "E" };
export const ROW: Record<string, number> = {};
{
  let n = 2; // row 1 holds the column headers
  SECTIONS.forEach((s) => { n++; s.rows.forEach((d) => { ROW[d.id] = n; n++; }); });
}
export const cell = (id: string, s: Scenario) => COL[s] + ROW[id];

export type Values = Record<string, Record<Scenario, number>>;
export function defaultValues(): Values {
  const v: Values = {};
  for (const k in DEFS) v[k] = { c: DEFS[k].c, b: DEFS[k].b, u: DEFS[k].u };
  return v;
}
export type Inputs = Record<string, number>;
export const pick = (v: Values, s: Scenario, over: Inputs = {}): Inputs => {
  const o: Inputs = {};
  for (const k in v) o[k] = v[k][s];
  return { ...o, ...over };
};

export function compute(x: Inputs, idx = 1) {
  const att = x.att * idx;
  const ac = x.acs * x.acsold, dc = x.dcs * x.dcsold, op = x.ops * x.opsold;
  const prem = ac + dc + op;
  const suiteFans = x.st * x.scap;
  const gaFans = Math.max(0, att - prem - suiteFans);
  const gaTix = gaFans * x.g;
  const gaPrice = (1 - x.tour) * x.loc + x.tour * x.tou;
  const tickets = gaTix * gaPrice;
  const acRev = ac * x.acp, dcRev = dc * x.dcp, opRev = op * x.opp * x.g;
  const clubs = acRev + dcRev + opRev;
  const suites = x.st * x.sp;
  const fb = gaTix * x.fb * x.comm;
  const merch = att * x.g * x.mer;
  const parking = x.pk * x.pku * x.g * x.pkp;
  const spons = x.nm + x.sp2;
  const evPer = x.eva * x.evf * x.comm + x.rent;
  const events = x.ev * evPer;
  const total = tickets + clubs + suites + fb + merch + parking + spons + events;
  const psl = ac * x.psla + dc * x.psld;
  return {
    att, prem, suiteFans, gaFans, gaTix, gaPrice, tickets, acRev, dcRev, opRev, clubs, suites, fb, merch, parking, spons, evPer, events, total, psl,
    fans: att * x.g, perFan: total / (att * x.g), occ: att / x.cap, premShare: (clubs + suites) / total,
    brvPerFan: x.brv / x.brva, tourFans: att * x.tour * x.g,
  };
}
export type Result = ReturnType<typeof compute>;

export const STREAMS: { key: keyof Result; name: string; short: string; how: string; inputs: string[] }[] = [
  { key: "tickets", name: "General tickets", short: "Tickets", how: "General seating fans × 81 games × blended local/tourist price", inputs: ["att", "tour", "loc", "tou"] },
  { key: "clubs", name: "Premium club seats", short: "Club seats", how: "Athletic + Diamond Club season seats, plus other premium seats × price × 81", inputs: ["acp", "dcsold", "opp", "opsold"] },
  { key: "spons", name: "Sponsorship & naming", short: "Sponsorship", how: "Naming rights + other sponsorship", inputs: ["nm", "sp2"] },
  { key: "fb", name: "Food & beverage (club share)", short: "F&B", how: "General tickets × spend per fan × club share", inputs: ["fb", "comm"] },
  { key: "merch", name: "Merchandise", short: "Merch", how: "All fans × 81 games × spend per fan", inputs: ["mer"] },
  { key: "suites", name: "Suites", short: "Suites", how: "Suites × average season price", inputs: ["st", "sp"] },
  { key: "events", name: "Dome events", short: "Events", how: "Events × (guests × F&B × club share + rent)", inputs: ["ev", "eva", "rent"] },
  { key: "parking", name: "Parking", short: "Parking", how: "Spaces × use × 81 games × price", inputs: ["pk", "pkp"] },
];
export const tierOf = (ids: string[]): Tier => {
  const t = ids.map((i) => DEFS[i].tier);
  return t.includes("E") ? "E" : t.includes("B") ? "B" : "D";
};

export const SENS: [string, string][] = [
  ["att", "Attendance"], ["tour", "Tourist share"], ["loc", "Local ticket price"], ["tou", "Tourist ticket price"],
  ["opp", "Premium seat price"], ["opsold", "Premium sell-through"], ["sp", "Suite price"], ["st", "Suite count"],
  ["fb", "F&B per fan"], ["comm", "F&B share"], ["nm", "Naming rights"], ["sp2", "Other sponsorship"],
  ["ev", "Events per year"], ["rent", "Event rent"],
];

export const fmtM = (v: number, d = 1) => (v < 0 ? "−" : "") + "$" + (Math.abs(v) / 1e6).toFixed(d) + "M";
export const fmtInt = (v: number) => Math.round(v).toLocaleString("en-US");
export function fmtVal(v: number, f: Fmt) {
  if (f === "pct") { const p = v * 100; return (Number.isInteger(Math.round(p * 10) / 10) ? p.toFixed(0) : p.toFixed(1)) + "%"; }
  if (f === "usd") return v >= 1e6 ? "$" + (v / 1e6).toFixed(1) + "M" : "$" + Math.round(v).toLocaleString("en-US");
  return fmtInt(v);
}
export function parseVal(t: string, f: Fmt): number | null {
  let s = t.trim().replace(/[$,\s]/g, "");
  let m = 1, pc = f === "pct";
  if (/m$/i.test(s)) { m = 1e6; s = s.slice(0, -1); } else if (/k$/i.test(s)) { m = 1e3; s = s.slice(0, -1); }
  if (s.endsWith("%")) { s = s.slice(0, -1); pc = true; }
  let n = parseFloat(s);
  if (!isFinite(n)) return null;
  n *= m;
  if (f === "pct" && (pc || n > 1)) n /= 100;
  return n;
}
