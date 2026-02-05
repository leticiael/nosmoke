"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayBrasilia } from "@/lib/date-utils";
import { cigRequestSchema } from "@/lib/validations";
import {
  calculateExtraCost,
  addXp,
  getUserXp,
  getSystemConfig,
  calculateCigCost,
  grantDailyAllowance,
} from "@/lib/calculations";
import { generateCouponCode } from "@/lib/coupon";
import { revalidatePath } from "next/cache";
import { Decimal } from "@prisma/client/runtime/library";

export async function createCigRequest(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const rawData = {
    amount: formData.get("amount"),
    reason1: formData.get("reason1"),
    reason2: formData.get("reason2"),
  };

  const validation = cigRequestSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { amount, reason1, reason2 } = validation.data;
  const amountNum = parseFloat(amount);
  const today = todayBrasilia();

  // Garante que o usuário receba a mesada do dia (se ainda não recebeu)
  await grantDailyAllowance(session.user.id);

  const config = await getSystemConfig();
  const userXp = await getUserXp(session.user.id);

  // NOVO SISTEMA: Cobra XP por todos os cigarros
  if (config.dailyXpEnabled) {
    const { xpCost } = await calculateCigCost(amountNum);

    // No novo sistema, permite XP negativo (fica devendo)
    // Mas avisa se vai ficar negativo
    const willBeNegative = userXp - xpCost < 0;

    try {
      // Usa transação para evitar race conditions
      const result = await prisma.$transaction(async (tx) => {
        // Gera código de cupom único com retry
        let couponCode = generateCouponCode();
        let attempts = 0;
        const maxAttempts = 20;
        
        while (attempts < maxAttempts) {
          const existing = await tx.cigRequest.findFirst({
            where: { couponCode },
          });
          if (!existing) break;
          couponCode = generateCouponCode();
          attempts++;
        }
        
        if (attempts >= maxAttempts) {
          throw new Error("Não foi possível gerar código único");
        }

        // Cria o pedido
        const request = await tx.cigRequest.create({
          data: {
            userId: session.user.id,
            amount: new Decimal(amountNum),
            reason1,
            reason2,
            dateBr: today,
            status: "PENDING",
            couponCode,
          },
        });

        // Cobra XP pelo cigarro
        if (xpCost > 0) {
          await tx.xpLedger.create({
            data: {
              userId: session.user.id,
              delta: -xpCost,
              type: "cig_purchase",
              refId: request.id,
              note: `Cigarro: ${amountNum} (${today})`,
            },
          });
        }

        return request;
      });

      revalidatePath("/app");
      revalidatePath("/app/pedir");
      revalidatePath("/admin");

      return {
        success: true,
        isExtra: false, // No novo sistema não tem "extra"
        xpCost,
        couponCode: result.couponCode,
        requestId: result.id,
        willBeNegative,
        newBalance: userXp - xpCost,
      };
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      return { error: "Erro ao criar pedido. Tente novamente." };
    }
  }

  // SISTEMA LEGADO: Só cobra em extras
  const extraInfo = await calculateExtraCost(amountNum, today);

  if (extraInfo.isExtra && extraInfo.xpCost > 0) {
    if (userXp < extraInfo.xpCost) {
      return {
        error: `XP insuficiente para pedido extra. Você tem ${userXp} XP, mas precisa de ${extraInfo.xpCost} XP.`,
      };
    }
  }

  try {
    // Usa transação para evitar race conditions
    const result = await prisma.$transaction(async (tx) => {
      // Gera código de cupom único com retry
      let couponCode = generateCouponCode();
      let attempts = 0;
      const maxAttempts = 20;
      
      while (attempts < maxAttempts) {
        const existing = await tx.cigRequest.findFirst({
          where: { couponCode },
        });
        if (!existing) break;
        couponCode = generateCouponCode();
        attempts++;
      }
      
      if (attempts >= maxAttempts) {
        throw new Error("Não foi possível gerar código único");
      }

      // Cria o pedido
      const request = await tx.cigRequest.create({
        data: {
          userId: session.user.id,
          amount: new Decimal(amountNum),
          reason1,
          reason2,
          dateBr: today,
          status: "PENDING",
          couponCode,
        },
      });

      // Se é extra, desconta XP imediatamente (será devolvido se rejeitado)
      if (extraInfo.isExtra && extraInfo.xpCost > 0) {
        await tx.xpLedger.create({
          data: {
            userId: session.user.id,
            delta: -extraInfo.xpCost,
            type: "extra_penalty",
            refId: request.id,
            note: `Pedido extra: ${amountNum} cigarro(s)`,
          },
        });
      }

      return request;
    });

    revalidatePath("/app");
    revalidatePath("/app/pedir");
    revalidatePath("/admin");

    return {
      success: true,
      isExtra: extraInfo.isExtra,
      xpCost: extraInfo.xpCost,
      couponCode: result.couponCode,
      requestId: result.id,
    };
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return { error: "Erro ao criar pedido. Tente novamente." };
  }
}

