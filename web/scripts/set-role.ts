/**
 * Dev utility: update a user's role directly in the database.
 * Usage:  tsx scripts/set-role.ts <email> <ADMIN|CREATOR|VIEWER>
 * Example: npm run dev:set-role -- piotrsuchypp@gmail.com ADMIN
 *
 * Sign out and sign in again after running so the JWT picks up the new role.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.argv[2];
  const role = process.argv[3] as "ADMIN" | "CREATOR" | "VIEWER" | undefined;

  if (!email || !role || !["ADMIN", "CREATOR", "VIEWER"].includes(role)) {
    console.error("Usage: tsx scripts/set-role.ts <email> <ADMIN|CREATOR|VIEWER>");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role },
    select: { email: true, role: true },
  });

  console.log(`✓ ${user.email} is now ${user.role}`);
  console.log("Sign out and sign back in for the change to take effect.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
