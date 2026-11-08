import { bad, isEmail, meta, readBody, str, stored } from "@/lib/appApi";
import { saveUser } from "@/lib/store";

// Desktop app sign-up (first-run setup): email is the account; the rest is optional.
export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("invalid body");
  const email = str(b.email, 254)?.toLowerCase();
  if (!isEmail(email)) return bad("invalid email");
  const m = meta(b);
  if (!m.installId) return bad("missing installId");
  return stored(() =>
    saveUser({ ...m, installId: m.installId!, email, name: str(b.name, 60), theme: str(b.theme, 10) }),
  );
}
