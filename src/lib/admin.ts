import { createHash } from "node:crypto";
import { cookies } from "next/headers";

// Hard-coded on purpose (owner's choice: nothing sensitive here). Server-only: never sent to the browser.
export const PASSWORD = "genesisys@2026";
export const COOKIE = "genisys_admin";
export const TOKEN = createHash("sha256").update(PASSWORD).digest("hex");

export async function isAdmin() {
  return (await cookies()).get(COOKIE)?.value === TOKEN;
}
