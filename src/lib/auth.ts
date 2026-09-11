import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function currentUser() {
  const sessionId = (await cookies()).get("session")?.value;
  if (!sessionId) return null;
  const session = await prisma.session.findUnique({ where: { id: sessionId }, include: { user: true } });
  if (!session || session.expiresAt <= new Date() || session.user.banned) return null;
  return session.user;
}
