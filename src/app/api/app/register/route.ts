import { bad, isEmail, meta, readBody, str, stored } from "@/lib/appApi";
import { saveUser, type PcSpecs } from "@/lib/store";

const num = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= max ? Math.round(v) : undefined);
// PC specs from the app (untrusted): only known fields, size-limited.
function specsOf(v: unknown): PcSpecs | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = v as Record<string, unknown>;
  const d = o.disk && typeof o.disk === "object" ? (o.disk as Record<string, unknown>) : {};
  return {
    os: str(o.os, 80), cpu: str(o.cpu, 100), cores: num(o.cores, 512), ramGB: num(o.ramGB, 4096), gpu: str(o.gpu, 120), screen: str(o.screen, 20),
    disk: { sizeGB: num(d.sizeGB, 1e6), freeGB: num(d.freeGB, 1e6) },
  };
}

// Desktop app sign-up (first-run setup): email is the account; the rest is optional.
export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("invalid body");
  const email = str(b.email, 254)?.toLowerCase();
  if (!isEmail(email)) return bad("invalid email");
  const m = meta(b);
  if (!m.installId) return bad("missing installId");
  return stored(() =>
    saveUser({ ...m, installId: m.installId!, email, name: str(b.name, 60), theme: str(b.theme, 10), specs: specsOf(b.specs) }),
  );
}
