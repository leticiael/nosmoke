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
      // Gera código de cupom único
      let couponCode = generateCouponCode();
      let attempts = 0;
      while (attempts < 10) {
        const existing = await prisma.cigRequest.findFirst({
          where: { couponCode },
        });
        if (!existing) break;
        couponCode = generateCouponCode();
        attempts++;
      }

      // Cria o pedido
      const request = await prisma.cigRequest.create({
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
        await addXp(
          session.user.id,
          -xpCost,
          "cig_purchase",
          request.id,
          `Cigarro: ${amountNum} (${today})`,
        );
      }

      revalidatePath("/app");
      revalidatePath("/app/pedir");
      revalidatePath("/admin");

      return {
        success: true,
        isExtra: false, // No novo sistema não tem "extra"
        xpCost,
        couponCode: request.couponCode,
        requestId: request.id,
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
    // Gera código de cupom único
    let couponCode = generateCouponCode();
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.cigRequest.findFirst({
        where: { couponCode },
      });
      if (!existing) break;
      couponCode = generateCouponCode();
      attempts++;
    }

    // Cria o pedido
    const request = await prisma.cigRequest.create({
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
      await addXp(
        session.user.id,
        -extraInfo.xpCost,
        "extra_penalty",
        request.id,
        `Pedido extra: ${amountNum} cigarro(s)`,
      );
    }

    revalidatePath("/app");
    revalidatePath("/app/pedir");
    revalidatePath("/admin");

    return {
      success: true,
      isExtra: extraInfo.isExtra,
      xpCost: extraInfo.xpCost,
      couponCode: request.couponCode,
      requestId: request.id,
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
