import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
  console.log("Usuários no banco:");
  console.log(users);
}

main()
  .catch((e) => {
    console.error("Erro:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
