"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, PASSWORD, TOKEN, isAdmin } from "@/lib/admin";
import { addRelease as saveRelease } from "@/lib/store";

export async function login(form: FormData) {
  if (form.get("password") !== PASSWORD) redirect("/admin?error=1");
  (await cookies()).set(COOKIE, TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(COOKIE);
  redirect("/admin");
}

// Only GitHub links, so a bad paste can never point the site's Download button somewhere else.
const isGithub = (u: string) => /^https:\/\/github\.com\/[^\s]+$/.test(u);

export async function addRelease(form: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const version = String(form.get("version") ?? "").trim().slice(0, 40);
  const exe = String(form.get("exe") ?? "").trim();
  const zip = String(form.get("zip") ?? "").trim();
  if (!version || !isGithub(exe) || (zip && !isGithub(zip))) redirect("/admin?tab=home&error=1");
  await saveRelease({ version, exe, ...(zip ? { zip } : {}), at: Date.now() });
  redirect("/admin?tab=home&saved=1");
}
