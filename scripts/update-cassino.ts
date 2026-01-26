import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.reward.updateMany({
    where: { title: "Jogar cassino" },
    data: { imageUrl: "/images/cassino2.png" },
  });
  console.log("Atualizado:", result);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
