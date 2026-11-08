"use client";
/* eslint-disable @next/next/no-img-element -- tiny static SVG logo, no optimisation needed */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { reduced } from "./client";

// The demo is drawn at a fixed "screen" size and scaled to fit, like a video.
const W = 1200; // height 700, see .desk in globals.css

type AppKind = "agents" | "browser" | "music" | "explorer" | "editor";
type Line = { k: "cmd" | "ok" | "say" | "warn"; t: string };
type Scene = { app: AppKind; task: string; agents?: string[]; out: Line[]; openAt: number; hold: number };

const SCENES: Scene[] = [
  {
    app: "agents",
    task: "/agent 3 find a laptop, a monitor and a desk under $300",
    agents: ["laptops", "monitors", "desks"],
    out: [
      { k: "say", t: "Splitting this into 3 agents, one per item." },
      { k: "ok", t: "3 agent windows opened, working side by side" },
    ],
    openAt: 2,
    hold: 4200,
  },
  {
    app: "browser",
    task: "/browser best laptops under $800",
    out: [
      { k: "cmd", t: "open_url  search: best laptops under $800" },
      { k: "say", t: "Reading the top 4 results …" },
      { k: "ok", t: "Top pick: 14-inch, 16 GB RAM, $749" },
    ],
    openAt: 1,
    hold: 3000,
  },
  {
    app: "music",
    task: "open spotify and set the volume to 30%",
    out: [
      { k: "cmd", t: "open_app  spotify" },
      { k: "cmd", t: "set_volume  30" },
      { k: "ok", t: "Spotify is playing, volume at 30%" },
    ],
    openAt: 1,
    hold: 3600,
  },
  {
    app: "explorer",
    task: "move the PDFs in Downloads into Documents\\Invoices",
    out: [
      { k: "cmd", t: "list_files  Downloads\\*.pdf   (6 found)" },
      { k: "warn", t: "Moving 6 files. Run / Skip?  → Run" },
      { k: "ok", t: "6 files moved to Documents\\Invoices" },
    ],
    openAt: 1,
    hold: 5400,
  },
  {
    app: "editor",
    task: "/script python script that sorts Downloads by file type",
    out: [
      { k: "say", t: "Writing sort_downloads.py …" },
      { k: "ok", t: "Saved to %USERPROFILE%\\scripts\\sort_downloads.py" },
    ],
    openAt: 1,
    hold: 4200,
  },
];

/** Counts 0 → steps, one step every `ms`. Remount (via key) to restart. */
function useTicker(steps: number, ms: number, delay = ms) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!steps) return;
    let i = 0, t = 0;
    if (reduced()) t = window.setTimeout(() => setN(steps), 0);
    else {
      const tick = () => { i++; setN(i); if (i < steps) t = window.setTimeout(tick, ms); };
      t = window.setTimeout(tick, delay);
    }
    return () => clearTimeout(t);
  }, [steps, ms, delay]);
  return n;
}

/* ---------- Desktop pieces ---------- */