export async function getReasons() {
  const reasons = await prisma.reason.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return reasons;
}

export async function getPendingRequests() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const requests = await prisma.cigRequest.findMany({
    where: {
      userId: session.user.id,
      status: "PENDING",
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
}

export async function getExtraPreview(amount: string): Promise<{
  isExtra: boolean;
  xpCost: number;
  userXp: number;
  canAfford: boolean;
  newSystem?: boolean;
  willBeNegative?: boolean;
} | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) {
    return null;
  }

  const config = await getSystemConfig();
  const userXp = await getUserXp(session.user.id);

  // Garante mesada do dia
  await grantDailyAllowance(session.user.id);
  const updatedXp = await getUserXp(session.user.id);

  // NOVO SISTEMA
  if (config.dailyXpEnabled) {
    const { xpCost } = await calculateCigCost(amountNum);
    const willBeNegative = updatedXp - xpCost < 0;

    return {
      isExtra: false,
      xpCost,
      userXp: updatedXp,
      canAfford: true, // No novo sistema sempre pode (fica devendo)
      newSystem: true,
      willBeNegative,
    };
  }

  // SISTEMA LEGADO
  const today = todayBrasilia();
  const extraInfo = await calculateExtraCost(amountNum, today);

  return {
    ...extraInfo,
    userXp: updatedXp,
    canAfford: updatedXp >= extraInfo.xpCost,
    newSystem: false,
  };
}

export async function getCigRequestHistory(page: number = 1, limit: number = 15) {
  const session = await auth();
  if (!session?.user?.id) {
    return { items: [], hasMore: false };
  }

  const skip = (page - 1) * limit;

  const requests = await prisma.cigRequest.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit + 1,
  });

  const hasMore = requests.length > limit;
  const items = requests.slice(0, limit).map((r) => ({
    id: r.id,
    amount: r.amount.toString(),
    reason: r.reason1,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    dateBr: r.dateBr,
  }));

  return { items, hasMore };
}

export async function getCigRequestStats() {
  const session = await auth();
  if (!session?.user?.id) {
    return { today: 0, week: 0, month: 0 };
  }

  const today = todayBrasilia();
  const now = new Date();
  
  // Início da semana (domingo)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  // Início do mês
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayResult, weekResult, monthResult] = await Promise.all([
    prisma.cigRequest.aggregate({
      where: {
        userId: session.user.id,
        dateBr: today,
        status: "APPROVED",
      },
      _sum: { amount: true },
    }),
    prisma.cigRequest.aggregate({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        createdAt: { gte: weekStart },
      },
      _sum: { amount: true },
    }),
    prisma.cigRequest.aggregate({
      where: {
        userId: session.user.id,
        status: "APPROVED",
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
  ]);

  const toNum = (val: Decimal | null) => 
    val ? (typeof val === "number" ? val : Number(val)) : 0;

  return {
    today: toNum(todayResult._sum.amount),
    week: toNum(weekResult._sum.amount),
    month: toNum(monthResult._sum.amount),
  };
}
