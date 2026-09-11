import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { limited, securityLog, writeRegistrationAudit } from "@/lib/security";


const schema = z.object({ username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/), email: z.string().trim().email().max(160), password: z.string().min(8).max(72), confirmPassword: z.string() });
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  if (!limited(`register:${ip}`)) return NextResponse.json({ error: "Zbyt wiele prób. Spróbuj później." }, { status: 429 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) return NextResponse.json({ error: "Sprawdź dane formularza." }, { status: 400 });
  const { username, email, password } = parsed.data;
  const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] }, select: { username: true, email: true } });
  if (existing) return NextResponse.json({ error: existing.username === username ? "Ta nazwa użytkownika jest zajęta." : "Ten e-mail jest już używany." }, { status: 409 });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      registrationAudits: {
        create: {
          username,
          email,
          ip: ip.split(",")[0].trim(),
        },
      },
    },
  });
  await writeRegistrationAudit(username, email, ip.split(",")[0].trim());
  await securityLog(request, "ACCOUNT_CREATED", true, username, user.id);
  return NextResponse.json({ user: { id: user.id, username: user.username } }, { status: 201 });
}
