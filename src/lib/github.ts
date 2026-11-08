// The desktop app's releases live on GitHub (published from the app repo with `npm run release`).
export const APP_REPO = "kevin-250/genisys-app";
// The release script always uploads the installer under this name, so this link always serves the newest version.
export const LATEST_EXE = `https://github.com/${APP_REPO}/releases/latest/download/Genisys-Setup.exe`;

export type GhRelease = { tag: string; at: string; url: string; exe?: string; downloads: number };

/** Newest first. Cached 5 min so the public API's 60 requests/hour limit is never hit. */
export async function githubReleases(): Promise<GhRelease[]> {
  const res = await fetch(`https://api.github.com/repos/${APP_REPO}/releases?per_page=20`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  const rows = (await res.json()) as {
    tag_name: string; published_at: string; html_url: string; draft: boolean; prerelease: boolean;
    assets: { name: string; browser_download_url: string; download_count: number }[];
  }[];
  return rows
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => {
      const exe = r.assets.find((a) => a.name.toLowerCase().endsWith(".exe"));
      return { tag: r.tag_name, at: r.published_at, url: r.html_url, exe: exe?.browser_download_url, downloads: exe?.download_count ?? 0 };
    });
}
