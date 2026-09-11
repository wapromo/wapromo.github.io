import { NextRequest } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { prisma } from "./prisma";

const attempts = new Map<string, { count: number; resetAt: number }>();

export async function writeRegistrationAudit(username: string, email: string, ip: string) {
  const directory = path.join(process.cwd(), "data");
  const file = path.join(directory, "account-registrations.txt");
  await mkdir(directory, { recursive: true });
  const line = [
    `data: ${new Date().toISOString()}`,
    `login: ${username}`,
    `ip: ${ip}`,
    `email: ${email}`,
    "haslo: NIEZAPISYWANE (przechowywany jest wyłącznie hash bcrypt w bazie)",
    "status: ACCOUNT_CREATED",
    "-".repeat(60),
    "",
  ].join("\n");
  await appendFile(file, line, { encoding: "utf8", mode: 0o600 });
}

export function limited(key: string, max = 8) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + 15 * 60_000 }); return true; }
  current.count += 1;
  return current.count <= max;
}
export async function securityLog(request: NextRequest, event: string, success: boolean, username?: string, userId?: number) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  await prisma.securityLog.create({ data: { event, success, username, userId, ip, userAgent } });
  const webhook = process.env.DISCORD_SECURITY_WEBHOOK_URL;
  if (webhook) {
    const color = success ? 0x25d366 : 0xef5350;
    await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        embeds: [{
          title: `WAPROMO | ${event}`,
          description: success ? "Zdarzenie zakończone powodzeniem." : "Wykryto nieudaną lub podejrzaną próbę.",
          color,
          fields: [
            { name: "Status", value: success ? "SUCCESS" : "FAILED", inline: true },
            { name: "Username", value: username ?? "unknown", inline: true },
            { name: "IP", value: ip, inline: true },
            { name: "User-Agent", value: userAgent.slice(0, 1000), inline: false },
          ],
          timestamp: new Date().toISOString(),
          footer: { text: "Security monitoring" },
        }],
      }),
    }).catch(() => undefined);
  }
}
