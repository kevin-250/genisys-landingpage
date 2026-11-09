/* eslint-disable @next/next/no-img-element -- tiny static SVG logo */
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { appCounts, listErrors, listReports, listUsers, releases, stats, storageConnected } from "@/lib/store";
import { githubReleases, LATEST_EXE } from "@/lib/github";
import { addRelease, clearAppErrors, login, logout, switchToGithub } from "./actions";

// Not linked from anywhere and kept out of search engines: reachable only by typing /admin.
export const metadata: Metadata = { title: "Admin · Genisys", robots: { index: false, follow: false } };

const fmt = (n: number) => n.toLocaleString("en-US");
const date = (ms: number) => new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default async function Admin(props: PageProps<"/admin">) {
  const sp = await props.searchParams;
  if (!(await isAdmin())) return <Login error={sp.error === "1"} />;
  const TABS = ["dashboard", "home", "users", "errors", "reports"] as const;
  const tab = TABS.find((t) => t === sp.tab) ?? "dashboard";

  return (
    <div className="adm">
      <header className="adm-top">
        <span className="brand"><img src="/logo.svg" alt="" width="26" height="26" /> Genisys <small>admin</small></span>
        <nav className="adm-tabs" aria-label="Admin">
          {TABS.map((t) => (
            <a key={t} href={t === "dashboard" ? "/admin" : `/admin?tab=${t}`} aria-current={tab === t ? "page" : undefined}>
              {t[0].toUpperCase() + t.slice(1)}
            </a>
          ))}
        </nav>
        <form action={logout}><button className="adm-btn adm-btn-soft" type="submit">Log out</button></form>
      </header>

      {!storageConnected && (
        <p className="adm-warn" role="status">
          Storage is not connected, so numbers and releases are kept in memory and will reset. Add Upstash Redis in Vercel → Storage.
        </p>
      )}

      <main className="adm-main">
        {tab === "home" ? <Home saved={sp.saved === "1"} error={sp.error === "1"} auto={sp.auto === "1"} />
          : tab === "users" ? <Users />
          : tab === "errors" ? <Errors />
          : tab === "reports" ? <Reports />
          : <Dashboard />}
      </main>
    </div>
  );
}

function Login({ error }: { error: boolean }) {
  return (
    <main className="adm-login">
      <form action={login} className="card adm-card">
        <img src="/logo.svg" alt="" width="40" height="40" />
        <h1>Genisys admin</h1>
        <label htmlFor="pw">Password</label>
        <input id="pw" name="password" type="password" autoComplete="current-password" required autoFocus />
        {error && <p className="adm-err" role="alert">Wrong password. Try again.</p>}
        <button className="adm-btn" type="submit">Log in</button>
      </form>
    </main>
  );
}

