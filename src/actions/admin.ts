"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayBrasilia, formatDateTimeBR } from "@/lib/date-utils";
import {
  approveRequestSchema,
  validateRedemptionSchema,
  setDayLimitSchema,
  updateConfigSchema,
} from "@/lib/validations";
import { addXp, getTotalForDay, getDayLimit } from "@/lib/calculations";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

type CigRequestWithUser = Prisma.CigRequestGetPayload<{
  include: { user: { select: { name: true } } };
}>;

type RedemptionWithUserAndReward = Prisma.RewardRedemptionGetPayload<{
  include: {
    user: { select: { name: true } };
    reward: { select: { title: true; costXp: true } };
  };
}>;

type DayLimitRecord = Prisma.DayLimitGetPayload<object>;

// Verifica se o usuário é admin
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }
  return session;
}

export async function getPendingRequestsAdmin() {
  await requireAdmin();

  const requests = await prisma.cigRequest.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return requests.map((r: CigRequestWithUser) => ({
    id: r.id,
    userName: r.user.name,
    amount: r.amount.toNumber(),
    reason1: r.reason1,
    reason2: r.reason2,
    createdAt: formatDateTimeBR(r.createdAt),
    dateBr: r.dateBr,
  }));
}

export async function approveOrRejectRequest(formData: FormData) {
  await requireAdmin();

  const rawData = {
    requestId: formData.get("requestId"),
    action: formData.get("action"),
  };

  const validation = approveRequestSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { requestId, action } = validation.data;

  try {
    const request = await prisma.cigRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { error: "Pedido não encontrado" };
    }

    if (request.status !== "PENDING") {
      return { error: "Pedido já foi processado" };
    }

    if (action === "approve") {
      await prisma.cigRequest.update({
        where: { id: requestId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });
    } else {
      // Se rejeitado, devolve XP se foi cobrado (pedido extra)
      const xpEntry = await prisma.xpLedger.findFirst({
        where: {
          refId: requestId,
          type: "extra_penalty",
        },
      });

      if (xpEntry) {
        await addXp(
          request.userId,
          Math.abs(xpEntry.delta), // Devolve o valor
          "extra_refund",
          requestId,
          "Devolução por pedido rejeitado",
        );
      }

      await prisma.cigRequest.update({
        where: { id: requestId },
        data: { status: "REJECTED" },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/app");

    return { success: true };
  } catch (error) {
    console.error("Erro ao processar pedido:", error);
    return { error: "Erro ao processar pedido" };
  }
}

export async function getPendingRedemptionsAdmin() {
  await requireAdmin();

  const redemptions = await prisma.rewardRedemption.findMany({
    where: { status: "PENDING" },
    include: {
      user: { select: { name: true } },
      reward: { select: { title: true, costXp: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return redemptions.map((r: RedemptionWithUserAndReward) => ({
    id: r.id,
    userName: r.user.name,
    rewardTitle: r.reward.title,
    costXp: r.reward.costXp,
    createdAt: formatDateTimeBR(r.createdAt),
    dateBr: r.dateBr,
  }));
}

export async function validateOrRejectRedemption(formData: FormData) {
  await requireAdmin();

  const rawData = {
    redemptionId: formData.get("redemptionId"),
    action: formData.get("action"),
  };

  const validation = validateRedemptionSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { redemptionId, action } = validation.data;

  try {
    const redemption = await prisma.rewardRedemption.findUnique({
      where: { id: redemptionId },
      include: { reward: true },
    });

    if (!redemption) {
      return { error: "Resgate não encontrado" };
    }

    if (redemption.status !== "PENDING") {
      return { error: "Resgate já foi processado" };
    }

    if (action === "validate") {
      await prisma.rewardRedemption.update({
        where: { id: redemptionId },
        data: {
          status: "VALIDATED",
          validatedAt: new Date(),
        },
      });
    } else {
      // Devolve XP se rejeitado
      await addXp(
        redemption.userId,
        redemption.reward.costXp,
        "reward_refund",
        redemptionId,
        `Devolução: ${redemption.reward.title}`,
      );

      await prisma.rewardRedemption.update({
        where: { id: redemptionId },
        data: { status: "REJECTED" },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/app/loja");

    return { success: true };
  } catch (error) {
    console.error("Erro ao processar resgate:", error);
    return { error: "Erro ao processar resgate" };
  }
}

export async function getHistoryAdmin(page: number = 1, limit: number = 20) {
  await requireAdmin();

  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.cigRequest.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.cigRequest.count(),
  ]);

  return {
    requests: requests.map((r: CigRequestWithUser) => ({
      id: r.id,
      userName: r.user.name,
      amount: r.amount.toNumber(),
      reason1: r.reason1,
      reason2: r.reason2,
      status: r.status,
      createdAt: formatDateTimeBR(r.createdAt),
      approvedAt: r.approvedAt ? formatDateTimeBR(r.approvedAt) : null,
      dateBr: r.dateBr,
    })),
    total,
    pages: Math.ceil(total / limit),
  };
}

export async function setDayLimit(formData: FormData) {
  await requireAdmin();

  const rawData = {
    date: formData.get("date"),
    limit: formData.get("limit"),
  };

  const validation = setDayLimitSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { date, limit } = validation.data;

  try {
    await prisma.dayLimit.upsert({
      where: { date },
      update: { limitCigs: new Decimal(limit) },
      create: {
        date,
        limitCigs: new Decimal(limit),
      },
    });

    revalidatePath("/admin/config");
    revalidatePath("/app");

    return { success: true };
  } catch (error) {
    console.error("Erro ao definir meta:", error);
    return { error: "Erro ao definir meta" };
  }
}

export async function updateSystemConfig(formData: FormData) {
  await requireAdmin();

  const rawData = {
    weeklyReductionPct: formData.get("weeklyReductionPct"),
    defaultDailyLimit: formData.get("defaultDailyLimit"),
    extraCost05: formData.get("extraCost05"),
    extraCost10: formData.get("extraCost10"),
  };

  const validation = updateConfigSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const data = validation.data;

  try {
    const config = await prisma.systemConfig.findFirst();

    if (config) {
      await prisma.systemConfig.update({
        where: { id: config.id },
        data: {
          ...(data.weeklyReductionPct !== undefined && {
            weeklyReductionPct: new Decimal(data.weeklyReductionPct),
          }),
          ...(data.defaultDailyLimit !== undefined && {
            defaultDailyLimit: new Decimal(data.defaultDailyLimit),
          }),
          ...(data.extraCost05 !== undefined && {
            extraCost05: data.extraCost05,
          }),
          ...(data.extraCost10 !== undefined && {
            extraCost10: data.extraCost10,
          }),
        },
      });
    }

    revalidatePath("/admin/config");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar config:", error);
    return { error: "Erro ao atualizar configurações" };
  }
}

export async function getSystemConfigAdmin() {
  await requireAdmin();

  const config = await prisma.systemConfig.findFirst();

  return config
    ? {
        weeklyReductionPct: config.weeklyReductionPct.toNumber(),
        defaultDailyLimit: config.defaultDailyLimit.toNumber(),
        extraCost05: config.extraCost05,
        extraCost10: config.extraCost10,
      }
    : null;
}

export async function getDayLimitsAdmin() {
  await requireAdmin();

  const today = todayBrasilia();
  const limits = await prisma.dayLimit.findMany({
    where: { date: { gte: today } },
    orderBy: { date: "asc" },
    take: 14,
  });

  return limits.map((l: DayLimitRecord) => ({
    date: l.date,
    limit: l.limitCigs.toNumber(),
  }));
}

export async function getAdminDashboardStats() {
  await requireAdmin();

  const today = todayBrasilia();

  const [
    pendingRequests,
    pendingRedemptions,
    todayTotal,
    todayLimit,
    todayApproved,
    todayRejected,
  ] = await Promise.all([
    prisma.cigRequest.count({ where: { status: "PENDING" } }),
    prisma.rewardRedemption.count({ where: { status: "PENDING" } }),
    getTotalForDay(today),
    getDayLimit(today),
    prisma.cigRequest.count({ where: { dateBr: today, status: "APPROVED" } }),
    prisma.cigRequest.count({ where: { dateBr: today, status: "REJECTED" } }),
  ]);

  return {
    pendingRequests,
    pendingRedemptions,
    todayTotal,
    todayLimit,
    todayApproved,
    todayRejected,
  };
}
