import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = "admin123";
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const admin = await prisma.user.update({
    where: { email: "leticia@nosmoke.app" },
    data: { passwordHash: hashedPassword },
  });

  console.log("✅ Senha do admin atualizada!");
  console.log("   Email:", admin.email);
  console.log("   Nova senha:", newPassword);
}

main()
  .catch((e) => {
    console.error("❌ Erro:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
