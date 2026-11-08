import { track } from "@/lib/store";

// Public counter: the landing page pings this on a visit (once per browser session) and on each Download click.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { type?: unknown } | null;
  const type = body?.type;
  if (type !== "visit" && type !== "download") return new Response(null, { status: 400 });
  try {
    await track(type);
  } catch (e) {
    console.error("track failed", e);
    return new Response(null, { status: 502 });
  }
  return new Response(null, { status: 204 });
}
