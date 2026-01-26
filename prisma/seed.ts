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
  // Com meta 3.5 e 30 XP/cig = 105 XP mesada/dia
  // Preços definidos pela Letícia
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        title: "Voucher especial",
        description: "Um voucher surpresa escolhido pela admin",
        imageUrl: "/images/voucher2.png",
        costXp: 170,
        dailyLimit: 1,
        sortOrder: 1,
      },
    }),
    prisma.reward.create({
      data: {
        title: "Esportes juntos",
        description:
          "Praticar esportes juntos no horário que você escolher, sem adiar",
        imageUrl: "/images/esportes2.png",
        costXp: 200,
        dailyLimit: 1,
        sortOrder: 2,
      },
    }),
    prisma.reward.create({
      data: {
        title: "Massagem relaxante 15min",
        description: "Uma massagem de 15 minutos para relaxar",
        imageUrl: "/images/massagem2.png",
        costXp: 220,
        dailyLimit: 1,
        sortOrder: 3,
      },
    }),
    prisma.reward.create({
      data: {
        title: "Jogar cassino",
        description: "Uma sessão de jogos no cassino",
        imageUrl: "/images/cassino2.png",
        costXp: 777,
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
  // Sistema de XP:
  // - Mesada diária: 100 XP (fixo, todo dia)
  // - Dentro da meta: +30 XP (bônus)
  // - Menos de 3 cigarros: +50 XP (bônus extra)
  const missions = await Promise.all([
    // Missões diárias
    prisma.mission.create({
      data: {
        title: "Dentro da meta",
        description: "Fume até a meta do dia",
        type: "DAILY",
        xpReward: 30,
        condition: "daily_under_limit",
      },
    }),
    prisma.mission.create({
      data: {
        title: "Super economia",
        description: "Fume no máximo 2 cigarros",
        type: "DAILY",
        xpReward: 50,
        targetValue: 3.0,
        condition: "daily_under_value",
      },
    }),
    // Missões semanais
    prisma.mission.create({
      data: {
        title: "Semana consistente",
        description: "5 dias dentro da meta",
        type: "WEEKLY",
        xpReward: 100,
        targetValue: 5,
        condition: "weekly_days_under_limit",
      },
    }),
    prisma.mission.create({
      data: {
        title: "Progresso real",
        description: "Média menor que semana passada",
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
      extraCost05: 12, // legado
      extraCost10: 20, // legado
      xpPerCig: 30, // 30 XP por cigarro
      dailyXpEnabled: true, // novo sistema ativo
    },
  });
  console.log("✅ Configuração do sistema criada (novo sistema de mesada)");

  // Dar 20 XP inicial ao usuário (além da mesada de 100 = 120 total)
  await prisma.xpLedger.create({
    data: {
      userId: user.id,
      delta: 20,
      type: "initial_bonus",
      note: "Bônus inicial de boas-vindas",
    },
  });
  console.log("✅ Usuário começa com 20 XP + 100 mesada = 120 XP");

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
