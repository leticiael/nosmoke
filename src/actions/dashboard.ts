"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  todayBrasilia,
  getWeekStart,
  getWeekEnd,
  getCurrentWeekDays,
} from "@/lib/date-utils";
import {
  getDashboardStats,
  getProgressChartData,
  getTotalForDay,
  getDayLimit,
  addXp,
  getUserXp,
  grantDailyAllowance,
  getDailyXpStats,
  getTotalsForDays,
  getSystemConfig,
} from "@/lib/calculations";

interface MissionData {
  id: string;
  missionId: string;
  title: string;
  description: string | null;
  xpReward: number;
  type: string;
  progress: number;
  target: number;
  status: string;
}

export async function getUserDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  // Garante que o usuário receba a mesada do dia
  await grantDailyAllowance(session.user.id);

  const stats = await getDashboardStats(session.user.id);
  const dailyXp = await getDailyXpStats(session.user.id);
  
  // Dados adicionais para o dashboard
  const today = todayBrasilia();
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();
  const weekDays = getCurrentWeekDays();
  
  // Busca limites e totais da semana
  const totalsMap = await getTotalsForDays(weekDays);
  const dayLimits = await prisma.dayLimit.findMany({
    where: { date: { in: weekDays } },
    select: { date: true, limitCigs: true },
  });
  const limitsMap = new Map(dayLimits.map(dl => [dl.date, dl.limitCigs.toNumber()]));
  
  const config = await prisma.systemConfig.findFirst();
  const defaultLimit = config?.defaultDailyLimit?.toNumber() ?? 3.5;
  
  // Calcula streak e total semanal
  let streakDays = 0;
  let streakBroken = false;
  const sortedDays = [...weekDays].filter(d => d <= today).sort((a, b) => b.localeCompare(a));
  
  for (const day of sortedDays) {
    const dayTotal = totalsMap.get(day) ?? 0;
    const dayLimit = limitsMap.get(day) ?? defaultLimit;
    if (dayTotal <= dayLimit && !streakBroken) {
      streakDays++;
    } else {
      streakBroken = true;
    }
  }
  
  // XP ganho na semana
  const weeklyXpResult = await prisma.xpLedger.aggregate({
    where: {
      userId: session.user.id,
      delta: { gt: 0 },
      createdAt: {
        gte: new Date(`${weekStart}T00:00:00-03:00`),
        lte: new Date(`${weekEnd}T23:59:59-03:00`),
      },
    },
    _sum: { delta: true },
  });
  const weeklyXpRaw = weeklyXpResult._sum.delta;
  const weeklyXp = weeklyXpRaw 
    ? (typeof weeklyXpRaw === "number" ? weeklyXpRaw : Number(weeklyXpRaw))
    : 0;

  return {
    ...stats,
    name: session.user.name,
    userName: session.user.name,
    dailyXp,
    streakDays,
    weeklyXp,
    weeklyTotal: stats.weekTotal,
    weeklyLimit: Math.round(defaultLimit * 7),
  };
}

export async function getProgressData() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const today = todayBrasilia();
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  // Resumo da semana - busca todos os dados em batch para evitar N+1
  const weekDays = getCurrentWeekDays();
  const totalsMap = await getTotalsForDays(weekDays);
  
  // Busca todos os limits em uma query
  const dayLimits = await prisma.dayLimit.findMany({
    where: { date: { in: weekDays } },
    select: { date: true, limitCigs: true },
  });
  const limitsMap = new Map(dayLimits.map(dl => [dl.date, dl.limitCigs.toNumber()]));
  
  // Busca o limite padrão
  const config = await prisma.systemConfig.findFirst();
  const defaultLimit = config?.defaultDailyLimit?.toNumber() ?? 3.5;

  let daysUnderLimit = 0;
  let totalWeek = 0;
  let streakDays = 0;
  let streakBroken = false;

  // Ordena os dias da semana do mais recente para o mais antigo para calcular streak
  const sortedDays = [...weekDays].filter(d => d <= today).sort((a, b) => b.localeCompare(a));

  for (const day of sortedDays) {
    const dayTotal = totalsMap.get(day) ?? 0;
    const dayLimit = limitsMap.get(day) ?? defaultLimit;
    totalWeek += dayTotal;
    if (dayTotal <= dayLimit) {
      daysUnderLimit++;
      if (!streakBroken) {
        streakDays++;
      }
    } else {
      streakBroken = true;
    }
  }

  // Busca XP total e da semana
  const totalXp = await getUserXp(session.user.id);
  
  const weeklyXpResult = await prisma.xpLedger.aggregate({
    where: {
      userId: session.user.id,
      delta: { gt: 0 },
      createdAt: {
        gte: new Date(`${weekStart}T00:00:00-03:00`),
        lte: new Date(`${weekEnd}T23:59:59-03:00`),
      },
    },
    _sum: { delta: true },
  });
  const weeklyXpRaw = weeklyXpResult._sum.delta;
  const weeklyXp = weeklyXpRaw 
    ? (typeof weeklyXpRaw === "number" ? weeklyXpRaw : Number(weeklyXpRaw))
    : 0;

  // Formata as datas para exibição
  const formatDateBr = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  };

  return {
    daysUnderLimit,
    streakDays,
    weeklyTotal: totalWeek,
    weeklyLimit: defaultLimit * 7,
    currentLimit: defaultLimit,
    totalXp,
    weeklyXp,
    weekStart: formatDateBr(weekStart),
    weekEnd: formatDateBr(weekEnd),
  };
}

