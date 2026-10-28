import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./index.css";
import { StoreProvider } from "./store";
import { PAGES, Shell, type PageId } from "./components/Shell";
import Overview from "./pages/Overview";
import Revenue from "./pages/Revenue";
import Premium from "./pages/Premium";
import Events from "./pages/Events";
import Risk from "./pages/Risk";
import Model from "./pages/Model";
import Method from "./pages/Method";

const VIEWS: Record<PageId, () => JSX.Element> = { overview: Overview, revenue: Revenue, premium: Premium, events: Events, risk: Risk, model: Model, method: Method };
const fromHash = (): PageId => {
  const h = location.hash.slice(1);
  return (PAGES.some((p) => p.id === h) ? h : "overview") as PageId;
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
