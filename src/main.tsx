import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import { StoreProvider } from "./store";
import { PAGES, Shell, type PageId } from "./components/Shell";
import Plan from "./pages/Plan";
import Reporting from "./pages/Reporting";
import Tools from "./pages/Tools";
import Model from "./pages/Model";

const VIEWS: Record<PageId, () => JSX.Element> = { plan: Plan, reporting: Reporting, tools: Tools, model: Model };
// Older links keep working.
const ALIAS: Record<string, PageId> = { overview: "plan", revenue: "plan", premium: "plan", risk: "plan", events: "tools", method: "model" };
const fromHash = (): PageId => {
  const h = location.hash.slice(1);
  if (PAGES.some((p) => p.id === h)) return h as PageId;
  return ALIAS[h] ?? "plan";
};

function App() {
  const [page, setPage] = useState<PageId>(fromHash);
  useEffect(() => {
    const on = () => { setPage(fromHash()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const View = VIEWS[page];
  return <Shell page={page}><View /></Shell>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><StoreProvider><App /></StoreProvider></React.StrictMode>,
);
