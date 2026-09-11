import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { limited } from "@/lib/security";

export const dynamic = "force-dynamic";
const schema = z.object({ content: z.string().trim().min(1).max(500) });

export async function GET() {
  const messages = await prisma.chatMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100, include: { user: { select: { username: true, role: true } } } });
  return NextResponse.json(messages.reverse());
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Zaloguj się, aby pisać na czacie." }, { status: 401 });
  if (!limited(`chat:${user.id}`, 30)) return NextResponse.json({ error: "Osiągnięto limit wiadomości. Spróbuj później." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Wiadomość może mieć maksymalnie 500 znaków." }, { status: 400 });
  const message = await prisma.chatMessage.create({ data: { userId: user.id, content: parsed.data.content }, include: { user: { select: { username: true, role: true } } } });
  return NextResponse.json(message, { status: 201 });
}
