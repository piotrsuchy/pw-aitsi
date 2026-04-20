import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Primary admin — matches the real Google account used for development
  const admin = await prisma.user.upsert({
    where: { email: "piotrsuchypp@gmail.com" },
    update: { role: "ADMIN" },
    create: {
      email: "piotrsuchypp@gmail.com",
      name: "Administrator",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("Admin user:", admin.email);

  // Dev test users — created on first dev login, kept in sync by seed
  await prisma.user.upsert({
    where: { email: "admin@dev.local" },
    update: { role: "ADMIN" },
    create: { email: "admin@dev.local", name: "Dev Admin", role: "ADMIN", emailVerified: new Date() },
  });
  await prisma.user.upsert({
    where: { email: "creator@dev.local" },
    update: { role: "CREATOR" },
    create: { email: "creator@dev.local", name: "Dev Creator", role: "CREATOR", emailVerified: new Date() },
  });
  await prisma.user.upsert({
    where: { email: "viewer@dev.local" },
    update: { role: "VIEWER" },
    create: { email: "viewer@dev.local", name: "Dev Viewer", role: "VIEWER", emailVerified: new Date() },
  });
  console.log("Dev test users seeded (admin@dev.local, creator@dev.local, viewer@dev.local)");

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
