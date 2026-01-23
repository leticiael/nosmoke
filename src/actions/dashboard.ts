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
} from "@/lib/calculations";

export async function getUserDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const stats = await getDashboardStats(session.user.id);

  return {
    ...stats,
    userName: session.user.name,
  };
}

export async function getProgressData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { chartData: [], weekSummary: null };
  }

  const chartData = await getProgressChartData();

  // Resumo da semana
  const weekDays = getCurrentWeekDays();
  let daysUnderLimit = 0;
  let totalWeek = 0;

  for (const day of weekDays) {
    const dayTotal = await getTotalForDay(day);
    const dayLimit = await getDayLimit(day);
    totalWeek += dayTotal;
    if (dayTotal <= dayLimit) {
      daysUnderLimit++;
    }
  }

  return {
    chartData,
    weekSummary: {
      daysUnderLimit,
      totalDays: weekDays.length,
      totalWeek,
      averagePerDay: totalWeek / weekDays.length,
    },
  };
}

export async function getUserMissions() {
  const session = await auth();
  if (!session?.user?.id) {
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
  const dailyMissions: any[] = [];
  const weeklyMissions: any[] = [];

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
