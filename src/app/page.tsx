/* eslint-disable @next/next/no-img-element -- tiny static SVG logo, no optimisation needed */
import type { CSSProperties } from "react";
import { connection } from "next/server";
import { latestRelease } from "@/lib/store";
import { DownloadButton, Dots, NavMenu, Reveal, Split, ThemeToggle, TrackVisit } from "./client";
import { AppMock } from "./desktop";

const F = {
  bar: { title: "A bar over everything", body: "Press Alt+Space in any app and a small command bar pops up, ready for you to type." },
  typos: { title: "Typos? Still found.", body: "Type “resme pdf” and it still digs up resume.pdf. No exact names needed." },
  does: { title: "It actually does it", body: "No list of steps to follow yourself. It opens the app, the folder or the page for you." },
  agents: { title: "Many agents at once", body: "/agent 3 opens three agent windows, and /agent 2 [task one, task two] gives each one its own job." },
  memory: { title: "Remembers what worked", body: "When a command works, Genisys keeps the solution, so the next time is faster." },
  deletes: { title: "Deletes, but carefully", body: "It asks before deleting anything, and you can undo a delete if you change your mind." },
  search: { title: "Search your whole PC", body: "Type /search and every drive is searched as you type, typos and all. Filter by type or by date, then open, copy, rename or delete right from the list." },
  ownAI: { title: "Bring your own AI", body: "Free models are built in. Prefer Claude, OpenAI, Gemini or another? Paste your key, pick a model, and Genisys uses it for every task." },
  editor: { title: "A real code workspace", body: "The Script Writer is a proper editor now: open a folder to get a file tree, tabs and breadcrumbs, and the AI writes straight into your file." },
};

const EXAMPLES = [
  { group: "Files & folders", items: ["open my downloads folder", "find resme pdf", "/search invoice pdf"] },
  { group: "Apps", items: ["open whatsapp", "open spotify"] },
  { group: "Watch & listen", items: ["mouse trap episode 3", "play some lofi"] },
  { group: "Web", items: ["search cheap flights to lisbon", "/browser best laptops under $800"] },
  { group: "Agents", items: ["/agent 3", "/agent 2 [plan a weekend in paris, find a cheap hotel there]"] },
];
// Page sections, used by the top nav (a ☰ menu on phones) and the footer.
const SECTIONS: [string, string][] = [["#how", "How it works"], ["#features", "Features"], ["#new", "What's new"], ["#examples", "Examples"], ["#faq", "FAQ"]];

const ALL_EXAMPLES = EXAMPLES.flatMap((g) => g.items);

const FAQ = [
  { q: "Is it free?", a: "Yes. Genisys is free to download and use, with no subscription. You only need an email to set it up." },
  {
    q: "What data leaves my PC?",
    a: "Your email, name and theme choice from the first setup, plus basic PC specs (Windows version, CPU, RAM, screen, free disk space), so I know who uses Genisys and can make it run well. What you type is sent to the AI model that works out the steps (the free built-in models, or the provider you picked if you added your own key); for tasks about your files it also gets your folder names (never file contents). If you leave error reports on, error messages are sent too, with your user folder and name removed first. Messages you send from the Report tab come to me. Your files, memory, notes and settings stay on your PC.",
  },
  { q: "Which Windows versions does it run on?", a: "Windows 10 and Windows 11." },
  {
    q: "How do I stop it or uninstall it?",
    a: "Press Esc to stop a task while it's running. To remove Genisys completely, go to Settings → Apps → Installed apps, find Genisys and click Uninstall.",
  },
  {
    q: "Is it safe to let it delete files?",
    a: "It always asks before it deletes anything. And if you say yes and then regret it, the delete can be undone.",
  },
  {
    q: "Can I use my own AI key, like Claude or OpenAI?",
    a: "Yes. In Settings › Keys, under “Your own AI”, pick Claude (Anthropic), OpenAI, Google Gemini, DeepSeek, Mistral, OpenRouter or any OpenAI-compatible service, paste your key, choose a model and press Test. Genisys then uses it first for every task, and falls back to the free models if it ever fails. Your key stays on your PC.",
  },
  { q: "Does it work offline?", a: "Partly. New requests need the internet, because the AI runs online. Things Genisys has done for you before still work offline, straight from its memory." },
];

