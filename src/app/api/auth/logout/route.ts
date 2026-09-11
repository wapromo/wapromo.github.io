import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("session")?.value;
  if (sessionId) await prisma.session.deleteMany({ where: { id: sessionId } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", path: "/", maxAge: 0 });
  return response;
}