function Wallpaper() {
  // Original wavy wallpaper (drawn for this page, not a copy of any OS image).
  return (
    <svg className="wall" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="wp-base" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor="#ff6a5c" />
          <stop offset="0.45" stopColor="#f0254f" />
          <stop offset="0.8" stopColor="#a92a7c" />
          <stop offset="1" stopColor="#3d3477" />
        </linearGradient>
        <linearGradient id="wp-blue" x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#58b4ea" />
          <stop offset="1" stopColor="#1263ad" />
        </linearGradient>
        <linearGradient id="wp-sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c7d9f5" />
          <stop offset="1" stopColor="#eef3fb" />
        </linearGradient>
        <linearGradient id="wp-sun" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0" stopColor="#f58a3c" />
          <stop offset="1" stopColor="#fbc03e" />
        </linearGradient>
        <linearGradient id="wp-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff4a55" />
          <stop offset="1" stopColor="#f2163f" />
        </linearGradient>
        <filter id="wp-soft"><feGaussianBlur stdDeviation="6" /></filter>
      </defs>
      <rect width="1200" height="700" fill="url(#wp-base)" />
      <path d="M380 0 C520 40 600 120 700 170 C820 230 980 200 1200 250 V0 Z" fill="url(#wp-blue)" />
      <path d="M470 0 C640 30 760 60 900 70 C1020 80 1120 110 1200 140 V0 Z" fill="#1c74c0" opacity=".55" />
      <path d="M640 140 C740 210 860 200 980 190 C1080 185 1150 220 1200 260 V340 C1110 300 1020 290 920 290 C800 290 700 240 640 140 Z" fill="url(#wp-sky)" filter="url(#wp-soft)" />
      <path d="M760 250 C860 320 960 330 1060 350 C1130 365 1170 390 1200 400 V520 C1150 515 1110 470 1060 440 C980 395 860 380 760 250 Z" fill="url(#wp-sun)" filter="url(#wp-soft)" />
      <path d="M0 120 C220 200 420 300 620 400 C820 500 1000 560 1200 560 V700 H0 Z" fill="url(#wp-red)" opacity=".55" filter="url(#wp-soft)" />
      <path d="M0 380 C180 430 360 520 520 700 H0 Z" fill="#4a2c80" opacity=".55" filter="url(#wp-soft)" />
    </svg>
  );
}