// Frosted keycaps floating around the hero headline: [label, hint, position, size, tilt (deg), float time (s)]
const HERO_CAPS: [string, string, CSSProperties, [number, number], number, number][] = [
  ["Ctrl", "", { left: "1%", top: "6%" }, [92, 84], -14, 6.5],
  ["Alt", "", { left: "5%", top: "42%" }, [116, 108], 10, 5.5],
  ["Esc", "stop", { left: "0%", top: "76%" }, [86, 80], -7, 7],
  ["Enter", "↵", { right: "1%", top: "4%" }, [128, 92], 12, 6],
  ["/", "actions", { right: "7%", top: "40%" }, [96, 90], -10, 5],
  ["Space", "", { right: "0%", top: "74%" }, [196, 82], 6, 6.8],
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
  // A link pasted in /admin wins; otherwise the newest GitHub release, picked up automatically.
  const rel = await latestRelease().catch(() => null);
  const dl = { exe: "/download", zip: rel?.zip ? "/download?file=zip" : undefined }; // /download sends the newest file
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
            {SECTIONS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <div className="nav-end">
            <NavMenu links={SECTIONS} />
            <ThemeToggle />
            <DownloadButton size="sm" links={dl} />
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero wrap" id="top">
          <div className="hero-caps" aria-hidden="true">
            {HERO_CAPS.map(([k, hint, pos, [w, h], r, f], i) => (
              <span
                key={k}
                className="cap reveal reveal-z"
                style={{ ...pos, width: w, height: h, "--r": `${r}deg`, "--f": `${f}s`, "--d": `${300 + i * 110}ms` } as CSSProperties}
              >
                <span>{k}</span>
                {hint && <small>{hint}</small>}
              </span>
            ))}
          </div>
          <p className="eyebrow reveal">
            <span className="dot-live" aria-hidden="true" /> Alt+Space, then just type
          </p>
          <h1 className="reveal">
            Type it.
            <br />
            <span className="soft">Your PC does it.</span>
          </h1>
          <p className="lede reveal">
            Genisys is a free app for Windows. Type what you want in normal words, like “open my downloads folder”, and it does it for you.
          </p>
          <div className="hero-cta reveal">
            <DownloadButton links={dl} />
          </div>
          <p className="fine reveal">
            Windows 10 and 11 · Free · Sign up with just your email
          </p>
          <p className="fine reveal">
            Questions? <a href="#faq">Read the FAQ</a> · New here? <a href="#how">See how it works</a>
          </p>
        </section>

        <section className="preview wrap reveal" aria-label="Genisys app preview">
          <p className="sr-only">
            A demo of a Windows desktop. Tasks are typed into Genisys, and it opens the right app for each one: three agent windows, a browser search, a music player, File Explorer moving PDFs, and a code editor writing a script.
          </p>
          <AppMock />
        </section>

        <section className="section wrap" id="how" aria-labelledby="h-h">
          <div className="head-c reveal">
            <p className="kicker">How it works</p>
            <h2 id="h-h" className="grad">Three steps, no learning curve.</h2>
            <p className="sub">If you can send a text message, you can use Genisys.</p>
          </div>
          <ol className="how">
            <li className="card how-step reveal" style={d(0)}>
              <span className="how-n" aria-hidden="true">1</span>
              <div className="how-vis" aria-hidden="true">
                <span className="how-btn">
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M1 2.6 6.6 1.8v5.5H1zM7.4 1.7 15 .6v6.7H7.4zM1 8.1h5.6v5.5L1 12.8zM7.4 8.1H15v6.8l-7.6-1.1z" /></svg>
                  Download for Windows
                </span>
              </div>
              <h3>Download and install</h3>
              <p>Click Download, open the file, and follow the steps. It takes about a minute.</p>
            </li>
            <li className="card how-step reveal" style={d(1)}>
              <span className="how-n" aria-hidden="true">2</span>
              <div className="how-vis" aria-hidden="true"><kbd>Alt</kbd><span>+</span><kbd>Space</kbd></div>
              <h3>Press Alt + Space</h3>
              <p>A small bar appears on top of whatever you are doing, in any app.</p>
            </li>
            <li className="card how-step reveal" style={d(2)}>
              <span className="how-n" aria-hidden="true">3</span>
              <div className="how-vis how-type" aria-hidden="true">
                <span>open my downloads folder</span>
                <b><Check /> Done</b>
              </div>
              <h3>Type what you want</h3>
              <p>Write it like a message to a friend. Genisys does the clicking for you.</p>
            </li>
          </ol>
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
                  <div className="dlg-btns"><span>Deny</span><span className="run">Approve</span></div>
                </div>
                <div className="toast">
                  <Check /> 3 files deleted <span className="undo">Undo</span>
                </div>
              </div>
              <p><b>{F.deletes.title}.</b> {F.deletes.body}</p>
            </article>
          </div>
        </section>

        {/* 3b · New in 1.3: whole-PC search, your own AI, the code workspace */}
        <section className="section wrap" id="new" aria-labelledby="n-h">
          <div className="head-c reveal">
            <p className="kicker">New in Genisys 1.3</p>
            <h2 id="n-h" className="grad">Search everything. Use any AI. Write real code.</h2>
          </div>
          <div className="trio">
            <article className="t-card reveal" style={d(0)}>
              <div className="t-vis nv" aria-hidden="true">
                <code className="t-chip">/search invoce</code>
                <div className="nv-card nv-search">
                  <div className="nv-filters"><span className="on">Documents ▾</span><span>Past 7 days ▾</span></div>
                  <div className="nv-row on" style={step(0)}><i className="fi pdf" /><span>invoice_october.pdf<small>Documents › Bills</small></span><em>PDF</em></div>
                  <div className="nv-row" style={step(1)}><i className="fi" /><span>Invoices 2026<small>Desktop</small></span><em>Folder</em></div>
                  <div className="nv-row" style={step(2)}><i className="fi" /><span>invoice template.docx<small>Documents</small></span><em>Word</em></div>
                </div>
              </div>
              <p><b>{F.search.title}.</b> {F.search.body}</p>
            </article>

            <article className="t-card reveal" style={d(1)}>
              <div className="t-vis nv" aria-hidden="true">
                <div className="nv-card nv-ai">
                  <span className="nv-lbl">Your own AI</span>
                  <div className="nv-now"><i /> Now using <b>Claude · claude-opus-5-5</b></div>
                  <div className="nv-provs">
                    {["Claude", "OpenAI", "Gemini", "DeepSeek", "Mistral"].map((p, i) => (
                      <span key={p} className={i === 0 ? "on" : ""} style={step(i)}>{p}</span>
                    ))}
                  </div>
                  <div className="nv-ok"><Check /> Works: answered in 1.2s</div>
                </div>
              </div>
              <p><b>{F.ownAI.title}.</b> {F.ownAI.body}</p>
            </article>

            <article className="t-card reveal" style={d(2)}>
              <div className="t-vis nv" aria-hidden="true">
                <div className="nv-card nv-ed">
                  <div className="nv-side">
                    <span className="nv-lbl">Explorer</span>
                    <span>▾ backend</span>
                    <span className="in">▾ middleware</span>
                    <span className="in2 on">auth.js</span>
                    <span className="in2">error.js</span>
                    <span>▸ frontend</span>
                  </div>
                  <div className="nv-main">
                    <div className="nv-tabs"><span className="on">auth.js</span><span>app.js</span><span className="dirty">random.js</span></div>
                    <div className="nv-code">
                      <span style={step(0)}><b>const</b> jwt = require(<em>&quot;jsonwebtoken&quot;</em>);</span>
                      <span style={step(1)}><b>exports</b>.isAuthenticated = <b>async</b> (req) =&gt; {"{"}</span>
                      <span style={step(2)}>&nbsp;&nbsp;<b>const</b> {"{"} token {"}"} = req.cookies;</span>
                      <span style={step(3)}>{"}"};</span>
                    </div>
                  </div>
                </div>
              </div>
              <p><b>{F.editor.title}.</b> {F.editor.body}</p>
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
                Hi, I&apos;m Kevin, and Genisys is a one-person project. I got tired of clicking through five folders just to open one file, so I built a bar I could just tell. It&apos;s still growing, and I fix and add things one by one.
              </p>
            </blockquote>
            <figcaption><Logo size={36} /><span><b>Kevin</b><small>Maker of Genisys</small></span></figcaption>
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
              <span className="grad-soft">Free for Windows 10 and 11</span>
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
            {SECTIONS.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </nav>
          <p className="muted">© {new Date().getFullYear()} Genisys · Made by one developer who got tired of clicking.</p>
        </div>
      </footer>
    </>
  );
}
