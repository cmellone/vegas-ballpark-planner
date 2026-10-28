import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { compute, defaultValues, DEFS, pick, type Scenario, type Values } from "./model";

const KEY = "lvbp-v2";
type Store = {
  scenario: Scenario;
  setScenario: (s: Scenario) => void;
  values: Values;
  setValue: (id: string, s: Scenario, n: number) => void;
  reset: () => void;
  edits: number;
  inputs: ReturnType<typeof pick>;
  result: ReturnType<typeof compute>;
  all: Record<Scenario, ReturnType<typeof compute>>;
};
const Ctx = createContext<Store | null>(null);

function load(): { s: Scenario; v: Values } {
  const v = defaultValues();
  let s: Scenario = "b";
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.v) for (const k in p.v) if (v[k]) Object.assign(v[k], p.v[k]);
      if (p?.s === "c" || p?.s === "b" || p?.s === "u") s = p.s;
    }
  } catch { /* storage unavailable */ }
  return { s, v };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [init] = useState(load);
  const [scenario, setScenario] = useState<Scenario>(init.s);
  const [values, setValues] = useState<Values>(init.v);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ s: scenario, v: values })); } catch { /* ignore */ }
  }, [scenario, values]);

  const store = useMemo<Store>(() => {
    const inputs = pick(values, scenario);
    let edits = 0;
    for (const k in values) for (const s of ["c", "b", "u"] as Scenario[]) if (values[k][s] !== DEFS[k][s]) edits++;
    return {
      scenario, setScenario, values, edits, inputs,
      setValue: (id, s, n) => setValues((p) => ({ ...p, [id]: { ...p[id], [s]: n } })),
      reset: () => setValues(defaultValues()),
      result: compute(inputs),
      all: { c: compute(pick(values, "c")), b: compute(pick(values, "b")), u: compute(pick(values, "u")) },
    };
  }, [scenario, values]);

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}
