/* eslint-disable @next/next/no-img-element -- tiny static SVG logo, no optimisation needed */
import type { CSSProperties } from "react";
import { connection } from "next/server";
import { latestRelease } from "@/lib/store";
import { DownloadButton, Dots, Reveal, Split, ThemeToggle, TrackVisit } from "./client";
import { AppMock } from "./desktop";

const F = {
  bar: { title: "A bar over everything", body: "Press Alt+Space in any app and a small command bar pops up, ready for you to type." },
  typos: { title: "Typos? Still found.", body: "Type “resme pdf” and it still digs up resume.pdf. No exact names needed." },
  does: { title: "It actually does it", body: "No list of steps to follow yourself. It opens the app, the folder or the page for you." },
  agents: { title: "Many agents at once", body: "/agent 3 opens three agent windows, and /agent 2 [task one, task two] gives each one its own job." },
  memory: { title: "Remembers what worked", body: "When a command works, Genisys keeps the solution, so the next time is faster." },
  deletes: { title: "Deletes, but carefully", body: "It asks before deleting anything, and you can undo a delete if you change your mind." },
};

const EXAMPLES = [
  { group: "Files & folders", items: ["open my downloads folder", "find resme pdf"] },
  { group: "Watch & listen", items: ["mouse trap episode 3", "open spotify"] },
  { group: "Web", items: ["search cheap flights to lisbon", "/browser best laptops under $800"] },
  { group: "Agents", items: ["/agent 3", "/agent 2 [plan a weekend in paris, find a cheap hotel there]"] },
];
const ALL_EXAMPLES = EXAMPLES.flatMap((g) => g.items);

const FAQ = [
  { q: "Is it free?", a: "[FREE? confirm]" },
  { q: "What data leaves my PC?", a: "[DATA NOTE: confirm]" },
  { q: "Which Windows versions does it run on?", a: "Windows 10 and Windows 11." },
  {
    q: "How do I stop it or uninstall it?",
    a: "Press Esc to stop a task while it's running. To remove Genisys completely, go to Settings → Apps → Installed apps, find Genisys and click Uninstall.",
  },
  {
    q: "Is it safe to let it delete files?",
    a: "It always asks before it deletes anything. And if you say yes and then regret it, the delete can be undone.",
  },
  { q: "Does it work offline?", a: "[OFFLINE: confirm]" },
];

// Stagger helper: delay for reveal transitions and for the mini-UI animations inside a card.
const d = (i: number) => ({ "--d": `${i * 90}ms` }) as CSSProperties;
const step = (i: number) => ({ "--i": i }) as CSSProperties;

function Logo({ size = 28 }: { size?: number }) {
  return <img src="/logo.svg" alt="" width={size} height={size} className="logo" />;
}

const Check = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

