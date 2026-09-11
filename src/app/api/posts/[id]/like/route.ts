import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Zaloguj się, aby polubić wpis." }, { status: 401 });
  const postId = Number((await params).id);
  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId: user.id, postId } } });
  if (existing) await prisma.like.delete({ where: { id: existing.id } });
  else await prisma.like.create({ data: { userId: user.id, postId } });
  return NextResponse.json({ liked: !existing, likes: await prisma.like.count({ where: { postId } }) });
}
