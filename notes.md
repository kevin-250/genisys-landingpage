# Reference notes: aside.com landing page structure

Observed 2026-11-08 in the Chromium browser pane at about 1024 px wide. These are my own notes on structure and feel. No text, images or colors were copied.

## Section order
1. **Nav**: 56 px tall, sticky. Logo on the left, 4 text links in the center, a split Download button on the right.
2. **Hero**: centered. A small pill badge ("backed by …"), a two-line display headline, then the split Download button. About 490 px tall plus padding.
3. **Product preview**: a large app window (browser chrome, sidebar, search box, "recent tasks" cards) that sits right under the hero and fills most of the width.
4. **"Introducing" story section**: a short manifesto paragraph.
5. **Capabilities**: a long section with an h2, then h3 feature blocks, each paired with a visual.
6. **Second product (password manager)**: same pattern of h2, h3 and visual.
7. **Privacy and control** section.
8. **Final CTA**: "start using today" plus the Download button.
9. **Footer**: tall, with link columns (Features, Use cases, Resources, Company).

Sections are divided by full-width 1 px hairlines (`border-b` at about 6% black).

## Layout
- Outer page has 8–16 px padding. The hero sits inside a rounded panel with a sky background.
- Content max width is about 1224 px. The largest container is capped at the 2xl breakpoint (1536 px).
- Generous vertical rhythm: py-16 in the hero, py-14 / py-16 / py-24 between sections.

## Typography
- Custom display face for headings, Geist for UI and body text.
- h1: 36 px mobile, 44 px at 1024 px, larger at xl. Weight around 400–450, line-height around 1.1, tracking −0.01em.
- h2: 30 / 36 px, weight 450. h3: 24 / 32 px, weight 500.
- Body text is 14–16 px with a 20–24 px line-height. Overall it feels calm and light, with no heavy bold weights.

## Download button
- A split button: a main part ("Download for Windows" with an OS icon on the left), 38–42 px tall, and a separate 40 px caret button labelled "Choose download platform" that opens a menu of other platforms.
- Dark pill-ish rectangle with an 11 px radius on the outer corners.
- 150 ms transition with `cubic-bezier(.4, 0, .2, 1)`. The caret icon rotates 180° when the menu is open.
- A smaller version (12–14 px text) sits in the nav.

## Motion
- Sections and blocks enter on scroll with opacity and transform (Framer-style inline `opacity: 1; transform: none` once they are in view).
- The preview has scroll-fade masks (`show-top-mask` / `hide-bottom-mask`) and small spinners for "running" tasks.
- Nothing loud: short fades, small offsets.

## Light / dark
The page stayed light even with `prefers-color-scheme: dark`, so it appears to be light-only.

## Not observed
I didn't scroll through screenshots of every section, open the platform menu, or check the phone layout. The browser session on aside.com was stopped at the user's request before those steps. From the markup, mobile switches to `max-sm:px-8` padding and single-column stacks.

## How Genisys uses this
The structure is the same: sticky nav with a split download button, centered hero, big live product window, feature grid, examples, CTA card, FAQ and footer. Everything visual comes from the Genisys app (`my-app/index.html`): warm charcoal and paper tokens, Segoe UI with Cascadia Mono, the 12 px gradient-rim window card, traffic-light title bar, and the dot-grid canvas (ported from `my-app/src/dots.js`). Dark mode is the default and light mode is supported.
