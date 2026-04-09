import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Seed admin user — update email to match your Google account
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@example.com",
      name: "Administrator",
      role: "ADMIN",
    },
  });
  console.log("Admin user:", admin.email);

  // Seed example category hierarchy
  const warsaw = await prisma.category.upsert({
    where: { slug: "warsaw" },
    update: {},
    create: { name: "Warsaw", slug: "warsaw" },
  });

  await prisma.category.upsert({
    where: { slug: "warsaw-city-center" },
    update: {},
    create: { name: "City Center", slug: "warsaw-city-center", parentId: warsaw.id },
  });

  await prisma.category.upsert({
    where: { slug: "warsaw-praga" },
    update: {},
    create: { name: "Praga", slug: "warsaw-praga", parentId: warsaw.id },
  });

  const krakow = await prisma.category.upsert({
    where: { slug: "krakow" },
    update: {},
    create: { name: "Krakow", slug: "krakow" },
  });

  await prisma.category.upsert({
    where: { slug: "krakow-old-town" },
    update: {},
    create: { name: "Old Town", slug: "krakow-old-town", parentId: krakow.id },
  });

  console.log("Categories seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
