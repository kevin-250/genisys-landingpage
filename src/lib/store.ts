// Tiny Upstash Redis client over its REST API (plain fetch, no package).
// Vercel's Upstash integration adds KV_REST_API_URL / KV_REST_API_TOKEN to the project's env vars.
const REDIS_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
export const storageConnected = Boolean(REDIS_URL && REDIS_TOKEN);

export type Release = { version: string; exe: string; zip?: string; at: number };
type Cmd = (string | number)[];

// shortcut: without the env vars (local dev) data lives in memory and resets on restart; connect Upstash before going live.
// Kept on globalThis so every route in the same dev process shares one copy.
const g = globalThis as typeof globalThis & { __genisysMem?: Map<string, unknown> };
const mem = (g.__genisysMem ??= new Map());
function memRun([op, key, ...args]: Cmd): unknown {
  const k = String(key);
  const list = () => (mem.get(k) as string[] | undefined) ?? [];
  const hash = () => (mem.get(k) as Record<string, string> | undefined) ?? {};
  switch (op) {
    case "HSET": {
      const h = hash();
      const isNew = !(String(args[0]) in h);
      mem.set(k, { ...h, [String(args[0])]: String(args[1]) });
      return isNew ? 1 : 0;
    }
    case "HGETALL":
      return Object.entries(hash()).flat();
    case "HLEN":
      return Object.keys(hash()).length;
    case "LLEN":
      return list().length;
    case "INCR": {
      const v = ((mem.get(k) as number | undefined) ?? 0) + 1;
      mem.set(k, v);
      return v;
    }
    case "MGET":
      return [key, ...args].map((x) => mem.get(String(x)) ?? null);
    case "LPUSH":
      mem.set(k, [String(args[0]), ...list()]);
      return list().length;
    case "LTRIM":
      mem.set(k, list().slice(Number(args[0]), Number(args[1]) + 1));
      return "OK";
    case "DEL":
      return mem.delete(k) ? 1 : 0;
    case "LRANGE":
      return list().slice(Number(args[0]), Number(args[1]) + 1);
    default:
      throw new Error(`unsupported ${op}`);
  }
}

async function run(cmds: Cmd[]): Promise<unknown[]> {
  if (!storageConnected) return cmds.map(memRun);
  const res = await fetch(`${REDIS_URL}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

const day = (d = new Date()) => d.toISOString().slice(0, 10); // UTC day
const KEY = { visit: "visits", download: "downloads" } as const;

export async function track(type: keyof typeof KEY) {
  await run([["INCR", KEY[type]], ["INCR", `${KEY[type]}:${day()}`]]);
}

/** Totals plus the last `n` days (oldest first). */
export async function stats(n = 14) {
  const days = Array.from({ length: n }, (_, i) => day(new Date(Date.now() - (n - 1 - i) * 86_400_000)));
  const [vals] = (await run([["MGET", "visits", "downloads", ...days.map((d) => `visits:${d}`), ...days.map((d) => `downloads:${d}`)]])) as unknown[][];
  const num = (v: unknown) => Number(v ?? 0) || 0;
  return {
    visits: num(vals[0]),
    downloads: num(vals[1]),
    days: days.map((d, i) => ({ day: d, visits: num(vals[2 + i]), downloads: num(vals[2 + n + i]) })),
  };
}

export async function releases(limit = 20): Promise<Release[]> {
  const [rows] = (await run([["LRANGE", "releases", 0, limit - 1]])) as string[][];
  return (rows ?? []).map((r) => JSON.parse(r) as Release);
}

export async function latestRelease(): Promise<Release | null> {
  return (await releases(1))[0] ?? null;
}

export async function addRelease(r: Release) {
  await run([["LPUSH", "releases", JSON.stringify(r)], ["LTRIM", "releases", 0, 49]]);
}

/** Drops the manual links, so the homepage goes back to the newest GitHub release. */
export async function clearReleases() {
  await run([["DEL", "releases"]]);
}

/* ---------- Desktop app: accounts, error reports, user reports ---------- */

export type AppUser = { email: string; name?: string; theme?: string; installId: string; version?: string; os?: string; at: number };
export type AppError = { kind: string; message: string; stack?: string; installId?: string; version?: string; os?: string; at: number };
export type AppReport = { type: string; message: string; email?: string; name?: string; installId?: string; version?: string; os?: string; at: number };

const parse = <T>(rows: unknown) => ((rows as string[] | null) ?? []).map((r) => JSON.parse(r) as T);

/** One entry per email, so reinstalling never counts a user twice. */
export async function saveUser(u: AppUser) {
  const [isNew] = (await run([["HSET", "users", u.email, JSON.stringify(u)]])) as number[];
  if (isNew === 1) await run([["INCR", `signups:${day()}`]]);
}

export async function listUsers(): Promise<AppUser[]> {
  const [flat] = (await run([["HGETALL", "users"]])) as string[][];
  const users: AppUser[] = [];
  for (let i = 1; i < (flat ?? []).length; i += 2) users.push(JSON.parse(flat[i]) as AppUser);
  return users.sort((a, b) => b.at - a.at);
}

export async function appCounts() {
  const [users, errors, reports] = (await run([["HLEN", "users"], ["LLEN", "errors"], ["LLEN", "reports"]])) as number[];
  return { users: Number(users) || 0, errors: Number(errors) || 0, reports: Number(reports) || 0 };
}

export async function addError(e: AppError) {
  await run([["LPUSH", "errors", JSON.stringify(e)], ["LTRIM", "errors", 0, 499]]);
}
export async function listErrors(limit = 200) {
  const [rows] = await run([["LRANGE", "errors", 0, limit - 1]]);
  return parse<AppError>(rows);
}
export async function clearErrors() {
  await run([["DEL", "errors"]]);
}

export async function addReport(r: AppReport) {
  await run([["LPUSH", "reports", JSON.stringify(r)], ["LTRIM", "reports", 0, 999]]);
}
export async function listReports(limit = 200) {
  const [rows] = await run([["LRANGE", "reports", 0, limit - 1]]);
  return parse<AppReport>(rows);
}
