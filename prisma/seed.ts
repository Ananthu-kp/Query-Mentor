import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  await prisma.user.upsert({
    where: { email: "student@test.com" },
    update: {},
    create: {
      email: "student@test.com",
      name: "Test Student",
      password,
      role: "STUDENT",
    },
  });

  await prisma.user.upsert({
    where: { email: "instructor@test.com" },
    update: {},
    create: {
      email: "instructor@test.com",
      name: "Test Instructor",
      password,
      role: "INSTRUCTOR",
    },
  });

  console.log("Seeded users");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
