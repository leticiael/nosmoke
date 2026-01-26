"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Check, Clock, X } from "lucide-react";
import {
  getRewardsWithStatus,
  redeemReward,
  getUserRedemptions,
} from "@/actions/rewards";
import { useToast } from "@/components/ui/use-toast";
import { formatDateTimeBR } from "@/lib/date-utils";
import { cn } from "@/lib/utils";

type RewardWithStatus = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  costXp: number;
  dailyLimit: number;
  alreadyRedeemedToday: boolean;
  canRedeem: boolean;
};

type Redemption = {
  id: string;
  rewardTitle: string;
  status: string;
  createdAt: string;
  dateBr: string;
};

export default function LojaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingRewardId, setPendingRewardId] = useState<string | null>(null);

  const [rewards, setRewards] = useState<RewardWithStatus[]>([]);
  const [userXp, setUserXp] = useState(0);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);

  const loadData = async () => {
    const [rewardsData, redemptionsData] = await Promise.all([
      getRewardsWithStatus(),
      getUserRedemptions(),
    ]);
    setRewards(rewardsData.rewards);
    setUserXp(rewardsData.userXp);
    setRedemptions(redemptionsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRedeem = async (rewardId: string) => {
    setPendingRewardId(rewardId);

    const formData = new FormData();
    formData.set("rewardId", rewardId);

    startTransition(async () => {
      const result = await redeemReward(formData);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
        setPendingRewardId(null);
      } else if (result.couponCode) {
        // Redireciona para a página do cupom
        router.push(`/app/cupom/${result.couponCode}`);
      } else {
        toast({
          title: "Resgate enviado! 🎉",
          description: `${result.rewardTitle} - aguarde validação`,
          variant: "success",
        });
        await loadData();
        setPendingRewardId(null);
      }
    });
  };

  const pendingRedemptions = redemptions.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-4 pb-4">
      {/* Header com Maga Vendedora */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/healer.png"
          alt="Maga Vendedora"
          width={64}
          height={64}
          className="[image-rendering:pixelated]"
        />
        <div>
          <h1 className="text-xl font-bold text-white">Loja</h1>
          <p className="text-sm text-zinc-500">Troque seu XP por recompensas</p>
        </div>
      </div>

      {/* Layout responsivo: sidebar no desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Coluna lateral */}
        <div className="lg:col-span-1 space-y-4">
          {/* XP atual */}
          <Card className="border border-zinc-800 bg-zinc-900">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">
                  Seu saldo
                </p>
                <p className="text-3xl font-bold text-white">{userXp} XP</p>
              </div>
              <Image
                src="/images/hearth.png"
                alt="XP"
                width={72}
                height={72}
                className="[image-rendering:pixelated]"
              />
            </CardContent>
          </Card>

          {/* Resgates pendentes */}
          {pendingRedemptions.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-zinc-500">
                Aguardando validação
              </h2>
              {pendingRedemptions.map((r) => (
                <Card
                  key={r.id}
                  className="border border-amber-500/30 bg-amber-500/10"
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-amber-500" />
                      <span className="font-medium text-white">
                        {r.rewardTitle}
                      </span>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                      Pendente
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Lista de recompensas */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-medium text-zinc-500">
            Recompensas disponíveis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rewards.map((reward) => {
              const hasEnoughXp = userXp >= reward.costXp;
              const isCurrentPending = pendingRewardId === reward.id;

              return (
                <Card
                  key={reward.id}
                  className={cn(
                    "transition-all border border-zinc-800 bg-zinc-900 hover:border-zinc-700",
                    reward.alreadyRedeemedToday && "opacity-50",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        {reward.imageUrl && (
                          <div className="bg-zinc-800/50 p-2 rounded-xl">
                            <Image
                              src={reward.imageUrl}
                              alt={reward.title}
                              width={56}
                              height={56}
                              className="[image-rendering:pixelated] object-contain"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-tight text-white">
                              {reward.title}
                            </h3>
                            <div className="flex items-center gap-1 bg-primary/20 px-2.5 py-1 rounded-full shrink-0">
                              <span className="text-primary font-bold text-sm">
                                {reward.costXp} XP
                              </span>
                            </div>
                          </div>
                          {reward.description && (
                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                              {reward.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      {reward.alreadyRedeemedToday ? (
                        <Button
                          variant="secondary"
                          disabled
                          className="w-full bg-zinc-800 text-zinc-500"
                        >
                          <Check className="mr-2 h-4 w-4" /> Já resgatado hoje
                        </Button>
                      ) : !hasEnoughXp ? (
                        <Button
                          variant="outline"
                          disabled
                          className="w-full border-zinc-700 bg-zinc-800/50 text-zinc-500"
                        >
                          Faltam {reward.costXp - userXp} XP
                        </Button>
                      ) : (
                        <Button
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => handleRedeem(reward.id)}
                          disabled={isPending}
                        >
                          {isCurrentPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Resgatando...
                            </>
                          ) : (
                            "Resgatar"
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Histórico de resgates */}
      {redemptions.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
            Últimos resgates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {redemptions.slice(0, 6).map((r) => (
              <Card key={r.id} className="border-0 bg-zinc-900/80">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium text-white">{r.rewardTitle}</p>
                    <p className="text-sm text-zinc-500">
                      {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <Badge
                    className={
                      r.status === "VALIDATED"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : r.status === "PENDING"
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                    }
                  >
                    {r.status === "VALIDATED"
                      ? "Validado"
                      : r.status === "PENDING"
                        ? "Pendente"
                        : "Rejeitado"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
