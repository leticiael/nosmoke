"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";

export async function getCouponDetails(code: string) {
  noStore(); // Garante que não usa cache

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  // Busca em CigRequest
  const cigRequest = await prisma.cigRequest.findFirst({
    where: { couponCode: code },
    include: { user: true },
  });

  if (cigRequest) {
    // Verifica se o cupom pertence ao usuário ou se é admin
    if (
      cigRequest.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return { error: "Cupom não encontrado" };
    }

    return {
      coupon: {
        id: cigRequest.id,
        type: "cigarette" as const,
        status: cigRequest.status,
        couponCode: cigRequest.couponCode || "",
        createdAt: cigRequest.createdAt.toISOString(),
        amount: cigRequest.amount.toNumber(),
        reason: cigRequest.reason1,
      },
    };
  }

  // Busca em RewardRedemption
  const redemption = await prisma.rewardRedemption.findFirst({
    where: { couponCode: code },
    include: { user: true, reward: true },
  });

  if (redemption) {
    // Verifica se o cupom pertence ao usuário ou se é admin
    if (
      redemption.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return { error: "Cupom não encontrado" };
    }

    return {
      coupon: {
        id: redemption.id,
        type: "reward" as const,
        status: redemption.status,
        couponCode: redemption.couponCode || "",
        createdAt: redemption.createdAt.toISOString(),
        rewardTitle: redemption.reward.title,
        rewardDescription: redemption.reward.description,
      },
    };
  }

  return { error: "Cupom não encontrado" };
}

// Valida cupom (para admin)
export async function validateCoupon(
  code: string,
  action: "approve" | "reject",
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" };
  }

  // Tenta atualizar CigRequest
  const cigRequest = await prisma.cigRequest.findFirst({
    where: { couponCode: code },
  });

  if (cigRequest) {
    if (cigRequest.status !== "PENDING") {
      return { error: "Este cupom já foi processado" };
    }

    if (action === "approve") {
      await prisma.cigRequest.update({
        where: { id: cigRequest.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });
    } else {
      // Devolve XP se foi cobrado (sistema legado ou novo)
      const xpEntry = await prisma.xpLedger.findFirst({
        where: {
          refId: cigRequest.id,
          type: { in: ["extra_penalty", "cig_purchase"] },
        },
      });

      if (xpEntry) {
        await prisma.xpLedger.create({
          data: {
            userId: cigRequest.userId,
            delta: Math.abs(xpEntry.delta),
            type: "cig_refund",
            refId: cigRequest.id,
            note: "Devolução por cupom rejeitado",
          },
        });
      }

      await prisma.cigRequest.update({
        where: { id: cigRequest.id },
        data: { status: "REJECTED" },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/app");
    revalidatePath(`/app/cupom/${code}`);
    return { success: true, type: "cigarette" };
  }

  // Tenta atualizar RewardRedemption
  const redemption = await prisma.rewardRedemption.findFirst({
    where: { couponCode: code },
    include: { reward: true },
  });

  if (redemption) {
    if (redemption.status !== "PENDING") {
      return { error: "Este cupom já foi processado" };
    }

    if (action === "approve") {
      await prisma.rewardRedemption.update({
        where: { id: redemption.id },
        data: {
          status: "VALIDATED",
          validatedAt: new Date(),
        },
      });
    } else {
      // Devolve XP se foi cobrado
      await prisma.xpLedger.create({
        data: {
          userId: redemption.userId,
          delta: redemption.reward.costXp,
          type: "reward_refund",
          refId: redemption.id,
          note: `Devolução: ${redemption.reward.title}`,
        },
      });

      await prisma.rewardRedemption.update({
        where: { id: redemption.id },
        data: { status: "REJECTED" },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/app");
    revalidatePath(`/app/cupom/${code}`);
    return { success: true, type: "reward" };
  }

  return { error: "Cupom não encontrado" };
}

// Lista cupons pendentes (para admin)
export async function getPendingCoupons() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { cigarettes: [], rewards: [] };
  }

  const [cigarettes, rewards] = await Promise.all([
    prisma.cigRequest.findMany({
      where: { status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.rewardRedemption.findMany({
      where: { status: "PENDING" },
      include: { user: true, reward: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    cigarettes: cigarettes.map((c) => ({
      id: c.id,
      couponCode: c.couponCode || "",
      userName: c.user.name,
      amount: c.amount.toNumber(),
      reason: c.reason1,
      createdAt: c.createdAt.toISOString(),
    })),
    rewards: rewards.map((r) => ({
      id: r.id,
      couponCode: r.couponCode || "",
      userName: r.user.name,
      rewardTitle: r.reward.title,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

// Busca cupom por código (para scanner do admin)
export async function searchCoupon(code: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { error: "Não autorizado" };
  }

  const normalizedCode = code.replace(/-/g, "").toUpperCase();

  // Busca em CigRequest
  const cigRequest = await prisma.cigRequest.findFirst({
    where: { couponCode: normalizedCode },
    include: { user: true },
  });

  if (cigRequest) {
    return {
      found: true,
      coupon: {
        id: cigRequest.id,
        type: "cigarette" as const,
        status: cigRequest.status,
        couponCode: cigRequest.couponCode || "",
        userName: cigRequest.user.name,
        amount: cigRequest.amount.toNumber(),
        reason: cigRequest.reason1,
        createdAt: cigRequest.createdAt.toISOString(),
      },
    };
  }

  // Busca em RewardRedemption
  const redemption = await prisma.rewardRedemption.findFirst({
    where: { couponCode: normalizedCode },
    include: { user: true, reward: true },
  });

  if (redemption) {
    return {
      found: true,
      coupon: {
        id: redemption.id,
        type: "reward" as const,
        status: redemption.status,
        couponCode: redemption.couponCode || "",
        userName: redemption.user.name,
        rewardTitle: redemption.reward.title,
        createdAt: redemption.createdAt.toISOString(),
      },
    };
  }

  return { found: false, error: "Cupom não encontrado" };
}
