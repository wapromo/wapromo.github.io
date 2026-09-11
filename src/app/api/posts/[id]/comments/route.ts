import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { limited } from "@/lib/security";
import { prisma } from "@/lib/prisma";

const schema = z.object({ content: z.string().trim().min(1).max(500) });
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const comments = await prisma.comment.findMany({ where: { postId: Number((await params).id) }, orderBy: { createdAt: "asc" }, include: { user: { select: { username: true } } } });
  return NextResponse.json(comments);
}
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Zaloguj się, aby komentować." }, { status: 401 });
  if (!limited(`comment:${user.id}`, 20)) return NextResponse.json({ error: "Osiągnięto limit komentarzy." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Komentarz ma nieprawidłową treść." }, { status: 400 });
  const comment = await prisma.comment.create({ data: { content: parsed.data.content, userId: user.id, postId: Number((await params).id) }, include: { user: { select: { username: true } } } });
  return NextResponse.json(comment, { status: 201 });
}