export async function getUserMissions() {
  const session = await auth();
  if (!session?.user?.id) {
    return { daily: [], weekly: [] };
  }

  // Verifica se o usuário existe no banco
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    return { daily: [], weekly: [] };
  }

  const today = todayBrasilia();
  const weekStart = getWeekStart();
  const weekEnd = getWeekEnd();

  // Busca missões ativas
  const missions = await prisma.mission.findMany({
    where: { active: true },
  });

  // Busca ou cria as missões do usuário para o período atual
  const dailyMissions: MissionData[] = [];
  const weeklyMissions: MissionData[] = [];
  
  // Busca config do sistema para saber se o novo sistema está ativo
  const config = await getSystemConfig();

  for (const mission of missions) {
    if (mission.type === "DAILY") {
      // Verifica se já existe missão para hoje
      let userMission = await prisma.userMission.findFirst({
        where: {
          userId: session.user.id,
          missionId: mission.id,
          startDate: today,
        },
      });

      if (!userMission) {
        // Cria missão do dia
        userMission = await prisma.userMission.create({
          data: {
            userId: session.user.id,
            missionId: mission.id,
            startDate: today,
            endDate: today,
          },
        });
      }

      // Calcula progresso
      const todayTotal = await getTotalForDay(today);
      const todayLimit = await getDayLimit(today);
      let progress = 0;
      let target = 1;

      if (mission.condition === "daily_under_limit") {
        progress = todayTotal <= todayLimit ? 1 : 0;
        target = 1;
      } else if (mission.condition === "daily_under_value") {
        target = mission.targetValue?.toNumber() ?? 3;
        progress = todayTotal < target ? 1 : 0;
      } else if (mission.condition === "no_extras") {
        // Verifica se houve pedidos extras
        // No novo sistema, "extras" são cigarros comprados acima da mesada
        if (config.dailyXpEnabled) {
          // No novo sistema: verifica se gastou mais XP do que recebeu de mesada
          const xpSpentToday = await prisma.xpLedger.aggregate({
            where: {
              userId: session.user.id,
              type: "cig_purchase",
              createdAt: {
                gte: new Date(`${today}T00:00:00-03:00`),
                lt: new Date(`${today}T23:59:59-03:00`),
              },
            },
            _sum: { delta: true },
          });
          const allowanceToday = await prisma.xpLedger.aggregate({
            where: {
              userId: session.user.id,
              type: "daily_allowance",
              createdAt: {
                gte: new Date(`${today}T00:00:00-03:00`),
                lt: new Date(`${today}T23:59:59-03:00`),
              },
            },
            _sum: { delta: true },
          });
          const spentRaw = xpSpentToday._sum.delta;
          const spent = Math.abs(spentRaw ? (typeof spentRaw === "number" ? spentRaw : Number(spentRaw)) : 0);
          const allowanceRaw = allowanceToday._sum.delta;
          const allowance = allowanceRaw ? (typeof allowanceRaw === "number" ? allowanceRaw : Number(allowanceRaw)) : 0;
          progress = spent <= allowance ? 1 : 0;
        } else {
          // Sistema legado: verifica extra_penalty
          const extraPenalties = await prisma.xpLedger.count({
            where: {
              userId: session.user.id,
              type: "extra_penalty",
              createdAt: {
                gte: new Date(`${today}T00:00:00-03:00`),
                lt: new Date(`${today}T23:59:59-03:00`),
              },
            },
          });
          progress = extraPenalties === 0 ? 1 : 0;
        }
        target = 1;
      }

      dailyMissions.push({
        id: userMission.id,
        missionId: mission.id,
        title: mission.title,
        description: mission.description,
        xpReward: mission.xpReward,
        type: mission.type,
        progress,
        target,
        status: userMission.status,
      });
    } else {
      // Missão semanal
      let userMission = await prisma.userMission.findFirst({
        where: {
          userId: session.user.id,
          missionId: mission.id,
          startDate: weekStart,
        },
      });

      if (!userMission) {
        userMission = await prisma.userMission.create({
          data: {
            userId: session.user.id,
            missionId: mission.id,
            startDate: weekStart,
            endDate: weekEnd,
          },
        });
      }

      // Calcula progresso semanal
      const weekDays = getCurrentWeekDays();
      let daysUnderLimit = 0;

      for (const day of weekDays) {
        if (day > today) continue; // Só conta dias passados
        const dayTotal = await getTotalForDay(day);
        const dayLimit = await getDayLimit(day);
        if (dayTotal <= dayLimit) {
          daysUnderLimit++;
        }
      }

      const target = mission.targetValue?.toNumber() ?? 5;

      weeklyMissions.push({
        id: userMission.id,
        missionId: mission.id,
        title: mission.title,
        description: mission.description,
        xpReward: mission.xpReward,
        type: mission.type,
        progress: daysUnderLimit,
        target,
        status: userMission.status,
      });
    }
  }

  return { daily: dailyMissions, weekly: weeklyMissions };
}