async function Dashboard() {
  const [s, c] = await Promise.all([stats(14), appCounts()]);
  const today = s.days[s.days.length - 1];
  const max = Math.max(1, ...s.days.map((d) => d.visits));
  const rate = s.visits ? Math.round((s.downloads / s.visits) * 100) : 0;
  return (
    <>
      <h2 className="adm-h">Dashboard</h2>
      <div className="adm-stats">
        <Stat label="App users" value={fmt(c.users)} />
        <Stat label="Visits (all time)" value={fmt(s.visits)} />
        <Stat label="Downloads (all time)" value={fmt(s.downloads)} />
        <Stat label="Visits today" value={fmt(today.visits)} />
        <Stat label="Downloads today" value={fmt(today.downloads)} />
        <Stat label="Visit → download" value={`${rate}%`} />
      </div>
      <section className="card adm-card adm-chart" aria-label="Last 14 days">
        <div className="adm-chart-h">
          <b>Last 14 days</b>
          <span className="adm-legend"><i className="adm-v" /> visits <i className="adm-d" /> downloads</span>
        </div>
        <div className="adm-bars">
          {s.days.map((d) => (
            <div key={d.day} className="adm-col" title={`${d.day}: ${d.visits} visits, ${d.downloads} downloads`}>
              <div className="adm-pair">
                <i className="adm-v" style={{ height: `${(d.visits / max) * 100}%` }} />
                <i className="adm-d" style={{ height: `${(d.downloads / max) * 100}%` }} />
              </div>
              <small>{d.day.slice(8)}</small>
            </div>
          ))}
        </div>
      </section>
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

async function Home({ saved, error, auto }: { saved: boolean; error: boolean; auto: boolean }) {
  const [list, gh] = await Promise.all([releases(20), githubReleases().catch(() => null)]);
  const override = list[0];
  return (
    <>
      <h2 className="adm-h">Home · download links</h2>

      <section className="card adm-card">
        <div className="adm-chart-h">
          <b>GitHub releases (automatic)</b>
          {!override && <span className="adm-live">Live on site</span>}
        </div>
        <p className="adm-note">
          Publish with <code>npm run release</code> in the app and the homepage Download buttons pick up the newest installer by
          themselves, through <a href={LATEST_EXE}>this always-latest link</a>. The list refreshes every 5 minutes.
        </p>
        {auto && <p className="adm-ok" role="status">Back on automatic: the homepage now uses the newest GitHub release.</p>}
        {gh === null ? (
          <p className="adm-err">Couldn&apos;t reach GitHub right now. Downloads still work through the always-latest link.</p>
        ) : gh.length === 0 ? (
          <p className="adm-note">No releases on GitHub yet. Until the first one, the Download buttons lead to a GitHub 404.</p>
        ) : (
          <ul className="adm-list adm-gh">
            {gh.map((r, i) => (
              <li key={r.tag}>
                <div>
                  <b>{r.tag}</b> {i === 0 && <small className="adm-tag">newest</small>}
                  <small>{date(Date.parse(r.at))} · {fmt(r.downloads)} installer downloads on GitHub</small>
                </div>
                <div className="adm-links">
                  {r.exe && <a href={r.exe} rel="noopener noreferrer">Installer</a>}
                  <a href={r.url} rel="noopener noreferrer">Release page</a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h3 className="adm-sub">Manual override (optional)</h3>
      <form action={addRelease} className="card adm-card adm-form">
        <p className="adm-note">Only if you need to: a link added here replaces the automatic one on the homepage until you switch back.</p>
        <label>Version<input name="version" placeholder="v1.2.0" required maxLength={40} /></label>
        <label>Installer link (.exe)<input name="exe" type="url" placeholder="https://github.com/you/repo/releases/download/v1.2.0/Genisys-Setup.exe" required /></label>
        <label>Portable link (.zip, optional)<input name="zip" type="url" placeholder="https://github.com/you/repo/releases/download/v1.2.0/Genisys.zip" /></label>
        {error && <p className="adm-err" role="alert">Add a version, and use links that start with https://github.com/.</p>}
        {saved && <p className="adm-ok" role="status">Saved. The homepage now downloads this release instead of the automatic one.</p>}
        <button className="adm-btn" type="submit">Use this link</button>
      </form>

      {override && (
        <>
          <ul className="adm-list" style={{ marginTop: 12 }}>
            {list.map((r, i) => (
              <li key={`${r.at}-${i}`} className="card">
                <div>
                  <b>{r.version}</b> {i === 0 && <span className="adm-live">Live on site</span>}
                  <small>{date(r.at)}</small>
                </div>
                <div className="adm-links">
                  <a href={r.exe} rel="noopener noreferrer">Installer</a>
                  {r.zip && <a href={r.zip} rel="noopener noreferrer">Portable</a>}
                </div>
              </li>
            ))}
          </ul>
          <form action={switchToGithub} style={{ marginTop: 12 }}>
            <button className="adm-btn adm-btn-soft" type="submit">Go back to automatic GitHub releases</button>
          </form>
        </>
      )}
    </>
  );
}

const when = (ms: number) => new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

async function Users() {
  const users = await listUsers();
  return (
    <>
      <h2 className="adm-h">Users · {fmt(users.length)}</h2>
      <p className="adm-note">Accounts created in the app&apos;s first-run setup. One row per email.</p>
      {users.length === 0 ? (
        <p className="adm-note adm-empty">No accounts yet.</p>
      ) : (
        <div className="card adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Email</th><th>Name</th><th>Theme</th><th>Version</th><th>PC</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email}>
                  <td><a href={`mailto:${u.email}`}>{u.email}</a></td>
                  <td>{u.name ?? "—"}</td>
                  <td>{u.theme ?? "—"}</td>
                  <td>{u.version ?? "—"}</td>
                  <td title={u.specs ? [u.specs.os, u.specs.gpu, u.specs.screen].filter(Boolean).join(" · ") : undefined}>
                    {u.specs ? [u.specs.cpu?.replace(/\(R\)|\(TM\)|CPU|Processor|@.*$/g, "").replace(/\s+/g, " ").trim(), u.specs.ramGB && `${u.specs.ramGB} GB RAM`, u.specs.disk?.freeGB != null && `${u.specs.disk.freeGB} GB free`].filter(Boolean).join(" · ") : "—"}
                  </td>
                  <td>{when(u.at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

async function Errors() {
  const errors = await listErrors(200);
  return (
    <>
      <div className="adm-row">
        <h2 className="adm-h">Errors · {fmt(errors.length)}</h2>
        {errors.length > 0 && (
          <form action={clearAppErrors}><button className="adm-btn adm-btn-soft" type="submit">Clear all</button></form>
        )}
      </div>
      <p className="adm-note">Errors the app caught, from users who left error reports on. User folders are removed before sending. Newest first, last 500 kept.</p>
      {errors.length === 0 ? (
        <p className="adm-note adm-empty">No errors reported. 🎉</p>
      ) : (
        <ul className="adm-list adm-feed">
          {errors.map((e, i) => (
            <li key={`${e.at}-${i}`} className="card">
              <div className="adm-feed-h">
                <span className={`adm-kind k-${e.kind}`}>{e.kind}</span>
                <small>{when(e.at)} · v{e.version ?? "?"} · {e.os ?? "?"}</small>
              </div>
              <p className="adm-msg">{e.message}</p>
              {e.stack && (
                <details><summary>Stack trace</summary><pre>{e.stack}</pre></details>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

async function Reports() {
  const reports = await listReports(200);
  return (
    <>
      <h2 className="adm-h">Reports · {fmt(reports.length)}</h2>
      <p className="adm-note">Messages users sent from the app&apos;s Report tab. Newest first.</p>
      {reports.length === 0 ? (
        <p className="adm-note adm-empty">No reports yet.</p>
      ) : (
        <ul className="adm-list adm-feed">
          {reports.map((r, i) => (
            <li key={`${r.at}-${i}`} className="card">
              <div className="adm-feed-h">
                <span className={`adm-kind k-${r.type}`}>{r.type}</span>
                <small>
                  {when(r.at)} · v{r.version ?? "?"}
                  {r.name ? ` · ${r.name}` : ""}
                </small>
                {r.email && <a className="adm-reply" href={`mailto:${r.email}?subject=Re:%20your%20Genisys%20${r.type}`}>Reply to {r.email}</a>}
              </div>
              <p className="adm-msg">{r.message}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
