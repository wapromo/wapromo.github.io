import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const username = decodeURIComponent((await params).username);
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true, username: true, avatar: true, role: true, createdAt: true, banned: true, posts: { orderBy: { createdAt: "desc" }, include: { category: true, _count: { select: { likes: true, comments: true } } } } } });
  if (!user || user.banned) return NextResponse.json({ error: "Profil nie istnieje." }, { status: 404 });
  return NextResponse.json({ id: user.id, username: user.username, avatar: user.avatar, role: user.role, createdAt: user.createdAt, postCount: user.posts.length, posts: user.posts.map((post) => ({ id: post.id, title: post.title, description: post.description, whatsappUrl: post.whatsappUrl, category: post.category.name, createdAt: post.createdAt, likes: post._count.likes, comments: post._count.comments })) });
}
