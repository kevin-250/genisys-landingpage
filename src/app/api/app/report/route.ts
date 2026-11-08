import { bad, isEmail, meta, readBody, str, stored } from "@/lib/appApi";
import { addReport } from "@/lib/store";

const TYPES = ["idea", "bug", "question", "other"];

// Messages users send from the app's Report tab (improvement ideas, bugs, questions).
export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("invalid body");
  const message = str(b.message, 2000);
  if (!message) return bad("missing message");
  const type = TYPES.includes(String(b.type)) ? String(b.type) : "other";
  const email = str(b.email, 254)?.toLowerCase();
  return stored(() =>
    addReport({ ...meta(b), type, message, email: isEmail(email) ? email : undefined, name: str(b.name, 60) }),
  );
}
