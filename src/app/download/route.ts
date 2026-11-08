import { githubReleases } from "@/lib/github";
import { latestRelease, track } from "@/lib/store";

// The one link every Download button uses (/download, or /download?file=zip): the browser is sent straight to the
// newest installer file, so the download just starts and visitors never see a GitHub page. Counted here, server-side.
export async function GET(req: Request) {
  const zip = new URL(req.url).searchParams.get("file") === "zip";
  const override = await latestRelease().catch(() => null); // a link pasted in /admin wins
  const url = zip ? override?.zip : override?.exe ?? (await githubReleases().catch(() => null))?.find((r) => r.exe)?.exe;

  if (!url) return comingSoon();
  await track("download").catch((e) => console.error("download count failed", e));
  return Response.redirect(url, 302);
}

function comingSoon() {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Genisys · almost ready</title><meta name="robots" content="noindex">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#ece8e2;color:#2a2420;font:16px/1.6 "Segoe UI",system-ui,sans-serif;text-align:center;padding:24px}
@media (prefers-color-scheme:dark){body{background:#121110;color:#e8e4df}}h1{margin:16px 0 8px;font-size:28px}p{margin:0 0 24px;opacity:.75}
a{display:inline-block;padding:12px 20px;border-radius:12px;background:currentColor;text-decoration:none}a span{color:#ece8e2}@media (prefers-color-scheme:dark){a span{color:#121110}}</style></head>
<body><main><img src="/logo.svg" alt="" width="56" height="56"><h1>The first version is almost ready</h1>
<p>Genisys for Windows will be downloadable here very soon. Check back shortly.</p><a href="/"><span>Back to the homepage</span></a></main></body></html>`;
  return new Response(html, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "retry-after": "3600" } });
}