export async function getWeekHistory() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const weekDays = getCurrentWeekDays();
  const today = todayBrasilia();
  const totalsMap = await getTotalsForDays(weekDays);

  // Busca todos os limits em uma query
  const dayLimits = await prisma.dayLimit.findMany({
    where: { date: { in: weekDays } },
    select: { date: true, limitCigs: true },
  });
  const limitsMap = new Map(dayLimits.map((dl) => [dl.date, dl.limitCigs.toNumber()]));

  // Busca o limite padrão
  const config = await prisma.systemConfig.findFirst();
  const defaultLimit = config?.defaultDailyLimit?.toNumber() ?? 3.5;

  const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  return weekDays
    .filter((day) => day <= today) // Só mostra dias até hoje
    .map((day) => {
      const total = totalsMap.get(day) ?? 0;
      const limit = limitsMap.get(day) ?? defaultLimit;
      const date = new Date(day + "T12:00:00");
      return {
        dateBr: day.split("-").reverse().join("/"),
        dayName: dayNames[date.getDay()],
        total,
        limit,
        underLimit: total <= limit,
      };
    });
}

export async function checkAndAwardMissions() {
  const session = await auth();
  if (!session?.user?.id) {
    return;
  }

  const today = todayBrasilia();

  // Busca missões diárias de ontem que ainda não foram premiadas
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const pendingDailyMissions = await prisma.userMission.findMany({
    where: {
      userId: session.user.id,
      endDate: yesterdayStr,
      status: "IN_PROGRESS",
      xpAwarded: false,
    },
    include: { mission: true },
  });

  for (const um of pendingDailyMissions) {
    const dayTotal = await getTotalForDay(um.endDate);
    const dayLimit = await getDayLimit(um.endDate);
    let completed = false;

    if (um.mission.condition === "daily_under_limit") {
      completed = dayTotal <= dayLimit;
    } else if (um.mission.condition === "daily_under_value") {
      const target = um.mission.targetValue?.toNumber() ?? 3;
      completed = dayTotal < target;
    } else if (um.mission.condition === "no_extras") {
      const config = await getSystemConfig();
      if (config.dailyXpEnabled) {
        // No novo sistema: verifica se gastou mais XP do que recebeu de mesada
        const xpSpent = await prisma.xpLedger.aggregate({
          where: {
            userId: session.user.id,
            type: "cig_purchase",
            createdAt: {
              gte: new Date(`${um.endDate}T00:00:00-03:00`),
              lt: new Date(`${um.endDate}T23:59:59-03:00`),
            },
          },
          _sum: { delta: true },
        });
        const allowance = await prisma.xpLedger.aggregate({
          where: {
            userId: session.user.id,
            type: "daily_allowance",
            createdAt: {
              gte: new Date(`${um.endDate}T00:00:00-03:00`),
              lt: new Date(`${um.endDate}T23:59:59-03:00`),
            },
          },
          _sum: { delta: true },
        });
        const spentRaw = xpSpent._sum.delta;
        const spent = Math.abs(spentRaw ? (typeof spentRaw === "number" ? spentRaw : Number(spentRaw)) : 0);
        const allowanceRaw = allowance._sum.delta;
        const allowanceVal = allowanceRaw ? (typeof allowanceRaw === "number" ? allowanceRaw : Number(allowanceRaw)) : 0;
        completed = spent <= allowanceVal;
      } else {
        // Sistema legado
        const extraPenalties = await prisma.xpLedger.count({
          where: {
            userId: session.user.id,
            type: "extra_penalty",
            createdAt: {
              gte: new Date(`${um.endDate}T00:00:00-03:00`),
              lt: new Date(`${um.endDate}T23:59:59-03:00`),
            },
          },
        });
        completed = extraPenalties === 0;
      }
    }

    if (completed) {
      await addXp(
        session.user.id,
        um.mission.xpReward,
        "mission",
        um.id,
        `Missão: ${um.mission.title}`,
      );
    }

    await prisma.userMission.update({
      where: { id: um.id },
      data: {
        status: completed ? "COMPLETED" : "FAILED",
        completedAt: completed ? new Date() : null,
        xpAwarded: true,
      },
    });
  }
}
