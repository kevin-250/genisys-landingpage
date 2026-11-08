// Shared bits for the desktop app's public endpoints (/api/app/*). They take untrusted input, so every field is
// size-limited and type-checked before it is stored.
const MAX_BODY = 16_000; // bytes

export async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  const text = await req.text().catch(() => "");
  if (!text || text.length > MAX_BODY) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Trimmed string cut to `max` chars, or undefined when missing/empty. */
export const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);

export const isEmail = (v: string | undefined): v is string => !!v && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Fields every app request carries. */
export const meta = (b: Record<string, unknown>) => ({
  installId: str(b.installId, 64),
  version: str(b.version, 20),
  os: str(b.os, 60),
  at: Date.now(),
});

export const ok = () => new Response(null, { status: 204 });
export const bad = (why: string) => Response.json({ error: why }, { status: 400 });
export async function stored(save: () => Promise<void>) {
  try {
    await save();
    return ok();
  } catch (e) {
    console.error("store failed", e);
    return Response.json({ error: "storage unavailable" }, { status: 502 });
  }
}
