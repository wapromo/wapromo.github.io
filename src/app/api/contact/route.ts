import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { limited } from "@/lib/security";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().max(160), message: z.string().trim().min(10).max(2000) });
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!limited(`contact:${ip}`, 5)) return NextResponse.json({ error: "Spróbuj ponownie później." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Sprawdź formularz kontaktowy." }, { status: 400 });
  const user = await currentUser();
  await prisma.contactMessage.create({ data: { ...parsed.data, userId: user?.id } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
