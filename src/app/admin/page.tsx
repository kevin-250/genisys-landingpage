/* eslint-disable @next/next/no-img-element -- tiny static SVG logo */
import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin";
import { releases, stats, storageConnected } from "@/lib/store";
import { githubReleases, LATEST_EXE } from "@/lib/github";
import { addRelease, login, logout, switchToGithub } from "./actions";

// Not linked from anywhere and kept out of search engines: reachable only by typing /admin.
export const metadata: Metadata = { title: "Admin · Genisys", robots: { index: false, follow: false } };

const fmt = (n: number) => n.toLocaleString("en-US");
const date = (ms: number) => new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default async function Admin(props: PageProps<"/admin">) {
  const sp = await props.searchParams;
  if (!(await isAdmin())) return <Login error={sp.error === "1"} />;
  const tab = sp.tab === "home" ? "home" : "dashboard";

  return (
    <div className="adm">
      <header className="adm-top">
        <span className="brand"><img src="/logo.svg" alt="" width="26" height="26" /> Genisys <small>admin</small></span>
        <nav className="adm-tabs" aria-label="Admin">
          <a href="/admin" aria-current={tab === "dashboard" ? "page" : undefined}>Dashboard</a>
          <a href="/admin?tab=home" aria-current={tab === "home" ? "page" : undefined}>Home</a>
        </nav>
        <form action={logout}><button className="adm-btn adm-btn-soft" type="submit">Log out</button></form>
      </header>

      {!storageConnected && (
        <p className="adm-warn" role="status">
          Storage is not connected, so numbers and releases are kept in memory and will reset. Add Upstash Redis in Vercel → Storage.
        </p>
      )}

      <main className="adm-main">{tab === "home" ? <Home saved={sp.saved === "1"} error={sp.error === "1"} auto={sp.auto === "1"} /> : <Dashboard />}</main>
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
  const s = await stats(14);
  const today = s.days[s.days.length - 1];
  const max = Math.max(1, ...s.days.map((d) => d.visits));
  const rate = s.visits ? Math.round((s.downloads / s.visits) * 100) : 0;
  return (
    <>
      <h2 className="adm-h">Dashboard</h2>
      <div className="adm-stats">
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
