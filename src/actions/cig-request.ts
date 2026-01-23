"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayBrasilia } from "@/lib/date-utils";
import { cigRequestSchema } from "@/lib/validations";
import { calculateExtraCost, addXp, getUserXp } from "@/lib/calculations";
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

  // Verifica se é extra e calcula custo em XP
  const extraInfo = await calculateExtraCost(amountNum, today);

  if (extraInfo.isExtra && extraInfo.xpCost > 0) {
    const userXp = await getUserXp(session.user.id);
    if (userXp < extraInfo.xpCost) {
      return {
        error: `XP insuficiente para pedido extra. Você tem ${userXp} XP, mas precisa de ${extraInfo.xpCost} XP.`,
      };
    }
  }

  try {
    // Cria o pedido
    const request = await prisma.cigRequest.create({
      data: {
        userId: session.user.id,
        amount: new Decimal(amountNum),
        reason1,
        reason2,
        dateBr: today,
        status: "PENDING",
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

export async function getExtraPreview(amount: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { isExtra: false, xpCost: 0 };
  }

  const amountNum = parseFloat(amount);
  if (isNaN(amountNum)) {
    return { isExtra: false, xpCost: 0 };
  }

  const today = todayBrasilia();
  const extraInfo = await calculateExtraCost(amountNum, today);
  const userXp = await getUserXp(session.user.id);

  return {
    ...extraInfo,
    userXp,
    canAfford: userXp >= extraInfo.xpCost,
  };
}
