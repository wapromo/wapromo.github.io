import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, username: user.username, avatar: user.avatar, role: user.role, createdAt: user.createdAt, postCount: await prisma.post.count({ where: { userId: user.id } }) } });
}
