import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { limited, securityLog } from "@/lib/security";


const schema = z.object({ identifier: z.string().trim().min(3).max(160), password: z.string().min(1).max(72), remember: z.boolean().optional() });
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!limited(`login:${ip}`)) return NextResponse.json({ error: "Zbyt wiele prób logowania. Spróbuj później." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Podaj login i hasło." }, { status: 400 });
  const user = await prisma.user.findFirst({ where: { OR: [{ username: parsed.data.identifier }, { email: parsed.data.identifier }] } });
  const valid = user && !user.banned && await bcrypt.compare(parsed.data.password, user.passwordHash);
  await securityLog(request, "LOGIN", Boolean(valid), parsed.data.identifier, valid ? user.id : undefined);
  if (!valid) return NextResponse.json({ error: "Nieprawidłowe dane logowania." }, { status: 401 });
  const sessionId = crypto.randomUUID();
  await prisma.session.create({ data: { id: sessionId, userId: user.id, remember: Boolean(parsed.data.remember), expiresAt: new Date(Date.now() + (parsed.data.remember ? 30 : 1) * 24 * 60 * 60 * 1000) } });
  const response = NextResponse.json({ user: { id: user.id, username: user.username } });
  response.cookies.set("session", sessionId, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", maxAge: (parsed.data.remember ? 30 : 1) * 24 * 60 * 60 });
  return response;
}
