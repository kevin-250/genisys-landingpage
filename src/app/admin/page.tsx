/* eslint-disable @next/next/no-img-element -- tiny static SVG logo */
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { isAdmin } from "@/lib/admin";
import { appCounts, listErrors, listReports, listUsers, releases, stats, storageConnected, type AppError, type AppUser } from "@/lib/store";
import { githubReleases, LATEST_EXE } from "@/lib/github";
import { addRelease, clearAppErrors, login, logout, switchToGithub } from "./actions";

// Not linked from anywhere and kept out of search engines: reachable only by typing /admin.
// Installable on a phone ("Add to Home screen"): its own manifest, so only /admin becomes an app, not the public site.
export const metadata: Metadata = {
  title: "Admin · Genisys",
  robots: { index: false, follow: false },
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "Genisys Admin", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#ece8e2", viewportFit: "cover" };

const fmt = (n: number) => n.toLocaleString("en-US");
const date = (ms: number) => new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const when = (ms: number) => new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const ago = (ms: number) => {
  const m = Math.round((Date.now() - ms) / 60000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
};

const TABS = [
  { id: "overview", label: "Overview", icon: <path d="M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z" /> },
  { id: "users", label: "Users", icon: <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm0 2c-2.3 0-7 1.2-7 3.5V19h7v-2.5c0-.9.4-2 2.1-2.9A10 10 0 0 0 8 13zm8 0c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z" /> },
  { id: "reports", label: "Reports", icon: <path d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 9h12v2H6zm8 5H6v-2h8zm4-6H6V6h12z" /> },
  { id: "errors", label: "Errors", icon: <path d="M1 21h22L12 2zm12-3h-2v-2h2zm0-4h-2v-4h2z" /> },
  { id: "releases", label: "Releases", icon: <path d="M5 20h14v-2H5zM19 9h-4V3H9v6H5l7 7z" /> },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default async function Admin(props: PageProps<"/admin">) {
  const sp = await props.searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  if (!(await isAdmin())) return <Login error={one("error") === "1"} />;
  const asked = one("tab") === "home" ? "releases" : one("tab"); // old links
  const tab: Tab = TABS.find((t) => t.id === asked)?.id ?? "overview";
  const [errors, reports] = await Promise.all([listErrors(500), listReports(200)]);
  const badge: Partial<Record<Tab, number>> = { reports: reports.length, errors: groupErrors(errors).length };

  return (
    <div className="adm">
      <header className="adm-top">
        <a className="brand" href="/admin"><img src="/logo.svg" alt="" width="26" height="26" /> Genisys <small>admin</small></a>
        <nav className="adm-tabs" aria-label="Admin">
          {TABS.map((t) => (
            <a key={t.id} href={t.id === "overview" ? "/admin" : `/admin?tab=${t.id}`} aria-current={tab === t.id ? "page" : undefined}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{t.icon}</svg>
              <span>{t.label}</span>
              {!!badge[t.id] && <b className="adm-badge">{badge[t.id]! > 99 ? "99+" : badge[t.id]}</b>}
            </a>
          ))}
        </nav>
        <form action={logout}>
          <button className="adm-icon-btn" type="submit" aria-label="Log out" title="Log out">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l1.4-1.4-2.6-2.6H20v-2H8.8l2.6-2.6L10 7l-5 5zM4 5h8V3H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8v-2H4z" /></svg>
          </button>
        </form>
      </header>

      {!storageConnected && (
        <p className="adm-warn" role="status">
          Storage is not connected, so numbers and releases are kept in memory and will reset. Add Upstash Redis in Vercel → Storage.
        </p>
      )}

      <main className="adm-main">
        {tab === "users" ? <Users q={one("q")} />
          : tab === "reports" ? <Reports reports={reports} type={one("type")} />
          : tab === "errors" ? <Errors errors={errors} confirm={one("confirm") === "1"} />
          : tab === "releases" ? <Releases saved={one("saved") === "1"} error={one("error") === "1"} auto={one("auto") === "1"} />
          : <Overview errors={errors} reports={reports} />}
      </main>
    </div>
  );
}

function Login({ error }: { error: boolean }) {
  return (
    <main className="adm-login">
      <form action={login} className="card adm-card">
        <img src="/logo.svg" alt="" width="44" height="44" />
        <h1>Genisys admin</h1>
        <label htmlFor="pw">Password</label>
        <input id="pw" name="password" type="password" autoComplete="current-password" required autoFocus />
        {error && <p className="adm-err" role="alert">Wrong password. Try again.</p>}
        <button className="adm-btn" type="submit">Log in</button>
      </form>
    </main>
  );
}

function Head({ title, note, children }: { title: string; note?: string; children?: ReactNode }) {
  return (
    <div className="adm-head">
      <div>
        <h1 className="adm-h">{title}</h1>
        {note && <p className="adm-note">{note}</p>}
      </div>
      {children}
    </div>
  );
}

/* ---------- Overview ---------- */

async function Overview({ errors, reports }: { errors: AppError[]; reports: Awaited<ReturnType<typeof listReports>> }) {
  const [s, c, manual, gh] = await Promise.all([stats(14), appCounts(), releases(1), githubReleases().catch(() => null)]);
  const today = s.days[s.days.length - 1];
  const max = Math.max(1, ...s.days.map((d) => d.visits));
  const rate = s.visits ? Math.round((s.downloads / s.visits) * 100) : 0;
  const live = manual[0]?.version ?? gh?.[0]?.tag;
  const groups = groupErrors(errors).slice(0, 3);
  return (
    <>
      <Head title="Overview" note={live ? `Live version ${live} · ${manual[0] ? "manual link" : "automatic from GitHub"}` : undefined} />
      <div className="adm-kpis">
        <Stat label="App users" value={fmt(c.users)} />
        <Stat label="Downloads today" value={fmt(today.downloads)} />
        <Stat label="Visits today" value={fmt(today.visits)} />
        <Stat label="Visit → download" value={`${rate}%`} />
      </div>
      <p className="adm-alltime">All time: <b>{fmt(s.visits)}</b> visits · <b>{fmt(s.downloads)}</b> downloads</p>

      <section className="card adm-card" aria-label="Last 14 days">
        <div className="adm-card-h">
          <h2>Last 14 days</h2>
          <span className="adm-legend"><i className="adm-v" /> visits <i className="adm-d" /> downloads</span>
        </div>
        <div className="adm-bars">
          {s.days.map((d, i) => (
            <div key={d.day} className="adm-col" title={`${d.day}: ${d.visits} visits, ${d.downloads} downloads`}>
              <div className="adm-pair">
                <i className="adm-v" style={{ height: `${(d.visits / max) * 100}%` }} />
                <i className="adm-d" style={{ height: `${(d.downloads / max) * 100}%` }} />
              </div>
              <small className={i % 2 ? "adm-odd" : undefined}>{d.day.slice(8)}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="adm-two">
        <section className="card adm-card">
          <div className="adm-card-h"><h2>Latest reports</h2><a className="adm-more" href="/admin?tab=reports">All {reports.length}</a></div>
          {reports.length === 0 ? <p className="adm-note">Nothing yet.</p> : (
            <ul className="adm-mini">
              {reports.slice(0, 3).map((r, i) => (
                <li key={`${r.at}-${i}`}><span className={`adm-kind k-${r.type}`}>{r.type}</span><p>{r.message}</p><small>{ago(r.at)}</small></li>
              ))}
            </ul>
          )}
        </section>
        <section className="card adm-card">
          <div className="adm-card-h"><h2>Top errors</h2><a className="adm-more" href="/admin?tab=errors">All {groupErrors(errors).length}</a></div>
          {groups.length === 0 ? <p className="adm-note">No errors. 🎉</p> : (
            <ul className="adm-mini">
              {groups.map((g) => (
                <li key={g.key}><span className={`adm-kind k-${g.e.kind}`}>×{g.count}</span><p>{g.e.message}</p><small>{ago(g.last)}</small></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card adm-stat">
      <small>{label}</small>
      <b>{value}</b>
    </div>
  );
}

/* ---------- Users ---------- */

const cpuName = (c?: string) => c?.replace(/\(R\)|\(TM\)|CPU|Processor|@.*$/g, "").replace(/\s+/g, " ").trim();

async function Users({ q }: { q: string }) {
  const all = (await listUsers()).sort((a, b) => b.at - a.at);
  const needle = q.trim().toLowerCase();
  const users = needle ? all.filter((u) => `${u.email} ${u.name ?? ""}`.toLowerCase().includes(needle)) : all;
  return (
    <>
      <Head title={`Users · ${fmt(all.length)}`} note="Accounts from the app's first-run setup, newest first." />
      <form className="adm-search" role="search">
        <input type="hidden" name="tab" value="users" />
        <input name="q" type="search" defaultValue={q} placeholder="Search name or email" aria-label="Search users" />
        <button className="adm-btn adm-btn-soft" type="submit">Search</button>
      </form>
      {users.length === 0 ? (
        <p className="adm-note adm-empty">{needle ? `No user matches “${q}”.` : "No accounts yet."}</p>
      ) : (
        <ul className="adm-grid">{users.map((u) => <UserCard key={u.email} u={u} />)}</ul>
      )}
    </>
  );
}

function UserCard({ u }: { u: AppUser }) {
  const s = u.specs;
  const chips = [cpuName(s?.cpu), s?.ramGB && `${s.ramGB} GB RAM`, s?.disk?.freeGB != null && `${s.disk.freeGB} GB free`, s?.gpu, s?.screen, s?.os ?? u.os].filter(Boolean) as string[];
  return (
    <li className="card adm-user">
      <div className="adm-user-h">
        <span className="adm-avatar" aria-hidden="true">{(u.name || u.email)[0].toUpperCase()}</span>
        <div>
          <b>{u.name || "No name"}</b>
          <a href={`mailto:${u.email}`}>{u.email}</a>
        </div>
      </div>
      <dl className="adm-facts">
        <div><dt>Version</dt><dd>{u.version ? `v${u.version}` : "—"}</dd></div>
        <div><dt>Theme</dt><dd>{u.theme ?? "—"}</dd></div>
        <div><dt>Joined</dt><dd>{date(u.at)}</dd></div>
      </dl>
      {chips.length > 0 && <ul className="adm-chips" aria-label="PC">{chips.map((c) => <li key={c}>{c}</li>)}</ul>}
    </li>
  );
}

/* ---------- Reports ---------- */

const RTYPES = ["bug", "idea", "question", "other"];

function Reports({ reports, type }: { reports: Awaited<ReturnType<typeof listReports>>; type: string }) {
  const shown = RTYPES.includes(type) ? reports.filter((r) => r.type === type) : reports;
  const count = (t: string) => reports.filter((r) => r.type === t).length;
  return (
    <>
      <Head title={`Reports · ${fmt(reports.length)}`} note="Sent from the app's Report tab, newest first." />
      <nav className="adm-filter" aria-label="Filter reports">
        <a href="/admin?tab=reports" aria-current={!RTYPES.includes(type) ? "page" : undefined}>All {reports.length}</a>
        {RTYPES.map((t) => (
          <a key={t} href={`/admin?tab=reports&type=${t}`} aria-current={type === t ? "page" : undefined}>{t[0].toUpperCase() + t.slice(1)} {count(t)}</a>
        ))}
      </nav>
      {shown.length === 0 ? (
        <p className="adm-note adm-empty">No reports here yet.</p>
      ) : (
        <ul className="adm-feed">
          {shown.map((r, i) => (
            <li key={`${r.at}-${i}`} className="card">
              <div className="adm-feed-h">
                <span className={`adm-kind k-${r.type}`}>{r.type}</span>
                <small>{when(r.at)} · v{r.version ?? "?"}{r.name ? ` · ${r.name}` : ""}</small>
              </div>
              <Clamp text={r.message} />
              {r.email && <a className="adm-btn adm-btn-soft adm-reply" href={`mailto:${r.email}?subject=Re:%20your%20Genisys%20${r.type}`}>Reply to {r.email}</a>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// Long messages: first lines, the rest behind "Show more" (no script needed).
function Clamp({ text }: { text: string }) {
  if (text.length <= 420) return <p className="adm-msg">{text}</p>;
  return (
    <details className="adm-clamp">
      <summary><p className="adm-msg">{text.slice(0, 380)}…</p><span>Show more</span></summary>
      <p className="adm-msg">{text}</p>
    </details>
  );
}

/* ---------- Errors ---------- */

// The same bug from many users or many times becomes one row with a count.
function groupErrors(errors: AppError[]) {
  const m = new Map<string, { key: string; e: AppError; count: number; first: number; last: number; versions: Set<string> }>();
  for (const e of errors) {
    const key = `${e.kind}|${e.message}`;
    const g = m.get(key) ?? { key, e, count: 0, first: e.at, last: e.at, versions: new Set<string>() };
    g.count++; g.first = Math.min(g.first, e.at); g.last = Math.max(g.last, e.at);
    if (e.version) g.versions.add(e.version);
    if (!g.e.stack && e.stack) g.e = e;
    m.set(key, g);
  }
  return [...m.values()].sort((a, b) => b.last - a.last);
}

function Errors({ errors, confirm }: { errors: AppError[]; confirm: boolean }) {
  const groups = groupErrors(errors);
  return (
    <>
      <Head title={`Errors · ${fmt(groups.length)}`} note={`${fmt(errors.length)} reports from users with error reports on, grouped by message. User folders are removed before sending.`}>
        {errors.length > 0 && (confirm ? (
          <form action={clearAppErrors} className="adm-confirm">
            <span>Delete all {errors.length}?</span>
            <button className="adm-btn adm-btn-danger" type="submit">Yes, clear</button>
            <a className="adm-btn adm-btn-soft" href="/admin?tab=errors">Cancel</a>
          </form>
        ) : <a className="adm-btn adm-btn-soft" href="/admin?tab=errors&confirm=1">Clear all</a>)}
      </Head>
      {groups.length === 0 ? (
        <p className="adm-note adm-empty">No errors reported. 🎉</p>
      ) : (
        <ul className="adm-feed">
          {groups.map((g) => (
            <li key={g.key} className="card">
              <div className="adm-feed-h">
                <span className={`adm-kind k-${g.e.kind}`}>{g.e.kind}</span>
                <b className="adm-count">×{g.count}</b>
                <small>last {ago(g.last)}{g.count > 1 ? ` · first ${date(g.first)}` : ""}{g.versions.size ? ` · v${[...g.versions].slice(0, 4).join(", v")}` : ""}</small>
              </div>
              <p className="adm-msg">{g.e.message}</p>
              {g.e.stack && <details><summary>Stack trace</summary><pre>{g.e.stack}</pre></details>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ---------- Releases ---------- */

async function Releases({ saved, error, auto }: { saved: boolean; error: boolean; auto: boolean }) {
  const [list, gh] = await Promise.all([releases(20), githubReleases().catch(() => null)]);
  const override = list[0];
  const [newest, ...older] = gh ?? [];
  return (
    <>
      <Head title="Releases" note="The site's Download button always serves the newest GitHub release, unless a manual link is set below." />
      {auto && <p className="adm-ok" role="status">Back on automatic: the homepage uses the newest GitHub release.</p>}
      {saved && <p className="adm-ok" role="status">Saved. The homepage now downloads this release instead of the automatic one.</p>}

      {gh === null ? (
        <p className="card adm-card adm-err">Couldn&apos;t reach GitHub right now. Downloads still work through the <a href={LATEST_EXE}>always-latest link</a>.</p>
      ) : !newest ? (
        <p className="card adm-card adm-note">No releases on GitHub yet. Publish one with <code>npm run release</code> in the app.</p>
      ) : (
        <section className="card adm-card adm-hero">
          <div className="adm-card-h">
            <h2>{newest.tag} {!override && <span className="adm-live">Live on site</span>}</h2>
            <small>{date(Date.parse(newest.at))}</small>
          </div>
          <p className="adm-big">{fmt(newest.downloads)} <small>installer downloads on GitHub</small></p>
          <div className="adm-links">
            {newest.exe && <a className="adm-btn" href={newest.exe} rel="noopener noreferrer">Installer</a>}
            <a className="adm-btn adm-btn-soft" href={newest.url} rel="noopener noreferrer">Release page</a>
          </div>
        </section>
      )}

      {older.length > 0 && (
        <section className="card adm-card">
          <div className="adm-card-h"><h2>Older versions</h2></div>
          <ul className="adm-rel">
            {older.map((r) => (
              <li key={r.tag}>
                <a href={r.url} rel="noopener noreferrer"><b>{r.tag}</b></a>
                <small>{date(Date.parse(r.at))}</small>
                <small>{fmt(r.downloads)} downloads</small>
              </li>
            ))}
          </ul>
        </section>
      )}

      {override && (
        <section className="card adm-card adm-override">
          <div className="adm-card-h"><h2>Manual link in use: {override.version} <span className="adm-live">Live on site</span></h2></div>
          <div className="adm-links">
            <a className="adm-btn adm-btn-soft" href={override.exe} rel="noopener noreferrer">Installer</a>
            {override.zip && <a className="adm-btn adm-btn-soft" href={override.zip} rel="noopener noreferrer">Portable</a>}
          </div>
          <form action={switchToGithub}><button className="adm-btn" type="submit">Go back to automatic GitHub releases</button></form>
        </section>
      )}

      <details className="card adm-card adm-adv" open={error}>
        <summary>Use a different link (advanced)</summary>
        <form action={addRelease} className="adm-form">
          <p className="adm-note">A link here replaces the automatic one on the homepage until you switch back. GitHub links only.</p>
          <label>Version<input name="version" placeholder="v1.2.0" required maxLength={40} /></label>
          <label>Installer link (.exe)<input name="exe" type="url" placeholder="https://github.com/…/Genisys-Setup.exe" required /></label>
          <label>Portable link (.zip, optional)<input name="zip" type="url" placeholder="https://github.com/…/Genisys.zip" /></label>
          {error && <p className="adm-err" role="alert">Add a version, and use links that start with https://github.com/.</p>}
          <button className="adm-btn" type="submit">Use this link</button>
        </form>
      </details>
    </>
  );
}
