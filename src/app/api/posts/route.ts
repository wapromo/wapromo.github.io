import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { limited } from "@/lib/security";
import { prisma } from "@/lib/prisma";


const postSchema = z.object({ title: z.string().trim().min(3).max(100), description: z.string().trim().min(10).max(1000), whatsappUrl: z.string().url().refine((value) => /^https:\/\/(chat\.whatsapp\.com|whatsapp\.com)\//i.test(value), "Nieprawidłowy link WhatsApp."), categoryId: z.coerce.number().int().positive(), image: z.string().url().optional().or(z.literal("")) });

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("q")?.trim() ?? "";
  const categoryId = Number(params.get("categoryId")) || undefined;
  const sort = params.get("sort") ?? "newest";
  const posts = await prisma.post.findMany({ where: { categoryId, ...(search ? { OR: [{ title: { contains: search } }, { description: { contains: search } }, { category: { name: { contains: search } } }] } : {}) }, include: { user: { select: { username: true, avatar: true } }, category: true, _count: { select: { likes: true, comments: true } } }, orderBy: sort === "likes" ? { likes: { _count: "desc" } } : sort === "comments" ? { comments: { _count: "desc" } } : { createdAt: "desc" }, take: 40 });
  return NextResponse.json(posts.map((post) => ({ id: post.id, title: post.title, description: post.description, whatsappUrl: post.whatsappUrl, category: post.category.name, categoryId: post.categoryId, author: post.user.username, image: post.image, createdAt: post.createdAt, likes: post._count.likes, comments: post._count.comments })));
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Zaloguj się, aby dodać wpis." }, { status: 401 });
  if (!limited(`post:${user.id}`, 5)) return NextResponse.json({ error: "Osiągnięto limit nowych wpisów." }, { status: 429 });
  const parsed = postSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Sprawdź nazwę, opis i link WhatsApp." }, { status: 400 });
  const category = await prisma.category.findUnique({ where: { id: parsed.data.categoryId } });
  if (!category) return NextResponse.json({ error: "Wybrana kategoria nie istnieje." }, { status: 400 });
  const post = await prisma.post.create({ data: { ...parsed.data, image: parsed.data.image || null, userId: user.id } });
  return NextResponse.json({ id: post.id }, { status: 201 });
}
