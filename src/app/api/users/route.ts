import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({ where: { banned: false }, orderBy: { username: "asc" }, select: { id: true, username: true, avatar: true, role: true, createdAt: true, _count: { select: { posts: true } } } });
  return NextResponse.json(users.map((user) => ({ ...user, postCount: user._count.posts, _count: undefined })));
}
