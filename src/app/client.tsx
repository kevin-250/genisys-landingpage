"use client";

import { useEffect, useId, useRef, useState } from "react";
import type React from "react";

export type DownloadLinks = { exe?: string; zip?: string };

// Counts a visit for the admin dashboard (downloads are counted by /download on the server).
const ping = (type: "visit") => {
  try {
    navigator.sendBeacon("/api/track", JSON.stringify({ type }));
  } catch {}
};

/** Counts one visit per browser session. */
export function TrackVisit() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("genisys-visit")) return;
      sessionStorage.setItem("genisys-visit", "1");
    } catch {}
    ping("visit");
  }, []);
  return null;
}

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function WindowsIcon() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
      <path d="M1 2.6 6.6 1.8v5.5H1zM7.4 1.7 15 .6v6.7H7.4zM1 8.1h5.6v5.5L1 12.8zM7.4 8.1H15v6.8l-7.6-1.1z" />
    </svg>
  );
}

/** Split download button: main link = installer, caret = disclosure with the other builds. */
export function DownloadButton({ size = "lg", links }: { size?: "lg" | "sm"; links: DownloadLinks }) {
  const exe = links.exe ?? "#"; // "#" until a release is published in /admin
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const caret = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        caret.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={`dl dl-${size}`} ref={box}>
      <a className="dl-main" href={exe}>
        <WindowsIcon />
        <span>{size === "lg" ? "Download for Windows" : "Download"}</span>
      </a>
      <button
        ref={caret}
        type="button"
        className="dl-caret"
        aria-label="More download options"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <ul className="dl-menu" id={id} hidden={!open}>
        <li>
          <a href={exe} onClick={() => setOpen(false)}>
            <b>Installer</b>
            <small>.exe · Windows 10 and 11</small>
          </a>
        </li>
        {links.zip && (
          <li>
            <a href={links.zip} onClick={() => setOpen(false)}>
              <b>Portable</b>
              <small>.zip · no install, unzip and run</small>
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}

export function ThemeToggle() {
  const flip = () => {
    const d = document.documentElement;
    const next = d.dataset.theme === "light" ? "dark" : "light";
    d.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  return (
    <button type="button" className="ico" onClick={flip} aria-label="Switch light or dark theme" title="Light / dark">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16z" className="fill" />
      </svg>
    </button>
  );
}

/** Fade-and-rise for every `.reveal` element as it scrolls in. CSS turns it off for reduced motion. */
export function Reveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, []);
  return null;
}

/** Port of the app's dot grid (my-app/src/dots.js): faint breathing grid plus drifting dots. */
export function Dots() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const GAP = 20;
    const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]];
    type M = { x: number; y: number; vx: number; vy: number; age: number; life: number; r: number; hot: boolean };
    let w = 0, h = 0, raf = 0, last = 0, frame = 0, rgb = "255,255,255";
    let grid: { x: number; y: number; p: number; s: number }[] = [];
    let movers: M[] = [];
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const colors = () => {
      rgb = document.documentElement.dataset.theme !== "light" ? "255,255,255" : "20,20,20";
    };
    const spawn = (m = {} as M) => {
      const d = DIRS[(Math.random() * DIRS.length) | 0], sp = rnd(7, 18);
      m.x = Math.floor(Math.random() * ((w / GAP) | 0)) * GAP + GAP / 2;
      m.y = Math.floor(Math.random() * ((h / GAP) | 0)) * GAP + GAP / 2;
      m.vx = d[0] * sp; m.vy = d[1] * sp;
      m.age = 0; m.life = rnd(4, 9); m.r = rnd(1.1, 2.1); m.hot = Math.random() < 0.35;
      return m;
    };
    const draw = (t: number, dt: number) => {
      if (!(frame++ % 30)) colors();
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = `rgba(${rgb},0.075)`;
      for (const d of grid) {
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(t * 0.0008 * d.s + d.p);
        ctx.fillRect(d.x - 0.8, d.y - 0.8, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
      for (const m of movers) {
        m.age += dt; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.age >= m.life || m.x < -10 || m.y < -10 || m.x > w + 10 || m.y > h + 10) { spawn(m); continue; }
        const k = Math.sin((m.age / m.life) * Math.PI);
        ctx.fillStyle = `rgba(${rgb},${(m.hot ? 0.5 : 0.25) * k})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
      }
    };
    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      grid = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) grid.push({ x, y, p: Math.random() * 6.283, s: 0.2 + Math.random() * 0.5 });
      movers = Array.from({ length: Math.max(24, Math.round((w * h) / 4200)) }, () => { const m = spawn(); m.age = Math.random() * m.life; return m; });
      colors();
      draw(0, 0);
    };
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 40 || document.hidden) return; // ~25fps, idle in background tabs
      const dt = Math.min(0.1, (t - last) / 1000); last = t;
      draw(t, dt);
    };
    // Redraw the still frame on theme change when animation is off.
    const mo = new MutationObserver(() => { colors(); if (!raf) draw(0, 0); });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    build();
    addEventListener("resize", build);
    if (!reduced()) raf = requestAnimationFrame((t) => { last = t; loop(t); });
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", build); mo.disconnect(); };
  }, []);
  return <canvas ref={ref} className="dots" aria-hidden="true" />;
}

/** Before/after slider: drag (or arrow keys) to reveal `after` over `before`. */
export function Split({ before, after, label }: { before: React.ReactNode; after: React.ReactNode; label: string }) {
  const [x, setX] = useState(50);
  return (
    <div className="split" style={{ "--x": `${x}%` } as React.CSSProperties}>
      <div className="split-a">{before}</div>
      <div className="split-b" aria-hidden="true">{after}</div>
      <i className="split-line" aria-hidden="true" />
      <input type="range" min="8" max="92" value={x} onChange={(e) => setX(+e.target.value)} aria-label={label} />
    </div>
  );
}
