import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } });
  return NextResponse.json(categories.map((category) => ({ id: category.id, name: category.name, slug: category.slug, count: category._count.posts })));
}
