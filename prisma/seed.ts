import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const categories = ["Gaming", "Sport", "Muzyka", "Filmy", "Technologie", "Edukacja", "Biznes", "Kryptowaluty", "Memes", "Lifestyle", "Inne"];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name, slug: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") } });
  }
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@wapromo.local";
  if (!adminPassword || adminPassword.length < 8) throw new Error("ADMIN_PASSWORD must contain at least 8 characters.");
  await prisma.user.upsert({ where: { username: "FilipPankiewicz" }, update: { email: adminEmail, role: "ADMIN", passwordHash: await bcrypt.hash(adminPassword, 12), banned: false }, create: { username: "FilipPankiewicz", email: adminEmail, role: "ADMIN", passwordHash: await bcrypt.hash(adminPassword, 12) } });
}

main().finally(() => prisma.$disconnect());