const TB = {
  start: (
    <svg viewBox="0 0 24 24"><path fill="#1f8ae6" d="M3 3h8.5v8.5H3zM12.5 3H21v8.5h-8.5zM3 12.5h8.5V21H3zM12.5 12.5H21V21h-8.5z" /></svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5" /></svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24"><path fill="#f3b73b" d="M2 6.5A2.5 2.5 0 0 1 4.5 4h4.2l2 2h8.8A2.5 2.5 0 0 1 22 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5z" /><path fill="#fcd270" d="M2 9h20v8.5a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 17.5z" /></svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#2b9be0" /><path d="M2 12h20M12 2c3 3 3 17 0 20M12 2c-3 3-3 17 0 20" stroke="#bfe6ff" strokeWidth="1.4" fill="none" /></svg>
  ),
  music: (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1ed760" /><path d="M10 16.5V7.5l7-1.5v8.5" stroke="#000" strokeWidth="1.8" fill="none" strokeLinejoin="round" /><circle cx="8.6" cy="16.6" r="1.8" /><circle cx="15.6" cy="15" r="1.8" /></svg>
  ),
  code: (
    <svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="#2f6fe0" /><path d="m9 8-4 4 4 4M15 8l4 4-4 4" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
};

function Taskbar({ app, open }: { app: AppKind; open: boolean }) {
  const on = (k: AppKind) => open && app === k;
  const items: [string, ReactNode, boolean][] = [
    ["genisys", <img key="g" src="/logo.svg" alt="" />, true],
    ["explorer", TB.folder, on("explorer")],
    ["browser", TB.globe, on("browser")],
    ["music", TB.music, on("music")],
    ["editor", TB.code, on("editor")],
  ];
  return (
    <div className="taskbar">
      <div className="tb-mid">
        <span className="tb-i">{TB.start}</span>
        <span className="tb-i tb-search">{TB.search}</span>
        {items.map(([k, icon, active]) => (
          <span key={k} className={`tb-i ${active ? "on" : ""} ${k === "genisys" && on("agents") ? "many" : ""}`}>{icon}</span>
        ))}
      </div>
      <div className="tb-tray">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m6 15 6-6 6 6" /></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0" /><circle cx="12" cy="19.5" r="1" fill="currentColor" /></svg>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></svg>
        <span className="tb-clock"><b>11:29 AM</b><small>11/8/2026</small></span>
      </div>
    </div>
  );
}

/** A Windows 11 style app window. */
function Win({ title, icon, className = "", dark, children }: { title: string; icon: ReactNode; className?: string; dark?: boolean; children: ReactNode }) {
  return (
    <div className={`win ${dark ? "win-dark" : ""} ${className}`}>
      <div className="win-bar">
        <span className="win-ic">{icon}</span>
        <span className="win-title">{title}</span>
        <span className="win-ctl" aria-hidden="true">
          <svg viewBox="0 0 10 10"><path d="M1 5h8" /></svg>
          <svg viewBox="0 0 10 10"><rect x="1.5" y="1.5" width="7" height="7" rx="1" /></svg>
          <svg viewBox="0 0 10 10"><path d="m1.5 1.5 7 7m0-7-7 7" /></svg>
        </span>
      </div>
      <div className="win-body">{children}</div>
    </div>
  );
}

/* ---------- Apps that Genisys opens ---------- */

const AGENT_LINES = [
  ["searching: laptops under $300", "reading 6 reviews", "3 picks saved, best is $289"],
  ["searching: 27-inch monitors under $300", "comparing prices in 4 stores", "3 picks saved, best is $219"],
  ["searching: standing desks under $300", "checking sizes and reviews", "3 picks saved, best is $249"],
];

function AgentWindows({ names }: { names: string[] }) {
  const n = useTicker(5, 900);
  return (
    <>
      {names.map((name, i) => {
        const c = Math.max(0, Math.min(3, n - i));
        return (
          <div key={name} className={`agent-win a${i}`}>
            <div className="mock-bar sm"><span className="tl"><i className="r" /><i className="y" /><i className="g" /></span><span className="mock-title">agent {i + 1}</span></div>
            <div className="card mock-card sm">
              <div className="mock-head">
                <img src="/logo.svg" alt="" width="14" height="14" />
                <span className="pill">{name}</span>
                <span className={`badge ${c < 3 ? "b-run" : "b-ready"}`}>{c < 3 ? "working" : "done"}</span>
              </div>
              <div className="mock-log">
                {AGENT_LINES[i].slice(0, c).map((t, j) => (
                  <div key={j} className={`row ${j === 2 ? "l-ok" : "l-cmd"}`}><span className="mark">{j === 2 ? "✓" : "$"}</span><span>{t}</span></div>
                ))}
                {c < 3 && <div className="row l-say"><span className="mark">›</span><span className="thinking">thinking</span></div>}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

const RESULTS = [
  { site: "Budget Tech Weekly", path: "laptops › under-800", title: "The best laptops under $800, tested in 2026", text: "We ran 20 laptops through battery, screen and speed tests. Three stood out for students and office work." },
  { site: "Price Tracker", path: "deals › 14-inch", title: "14-inch, 16 GB RAM, 512 GB SSD: $749 (was $899)", text: "Lowest price in 90 days. Ships free, 30-day returns." },
  { site: "Student Gear Guide", path: "guides › laptops", title: "6 laptops under $800 that last all day", text: "Battery life matters more than a fast chip for most people. Here is what we would buy." },
  { site: "Laptop Forum", path: "threads › ram", title: "Is 16 GB of RAM worth it at this price?", text: "Short answer: yes, if you keep many browser tabs open. 8 GB feels slow in 2026." },
];

function Browser() {
  const n = useTicker(5, 520, 400);
  return (
    <Win title="best laptops under $800 - Search" icon={TB.globe} className="app-browser">
      <div className="br-bar">
        <span className="br-nav">←&nbsp;&nbsp;→&nbsp;&nbsp;↻</span>
        <span className="br-url"><span className="lock">🔒</span> search?q=best+laptops+under+%24800</span>
      </div>
      <div className="br-page">
        <div className="br-q">best laptops under $800</div>
        <div className="br-tabs"><b>All</b><span>Shopping</span><span>Images</span><span>News</span></div>
        {RESULTS.map((r, i) =>
          i < n ? (
            <div className="br-res" key={r.title}>
              <small>{r.site} <span>› {r.path}</span></small>
              <b>{r.title}</b>
              <p>{r.text}</p>
            </div>
          ) : (
            <div className="br-skel" key={r.title}><i /><i /><i /></div>
          )
        )}
      </div>
    </Win>
  );
}

const TRACKS = [
  ["Quiet Static", "Mira Vale", "3:12"],
  ["Neon Harbor", "The Lowtides", "4:05"],
  ["Slow Orbit", "Kito & June", "2:48"],
  ["Glass Rivers", "Northbound", "3:37"],
  ["Afterlight Avenue", "Sola Park", "3:59"],
];

function Music({ low }: { low: boolean }) {
  return (
    <Win title="Spotify" icon={TB.music} dark className="app-music">
      <div className="sp">
        <aside className="sp-side">
          <div className="sp-box"><b>⌂&nbsp; Home</b><span>⌕&nbsp; Search</span></div>
          <div className="sp-box sp-lib">
            <span className="sp-h">Your Library</span>
            {[["Focus Flow", "#7b4fd6"], ["Liked Songs", "#4c5fe0"], ["Late Night Drive", "#e0566d"], ["Morning Run", "#e8a33d"]].map(([t, c]) => (
              <span key={t} className="sp-pl"><i style={{ background: c }} />{t}</span>
            ))}
          </div>
        </aside>
        <main className="sp-main">
          <div className="sp-hero">
            <div className="sp-cover" />
            <div>
              <small>Playlist</small>
              <h4>Focus Flow</h4>
              <small>24 songs, 1 hr 32 min</small>
            </div>
          </div>
          <div className="sp-actions"><span className="sp-play">❚❚</span><span>⤨</span><span>⋯</span></div>
          <div className="sp-list">
            {TRACKS.map(([t, a, d], i) => (
              <div key={t} className={`sp-row ${i === 0 ? "now" : ""}`}>
                <span className="sp-n">{i === 0 ? <span className="eq"><i /><i /><i /></span> : i + 1}</span>
                <span className="sp-t"><b>{t}</b><small>{a}</small></span>
                <span className="sp-d">{d}</span>
              </div>
            ))}
          </div>
        </main>
        <footer className="sp-bar">
          <span className="sp-now"><i className="sp-cover sm" /><span><b>Quiet Static</b><small>Mira Vale</small></span></span>
          <span className="sp-ctl">
            <span>⤨&nbsp;&nbsp;⏮&nbsp;&nbsp;<b className="sp-pp">❚❚</b>&nbsp;&nbsp;⏭&nbsp;&nbsp;↻</span>
            <span className="sp-prog"><small>0:41</small><i><em /></i><small>3:12</small></span>
          </span>
          <span className="sp-vol">🔈<i><em style={{ width: low ? "30%" : "70%" }} /></i></span>
        </footer>
      </div>
    </Win>
  );
}

function VolumeFlyout() {
  return (
    <div className="vol-fly">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H3v6h3l5 4z" /><path d="M15.5 9a4 4 0 0 1 0 6" /></svg>
      <i><em /></i>
      <b>30</b>
    </div>
  );
}

const PDFS = ["invoice_march.pdf", "invoice_april.pdf", "receipt_laptop.pdf", "invoice_may.pdf", "insurance_2026.pdf", "tax_return.pdf"];
const OTHER = [["setup_tool.exe", "Application", "48.2 MB"], ["photo_0412.jpg", "JPG File", "3.1 MB"], ["notes.txt", "Text Document", "2 KB"]];

function Explorer({ go }: { go: boolean }) {
  const n = useTicker(go ? 8 : 0, 330, 300);
  const inInvoices = n >= 8;
  const rows = inInvoices
    ? PDFS.map((f) => ({ f, type: "PDF Document", size: "212 KB", gone: false, isNew: true }))
    : [
        ...PDFS.map((f, i) => ({ f, type: "PDF Document", size: "212 KB", gone: n > i, isNew: false })),
        ...OTHER.map(([f, type, size]) => ({ f, type, size, gone: false, isNew: false })),
      ];
  return (
    <Win title={inInvoices ? "Invoices" : "Downloads"} icon={TB.folder} className="app-explorer">
      <div className="ex-cmd">
        <span>＋ New</span><span className="sep" /><span>✂</span><span>⧉</span><span>📋</span><span>✎</span><span>🗑</span><span className="sep" /><span>⇅ Sort</span><span>☰ View</span>
      </div>
      <div className="ex-addr">
        <span className="br-nav">←&nbsp;&nbsp;→&nbsp;&nbsp;↑</span>
        <span className="ex-path">{inInvoices ? "›  This PC  ›  Documents  ›  Invoices" : "›  This PC  ›  Downloads"}</span>
        <span className="ex-search">⌕ Search {inInvoices ? "Invoices" : "Downloads"}</span>
      </div>
      <div className="ex-main">
        <aside className="ex-side">
          {[["Home", 0], ["Desktop", 0], ["Downloads", !inInvoices], ["Documents", 0], ["Invoices", inInvoices], ["Pictures", 0], ["Music", 0]].map(([t, a]) => (
            <span key={t as string} className={`${a ? "on" : ""} ${t === "Invoices" ? "ex-sub" : ""}`}>{TB.folder}{t}</span>
          ))}
        </aside>
        <div className="ex-list">
          <div className="ex-row ex-th"><span>Name</span><span>Date modified</span><span>Type</span><span>Size</span></div>
          {rows.map((r) => (
            <div key={(r.isNew ? "inv-" : "") + r.f} className={`ex-row ${r.gone ? "gone" : ""} ${r.isNew ? "new" : ""}`}>
              <span><i className={`ex-file ${r.f.endsWith(".pdf") ? "pdf" : ""}`} />{r.f}</span>
              <span>11/8/2026 11:2{r.f.length % 10}</span>
              <span>{r.type}</span>
              <span>{r.size}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ex-status">{inInvoices ? "6 items" : `${9 - Math.min(n, 6)} items`}</div>
    </Win>
  );
}

const CODE = [
  "import shutil",
  "from pathlib import Path",
  "",
  'downloads = Path.home() / "Downloads"',
  "groups = {",
  '    "Images": [".jpg", ".png", ".gif"],',
  '    "Documents": [".pdf", ".docx", ".txt"],',
  '    "Archives": [".zip", ".rar"],',
  "}",
  "",
  "for f in downloads.iterdir():",
  "    for folder, exts in groups.items():",
  "        if f.suffix.lower() in exts:",
  "            (downloads / folder).mkdir(exist_ok=True)",
  "            shutil.move(str(f), downloads / folder / f.name)",
];

function hl(line: string) {
  return line.split(/("[^"]*"|\b(?:import|from|for|in|if)\b)/).map((p, i) =>
    i % 2 ? <span key={i} className={p.startsWith('"') ? "tk-str" : "tk-key"}>{p}</span> : p
  );
}

function Editor() {
  const n = useTicker(CODE.length, 170, 500);
  return (
    <Win title="sort_downloads.py - Code Editor" icon={TB.code} dark className="app-editor">
      <div className="ed">
        <aside className="ed-act"><i /><i /><i /><i /></aside>
        <aside className="ed-side">
          <span className="ed-h">SCRIPTS</span>
          <span>backup_docs.bat</span>
          <span>clean_temp.ps1</span>
          <span className="on">sort_downloads.py</span>
        </aside>
        <div className="ed-main">
          <div className="ed-tabs"><span className="on">sort_downloads.py</span></div>
          <pre className="ed-code">
            {CODE.slice(0, n).map((l, i) => (
              <div key={i}><span className="ln">{i + 1}</span>{hl(l)}{i === n - 1 && n < CODE.length && <i className="caret" />}</div>
            ))}
          </pre>
        </div>
      </div>
      <div className="ed-status"><span>Python</span><span>UTF-8</span><span>Ln {Math.max(1, n)}</span></div>
    </Win>
  );
}

/* ---------- The demo ---------- */

/** A desktop "screen recording": Genisys takes a task, then the app it opens appears on the desktop. */
export function AppMock() {
  const [scene, setScene] = useState(0);
  const [typed, setTyped] = useState(SCENES[0].task.length);
  const [shown, setShown] = useState(SCENES[0].out.length);
  const [busy, setBusy] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [run, setRun] = useState(0);
  const [k, setK] = useState(1);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current!;
    const ro = new ResizeObserver(() => setK(el.clientWidth / W));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduced()) return; // keep the finished first scene on screen
    let timer = 0, visible = true, i = 0, s = 0;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap.current!);
    const wait = (ms: number, fn: () => void) => { timer = window.setTimeout(() => (visible ? fn() : wait(500, fn)), ms); };
    const start = () => {
      const sc = SCENES[s];
      i = 0;
      setLeaving(false); setScene(s); setRun((r) => r + 1); setTyped(0); setShown(0); setBusy(false);
      const type = () => {
        i++; setTyped(i);
        if (i < sc.task.length) wait(26 + Math.random() * 38, type);
        else wait(400, () => { setBusy(true); play(1); });
      };
      const play = (n: number) => {
        wait(750, () => {
          setShown(n);
          if (n < sc.out.length) play(n + 1);
          else {
            setBusy(false);
            wait(sc.hold, () => { setLeaving(true); s = (s + 1) % SCENES.length; wait(450, start); });
          }
        });
      };
      wait(500, type);
    };
    wait(1500, () => { setLeaving(true); wait(450, start); });
    return () => { clearTimeout(timer); io.disconnect(); };
  }, []);

  const sc = SCENES[scene];
  const done = typed >= sc.task.length;
  const open = done && shown >= sc.openAt;

  return (
    <div className="desk-wrap" ref={wrap} aria-hidden="true">
      <div className="desk" style={{ transform: `scale(${k})` }}>
        <Wallpaper />

        <div className="gx-win">
          <div className="mock-bar">
            <span className="tl"><i className="r" /><i className="y" /><i className="g" /></span>
            <span className="mock-title">genisys</span>
          </div>
          <div className="card mock-card">
            <div className="mock-head">
              <img src="/logo.svg" alt="" width="18" height="18" />
              <span className="pill">genisys</span>
              <span className={`badge ${busy ? "b-run" : "b-ready"}`}>{busy ? "working" : "ready"}</span>
              <span className="mock-model">gpt-oss-120b</span>
            </div>
            {sc.agents && done && shown > 0 && (
              <div className="agents">
                {sc.agents.map((a, n) => (
                  <span key={a} className="chip-agent"><i />agent {n + 1} · {a}</span>
                ))}
              </div>
            )}
            <div className="mock-log">
              {done && <div className="row user"><span className="txt">{sc.task}</span></div>}
              {sc.out.slice(0, shown).map((l, n) => (
                <div key={n} className={`row l-${l.k}`}>
                  <span className="mark">{l.k === "cmd" ? "$" : l.k === "ok" ? "✓" : l.k === "warn" ? "!" : "›"}</span>
                  <span>{l.t}</span>
                </div>
              ))}
              {busy && <div className="row l-say"><span className="mark">›</span><span className="thinking">thinking</span></div>}
            </div>
            <div className="mock-foot">
              <div className="mock-input">
                <span className="ps">genisys⟹</span>
                <span className="typed">{done ? "" : sc.task.slice(0, typed)}<i className="caret" /></span>
                <span className="send">↑</span>
              </div>
              <div className="hints">
                <span className="hint">New agent <kbd>Ctrl</kbd><kbd>Alt</kbd><kbd>N</kbd></span>
                <span className="hint">Actions <kbd>/</kbd></span>
                <span className="hint">Stop <kbd>Esc</kbd></span>
              </div>
            </div>
          </div>
        </div>

        {open && (
          <div className={`apps ${leaving ? "closing" : ""}`} key={run}>
            {sc.app === "agents" && <AgentWindows names={sc.agents!} />}
            {sc.app === "browser" && <Browser />}
            {sc.app === "music" && <Music low={shown >= 2} />}
            {sc.app === "music" && shown >= 2 && <VolumeFlyout />}
            {sc.app === "explorer" && <Explorer go={shown >= 2} />}
            {sc.app === "editor" && <Editor />}
          </div>
        )}

        <Taskbar app={sc.app} open={open && !leaving} />
      </div>
    </div>
  );
}
