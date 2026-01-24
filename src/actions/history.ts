"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUserHistory() {
  const session = await auth();
  if (!session?.user?.id) {
    return { cigarettes: [], rewards: [] };
  }

  const [cigarettes, rewards] = await Promise.all([
    prisma.cigRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.rewardRedemption.findMany({
      where: { userId: session.user.id },
      include: { reward: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return {
    cigarettes: cigarettes.map((c) => ({
      id: c.id,
      amount: c.amount.toNumber(),
      reason: c.reason1,
      status: c.status,
      couponCode: c.couponCode,
      createdAt: c.createdAt.toISOString(),
      dateBr: c.dateBr,
    })),
    rewards: rewards.map((r) => ({
      id: r.id,
      rewardTitle: r.reward.title,
      status: r.status,
      couponCode: r.couponCode,
      createdAt: r.createdAt.toISOString(),
      dateBr: r.dateBr,
    })),
  };
}
