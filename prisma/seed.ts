import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Limpar dados existentes (em ordem de dependência)
  await prisma.userMission.deleteMany();
  await prisma.xpLedger.deleteMany();
  await prisma.rewardRedemption.deleteMany();
  await prisma.cigRequest.deleteMany();
  await prisma.dayLimit.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.reason.deleteMany();
  await prisma.systemConfig.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário ADMIN (Leticia)
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      email: "leticia@nosmoke.app",
      passwordHash: adminPassword,
      name: "Leticia",
      role: "ADMIN",
    },
  });
  console.log("✅ Admin criado:", admin.email);

  // Criar usuário USER (Leo)
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.create({
    data: {
      email: "leo@nosmoke.app",
      passwordHash: userPassword,
      name: "Leo",
      role: "USER",
    },
  });
  console.log("✅ Usuário criado:", user.email);

  // Criar recompensas da loja
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        title: "Massagem relaxante 15min",
        description: "Uma massagem de 15 minutos para relaxar",
        costXp: 70,
        dailyLimit: 1,
        sortOrder: 1,
      },
    }),
    prisma.reward.create({
      data: {
        title: "Voucher especial",
        description: "Um voucher surpresa escolhido pela admin",
        costXp: 150,
        dailyLimit: 1,
        sortOrder: 2,
      },
    }),
    prisma.reward.create({
      data: {
        title: "Esportes juntos",
        description:
          "Praticar esportes juntos no horário que você escolher, sem adiar",
        costXp: 220,
        dailyLimit: 1,
        sortOrder: 3,
      },
    }),
    prisma.reward.create({
      data: {
        title: "Jogar cassino",
        description: "Uma sessão de jogos no cassino",
        costXp: 800,
        dailyLimit: 1,
        sortOrder: 4,
      },
    }),
  ]);
  console.log("✅ Recompensas criadas:", rewards.length);

  // Criar motivos para pedidos
  const reasons = await Promise.all([
    prisma.reason.create({ data: { text: "Depois do café", sortOrder: 1 } }),
    prisma.reason.create({ data: { text: "Estresse", sortOrder: 2 } }),
    prisma.reason.create({ data: { text: "Após refeição", sortOrder: 3 } }),
    prisma.reason.create({ data: { text: "Pausa do trabalho", sortOrder: 4 } }),
    prisma.reason.create({ data: { text: "Ansiedade", sortOrder: 5 } }),
    prisma.reason.create({ data: { text: "Hábito/rotina", sortOrder: 6 } }),
    prisma.reason.create({ data: { text: "Vontade forte", sortOrder: 7 } }),
    prisma.reason.create({
      data: { text: "Social (com amigos)", sortOrder: 8 },
    }),
    prisma.reason.create({ data: { text: "Tédio", sortOrder: 9 } }),
    prisma.reason.create({ data: { text: "Antes de dormir", sortOrder: 10 } }),
  ]);
  console.log("✅ Motivos criados:", reasons.length);

  // Criar missões
  const missions = await Promise.all([
    // Missões diárias
    prisma.mission.create({
      data: {
        title: "Dia dentro da meta",
        description: "Fique dentro da meta diária",
        type: "DAILY",
        xpReward: 15,
        condition: "daily_under_limit",
      },
    }),
    prisma.mission.create({
      data: {
        title: "Abaixo de 3",
        description: "Consuma menos de 3 cigarros hoje",
        type: "DAILY",
        xpReward: 40,
        targetValue: 3.0,
        condition: "daily_under_value",
      },
    }),
    prisma.mission.create({
      data: {
        title: "Sem extras",
        description: "Não peça nenhum cigarro extra hoje",
        type: "DAILY",
        xpReward: 20,
        condition: "no_extras",
      },
    }),
    // Missões semanais
    prisma.mission.create({
      data: {
        title: "Semana campeã",
        description: "Fique dentro da meta em 5 dos 7 dias",
        type: "WEEKLY",
        xpReward: 50,
        targetValue: 5,
        condition: "weekly_days_under_limit",
      },
    }),
    prisma.mission.create({
      data: {
        title: "Redução real",
        description: "Média semanal menor que a semana anterior",
        type: "WEEKLY",
        xpReward: 75,
        condition: "weekly_reduction",
      },
    }),
  ]);
  console.log("✅ Missões criadas:", missions.length);

  // Criar configuração do sistema
  const config = await prisma.systemConfig.create({
    data: {
      weeklyReductionPct: 10,
      defaultDailyLimit: 3.5,
      extraCost05: 12,
      extraCost10: 20,
    },
  });
  console.log("✅ Configuração do sistema criada");

  // Dar XP inicial ao usuário para testar a loja
  await prisma.xpLedger.create({
    data: {
      userId: user.id,
      delta: 100,
      type: "bonus_inicial",
      note: "Bônus de boas-vindas",
    },
  });
  console.log("✅ XP inicial concedido ao usuário");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log("\n📝 Credenciais para teste:");
  console.log("   Admin: leticia@nosmoke.app / admin123");
  console.log("   User:  leo@nosmoke.app / user123");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
