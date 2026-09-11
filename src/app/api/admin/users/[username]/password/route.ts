import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { securityLog } from "@/lib/security";

const schema = z.object({ password: z.string().min(8).max(72) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Nowe hasło musi mieć od 8 do 72 znaków." }, { status: 400 });
  const username = decodeURIComponent((await params).username);
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true } });
  if (!user) return NextResponse.json({ error: "Użytkownik nie istnieje." }, { status: 404 });
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) } });
  await prisma.session.deleteMany({ where: { userId: user.id } });
  await securityLog(request, "ADMIN_PASSWORD_RESET", true, user.username, user.id);
  return NextResponse.json({ ok: true, username: user.username });
}
