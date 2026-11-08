# Genisys landing page

Next.js 16 site for Genisys, hosted on Vercel.

- `src/app/page.tsx`: landing page sections and copy
- `src/app/client.tsx`: download button, theme toggle, dot grid, slider, visit/download tracking
- `src/app/desktop.tsx`: the animated desktop demo
- `src/app/admin/`: hidden admin at `/admin` (password is hard-coded in `src/lib/admin.ts`)
- `src/app/api/track/route.ts`: counts visits and download clicks
- `src/lib/store.ts`: stats and releases, saved in Upstash Redis

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

Without the Redis env vars, stats and releases live in memory and reset when the server restarts.

## Deploy (Vercel, free)

1. Import this GitHub repo at https://vercel.com/new. It detects Next.js; no settings needed.
2. In the project, open **Storage → Create → Upstash (Redis)**, pick the free plan and connect it to the project. This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. Redeploy. Every push to the repo redeploys automatically.

## Admin

Open `https://<your-site>/admin` and log in.

- **Dashboard**: visits (once per browser session), download clicks, last 14 days.
- **Home**: paste a GitHub release link (`https://github.com/...`). The newest one becomes the homepage Download button; older ones stay as history.
