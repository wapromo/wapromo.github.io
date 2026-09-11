import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const roleSchema = z.object({ username: z.string().min(3), role: z.enum(["USER", "ADMIN"]) });

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, username: true, email: true, role: true, banned: true, createdAt: true, _count: { select: { posts: true } } } });
  return NextResponse.json(users.map((user) => ({ ...user, postCount: user._count.posts, _count: undefined })));
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;
  const parsed = roleSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Nieprawidłowe dane roli." }, { status: 400 });
  if (parsed.data.username === auth.user.username && parsed.data.role !== "ADMIN") return NextResponse.json({ error: "Nie możesz odebrać sobie uprawnień administratora." }, { status: 400 });
  const user = await prisma.user.update({ where: { username: parsed.data.username }, data: { role: parsed.data.role }, select: { username: true, role: true } });
  return NextResponse.json(user);
}
