import { NextResponse } from "next/server";
import { currentUser } from "./auth";

export async function requireAdmin() {
  const user = await currentUser();
  if (!user) return { response: NextResponse.json({ error: "Zaloguj się." }, { status: 401 }) } as const;
  if (user.role !== "ADMIN") return { response: NextResponse.json({ error: "Brak uprawnień administratora." }, { status: 403 }) } as const;
  return { user } as const;
}
