// Admin charts: server-rendered SVG, no chart library and no client JS. Shapes are drawn in a 100x100 box stretched to the
// card (lines keep 2px via non-scaling-stroke); labels and the hover/tap tooltips are plain HTML so text stays sharp on phones.

export type Series = { key: string; label: string; color: string; values: number[] };

const fmt = (n: number) => n.toLocaleString("en-US");
const short = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

// about 6 date labels; one too close to the last date is skipped so they never touch
const showLabel = (i: number, n: number, every: number) => i === n - 1 || (i % every === 0 && n - 1 - i >= every);

// 0, 1, 2, 5, 10, 20, 50… so gridlines land on round numbers
export function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  return ([1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v) ?? 10 * p);
}

// Smooth line through the points (quadratic curves via midpoints), in the 100x100 box.
function line(values: number[], max: number) {
  const n = values.length;
  const pts = values.map((v, i) => [n === 1 ? 50 : (i / (n - 1)) * 100, 100 - (v / max) * 100] as const);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    d += ` Q${x0},${y0} ${(x0 + x1) / 2},${(y0 + y1) / 2}`;
    if (i === pts.length - 1) d += ` T${x1},${y1}`;
  }
  return d;
}

export function TrendChart({ days, series, height = 220 }: { days: string[]; series: Series[]; height?: number }) {
  const max = niceMax(Math.max(1, ...series.flatMap((s) => s.values)));
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((f) => Math.round(max * f));
  const every = Math.ceil(days.length / 6); // about 6 date labels, whatever the range
  return (
    <div className="ch" style={{ ["--h" as string]: `${height}px` }}>
      <div className="ch-y" aria-hidden="true">{ticks.map((t) => <span key={t}>{fmt(t)}</span>)}</div>
      <div className="ch-plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`ch-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={s.color} stopOpacity="0.28" />
                <stop offset="1" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {ticks.map((t) => <line key={t} className="ch-grid" x1="0" x2="100" y1={100 - (t / max) * 100} y2={100 - (t / max) * 100} />)}
          {series.map((s) => {
            const d = line(s.values, max);
            return (
              <g key={s.key}>
                <path d={`${d} L100,100 L0,100 Z`} fill={`url(#ch-${s.key})`} />
                <path d={d} fill="none" stroke={s.color} className="ch-line" />
              </g>
            );
          })}
        </svg>
        {/* one hover/tap column per day: guide line, dots and the numbers */}
        <div className="ch-hit" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((day, i) => (
            <div key={day} className={`ch-day${i < days.length / 3 ? " ch-l" : i > (days.length * 2) / 3 ? " ch-r" : ""}`} tabIndex={0}>
              {series.map((s) => <i key={s.key} className="ch-dot" style={{ bottom: `${(s.values[i] / max) * 100}%`, background: s.color }} />)}
              <div className="ch-tip" role="tooltip">
                <b>{short(day)}</b>
                {series.map((s) => <span key={s.key}><i style={{ background: s.color }} />{s.label} <b>{fmt(s.values[i])}</b></span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="ch-x" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((d, i) => <span key={d}>{showLabel(i, days.length, every) ? short(d) : ""}</span>)}
      </div>
    </div>
  );
}

export function BarChart({ days, values, label, color }: { days: string[]; values: number[]; label: string; color: string }) {
  const max = niceMax(Math.max(1, ...values));
  const every = Math.ceil(days.length / 6);
  return (
    <div className="ch ch-bars" style={{ ["--h" as string]: "140px" }}>
      <div className="ch-y" aria-hidden="true">{[max, max / 2, 0].map((t) => <span key={t}>{fmt(Math.round(t))}</span>)}</div>
      <div className="ch-plot">
        <div className="ch-hit" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((day, i) => (
            <div key={day} className={`ch-day${i < days.length / 3 ? " ch-l" : i > (days.length * 2) / 3 ? " ch-r" : ""}`} tabIndex={0}>
              <i className="ch-bar" style={{ height: `${(values[i] / max) * 100}%`, background: color }} />
              <div className="ch-tip" role="tooltip"><b>{short(day)}</b><span><i style={{ background: color }} />{label} <b>{fmt(values[i])}</b></span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="ch-x" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((d, i) => <span key={d}>{showLabel(i, days.length, every) ? short(d) : ""}</span>)}
      </div>
    </div>
  );
}

/** "+35%" / "−10%" / "new" against the previous period of the same length. */
export function Change({ now, before }: { now: number; before: number }) {
  if (!before) return now ? <span className="ch-up">new</span> : <span className="ch-flat">–</span>;
  const p = Math.round(((now - before) / before) * 100);
  return <span className={p > 0 ? "ch-up" : p < 0 ? "ch-down" : "ch-flat"}>{p > 0 ? "▲" : p < 0 ? "▼" : ""} {Math.abs(p)}%</span>;
}