export default async function Home() {
  await connection(); // render per request so a release published in /admin shows up right away
  const rel = await latestRelease().catch(() => null);
  const dl = { exe: rel?.exe, zip: rel?.zip };
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <Dots />
      <Reveal />
      <TrackVisit />

      <header className="nav">
        <div className="wrap nav-in">
          <a className="brand" href="#top" aria-label="Genisys home">
            <Logo />
            <span>Genisys</span>
          </a>
          <nav aria-label="Main" className="nav-links">
            <a href="#features">Features</a>
            <a href="#examples">Examples</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-end">
            <ThemeToggle />
            <DownloadButton size="sm" links={dl} />
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero wrap" id="top">
          <p className="eyebrow reveal">
            <span className="dot-live" aria-hidden="true" /> Alt+Space, then just type
          </p>
          <h1 className="reveal">
            Type it.
            <br />
            <span className="soft">Your PC does it.</span>
          </h1>
          <p className="lede reveal">
            Open apps, find that file you half remember, search the web or start an episode. One line, no digging through folders.
          </p>
          <div className="hero-cta reveal">
            <DownloadButton links={dl} />
          </div>
          <p className="fine reveal">
            Windows 10 and 11 · [FREE? confirm] · [ACCOUNT NEEDED? confirm] · [DATA NOTE: confirm]
          </p>
        </section>

        <section className="preview wrap reveal" aria-label="Genisys app preview">
          <p className="sr-only">
            A demo of a Windows desktop. Tasks are typed into Genisys, and it opens the right app for each one: three agent windows, a browser search, a music player, File Explorer moving PDFs, and a code editor writing a script.
          </p>
          <AppMock />
        </section>

        {/* 1 · Two big tiles: the bar + it does the task */}
        <section className="section wrap" id="features" aria-labelledby="f-h">
          <div className="head-c reveal">
            <h2 id="f-h" className="grad">Plain words in, finished work out.</h2>
            <p className="sub">Like a spotlight bar that can actually do the task, not just point you to it.</p>
          </div>
          <div className="duo">
            <article className="tile tile-brand reveal reveal-lg">
              <h3>
                A bar over <span className="pw">everything</span>
              </h3>
              <p>{F.bar.body}</p>
              <div className="ghost" aria-hidden="true"><i /><i /><i /><i /><i /></div>
              <div className="cmdbar" aria-hidden="true">
                <img src="/logo.svg" alt="" width="20" height="20" />
                <span className="typing" style={{ "--n": 24 } as CSSProperties}>open my downloads folder</span>
                <i className="caret" />
                <span className="keys-sm"><kbd>Enter</kbd></span>
              </div>
              <div className="keyhint" aria-hidden="true"><kbd>Alt</kbd><span>+</span><kbd>Space</kbd></div>
            </article>

            <article className="tile tile-soft reveal reveal-lg" style={d(1)}>
              <h3>
                It <span className="pw pw-ok"><Check /> actually does</span> it
              </h3>
              <p>{F.does.body}</p>
              <div className="steps" aria-hidden="true">
                <div className="bubble">open my downloads folder</div>
                <div className="st" style={step(0)}><span className="st-k">$</span> find_folder <em>downloads</em></div>
                <div className="st" style={step(1)}><span className="st-k">$</span> open_folder <em>C:\Users\you\Downloads</em></div>
                <div className="st st-ok" style={step(2)}><Check /> Downloads is open</div>
              </div>
            </article>
          </div>
        </section>

        {/* 2 · Wide stage: typo-tolerant search */}
        <section className="section wrap" aria-labelledby="t-h">
          <div className="head-c reveal">
            <h2 id="t-h" className="grad">{F.typos.title}</h2>
            <p className="sub">{F.typos.body}</p>
          </div>
          <div className="stage reveal reveal-lg">
            <div className="finder" aria-hidden="true">
              <div className="finder-q">
                <svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m20 20-4.5-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                <span className="typing" style={{ "--n": 9 } as CSSProperties}>resme pdf</span>
                <i className="caret" />
              </div>
              <ul className="finder-r">
                <li style={step(0)} className="hit">
                  <i className="fi pdf" />
                  <span className="fname"><span><b>res</b>u<b>me</b>.<b>pdf</b></span><small>Documents › Jobs</small></span>
                  <span className="open">Open <kbd>Enter</kbd></span>
                </li>
                <li style={step(1)}>
                  <i className="fi pdf" />
                  <span className="fname"><span><b>res</b>u<b>me</b>_2025.<b>pdf</b></span><small>Documents › Old stuff</small></span>
                </li>
                <li style={step(2)}>
                  <i className="fi" />
                  <span className="fname"><span><b>res</b>u<b>me</b> notes.docx</span><small>Desktop</small></span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 3 · Three cards with a mini visual each */}
        <section className="section wrap" aria-labelledby="m-h">
          <div className="head-c reveal">
            <h2 id="m-h" className="grad">A few more tricks.</h2>
          </div>
          <div className="trio">
            <article className="t-card reveal" style={d(0)}>
              <div className="t-vis vis-agents" aria-hidden="true">
                <code className="t-chip">/agent 3</code>
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`mw mw${n}`} style={step(n - 1)}>
                    <span className="tl"><i className="r" /><i className="y" /><i className="g" /></span>
                    <b>agent {n}</b>
                    <i className="bar" /><i className="bar short" />
                  </div>
                ))}
              </div>
              <p><b>{F.agents.title}.</b> {F.agents.body}</p>
            </article>

            <article className="t-card reveal" style={d(1)}>
              <div className="t-vis vis-split">
                <Split
                  label="Compare the first time a command runs with the next time"
                  before={
                    <div className="sp-pane">
                      <span className="sp-lab">First time</span>
                      <span className="ln">› thinking</span>
                      <span className="ln">$ find downloads</span>
                      <span className="ln">$ 3 matches</span>
                      <span className="ln">$ open Downloads</span>
                      <span className="ln ok">✓ done</span>
                    </div>
                  }
                  after={
                    <div className="sp-pane sp-pane-b">
                      <span className="sp-lab">Next time</span>
                      <span className="ln mem">remembered</span>
                      <span className="ln">$ open Downloads</span>
                      <span className="ln ok">✓ done</span>
                    </div>
                  }
                />
              </div>
              <p><b>{F.memory.title}.</b> {F.memory.body}</p>
            </article>

            <article className="t-card reveal" style={d(2)}>
              <div className="t-vis vis-del" aria-hidden="true">
                <div className="dlg">
                  <b>Delete 3 files?</b>
                  <span>old_notes.txt, draft.docx, copy (2).png</span>
                  <div className="dlg-btns"><span>Skip</span><span className="run">Delete</span></div>
                </div>
                <div className="toast">
                  <Check /> 3 files deleted <span className="undo">Undo</span>
                </div>
              </div>
              <p><b>{F.deletes.title}.</b> {F.deletes.body}</p>
            </article>
          </div>
        </section>

        {/* 4 · Try saying: ticker on the left, rows on the right */}
        <section className="section wrap" id="examples" aria-labelledby="e-h">
          <div className="tryout">
            <div className="ticker reveal reveal-lg" aria-hidden="true">
              <div className="ticker-col">
                {[...ALL_EXAMPLES, ...ALL_EXAMPLES].map((t, i) => (
                  <span key={i} className="tk"><b>⟹</b> {t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="reveal">
                <p className="kicker">Try saying</p>
                <h2 id="e-h" className="grad">Type it like you&apos;d text a friend.</h2>
                <p className="sub">No special syntax. Typos welcome.</p>
              </div>
              <ul className="rows">
                {EXAMPLES.map((g, i) => (
                  <li className="reveal" key={g.group} style={d(i)}>
                    <span className="r-big">{g.group}</span>
                    <span className="r-cmds">
                      {g.items.map((t) => <code key={t}>{t}</code>)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 5 · Story */}
        <section className="section wrap narrow" aria-labelledby="s-h">
          <figure className="story reveal reveal-lg">
            <p className="kicker" id="s-h">Who makes this</p>
            <blockquote>
              <p className="story-h">One developer, one very specific annoyance.</p>
              <p>
                Hi, I&apos;m [YOUR NAME], and Genisys is a one-person project. I got tired of clicking through five folders just to open one file, so I built a bar I could just tell. It&apos;s still growing, and I fix and add things one by one.
              </p>
            </blockquote>
            <figcaption><Logo size={36} /><span><b>[YOUR NAME]</b><small>Maker of Genisys</small></span></figcaption>
          </figure>
        </section>

        <section className="section wrap narrow" id="faq" aria-labelledby="q-h">
          <div className="section-head reveal">
            <p className="kicker">FAQ</p>
            <h2 id="q-h" className="grad">Questions, answered.</h2>
          </div>
          <div className="faq">
            {FAQ.map((f) => (
              <details className="reveal" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 6 · Final CTA with floating keycaps */}
        <section className="cta wrap" aria-labelledby="p-h">
          <div className="cta-in reveal">
            <h2 id="p-h" className="cta-h">
              Go on, tell your PC something.
              <span className="grad-soft">Windows 10 and 11 · [FREE? confirm]</span>
            </h2>
            <DownloadButton links={dl} />
          </div>
          <div className="caps" aria-hidden="true">
            <span className="cap cap1 reveal reveal-z">Alt</span>
            <span className="cap cap2 reveal reveal-z" style={d(2)}>Space</span>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot-in">
          <a className="brand" href="#top" aria-label="Back to top">
            <Logo />
            <span>Genisys</span>
          </a>
          <nav aria-label="Footer" className="foot-links">
            <a href="#features">Features</a>
            <a href="#examples">Examples</a>
            <a href="#faq">FAQ</a>
          </nav>
          <p className="muted">© {new Date().getFullYear()} Genisys · Made by one developer who got tired of clicking.</p>
        </div>
      </footer>
    </>
  );
}
