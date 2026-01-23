"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todayBrasilia } from "@/lib/date-utils";
import { redeemRewardSchema } from "@/lib/validations";
import {
  getUserXp,
  addXp,
  hasRedeemedToday,
  getRedemptionCountToday,
} from "@/lib/calculations";
import { revalidatePath } from "next/cache";

export async function getRewardsWithStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    return { rewards: [], userXp: 0 };
  }

  const [rewards, userXp] = await Promise.all([
    prisma.reward.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    }),
    getUserXp(session.user.id),
  ]);

  const today = todayBrasilia();

  // Verifica resgates de hoje para cada recompensa
  const rewardsWithStatus = await Promise.all(
    rewards.map(async (reward) => {
      const redemptionsToday = await getRedemptionCountToday(
        session.user.id,
        reward.id,
      );
      return {
        id: reward.id,
        title: reward.title,
        description: reward.description,
        costXp: reward.costXp,
        dailyLimit: reward.dailyLimit,
        alreadyRedeemedToday: redemptionsToday >= reward.dailyLimit,
        canRedeem:
          userXp >= reward.costXp && redemptionsToday < reward.dailyLimit,
      };
    }),
  );

  return {
    rewards: rewardsWithStatus,
    userXp,
  };
}

export async function redeemReward(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  const rawData = {
    rewardId: formData.get("rewardId"),
  };

  const validation = redeemRewardSchema.safeParse(rawData);
  if (!validation.success) {
    return { error: validation.error.errors[0].message };
  }

  const { rewardId } = validation.data;

  try {
    // Busca a recompensa
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId, active: true },
    });

    if (!reward) {
      return { error: "Recompensa não encontrada" };
    }

    // Verifica XP
    const userXp = await getUserXp(session.user.id);
    if (userXp < reward.costXp) {
      return { error: "XP insuficiente" };
    }

    // Verifica limite diário
    const today = todayBrasilia();
    const redemptionsToday = await getRedemptionCountToday(
      session.user.id,
      rewardId,
    );
    if (redemptionsToday >= reward.dailyLimit) {
      return { error: "Você já resgatou esta recompensa hoje" };
    }

    // Cria o resgate
    const redemption = await prisma.rewardRedemption.create({
      data: {
        userId: session.user.id,
        rewardId,
        dateBr: today,
        status: "PENDING",
      },
    });

    // Desconta XP
    await addXp(
      session.user.id,
      -reward.costXp,
      "reward_purchase",
      redemption.id,
      `Resgate: ${reward.title}`,
    );

    revalidatePath("/app/loja");
    revalidatePath("/app");
    revalidatePath("/admin");

    return { success: true, rewardTitle: reward.title };
  } catch (error) {
    console.error("Erro ao resgatar recompensa:", error);
    return { error: "Erro ao resgatar. Tente novamente." };
  }
}

export async function getUserRedemptions() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const redemptions = await prisma.rewardRedemption.findMany({
    where: { userId: session.user.id },
    include: { reward: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return redemptions.map((r) => ({
    id: r.id,
    rewardTitle: r.reward.title,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    dateBr: r.dateBr,
  }));
}
