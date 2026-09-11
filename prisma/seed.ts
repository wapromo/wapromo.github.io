import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const categories = ["Gaming", "Sport", "Muzyka", "Filmy", "Technologie", "Edukacja", "Biznes", "Kryptowaluty", "Memes", "Lifestyle", "Inne"];

async function main() {
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name, slug: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-") } });
  }
}

main().finally(() => prisma.$disconnect());
