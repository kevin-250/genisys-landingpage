import { bad, meta, readBody, str, stored } from "@/lib/appApi";
import { addError } from "@/lib/store";

// Errors the desktop app caught (crashes, renderer errors, problems it showed the user). Sent only when the user allowed it.
export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("invalid body");
  const message = str(b.message, 500);
  if (!message) return bad("missing message");
  return stored(() => addError({ ...meta(b), kind: str(b.kind, 20) ?? "error", message, stack: str(b.stack, 4000) }));
}
