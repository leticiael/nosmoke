"use client";

import { useState, useEffect, useTransition } from "react";
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
      } else {
        toast({
          title: "Resgate enviado! 🎉",
          description: `${result.rewardTitle} - aguarde validação`,
          variant: "success",
        });
        await loadData();
      }

      setPendingRewardId(null);
    });
  };

  const pendingRedemptions = redemptions.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Loja</h1>
        <p className="text-muted-foreground">Troque seu XP por recompensas</p>
      </div>

      {/* XP atual */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">Seu saldo</p>
            <p className="text-3xl font-bold text-primary">{userXp} XP</p>
          </div>
          <div className="rounded-full bg-primary/20 p-3">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
        </CardContent>
      </Card>

      {/* Resgates pendentes */}
      {pendingRedemptions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Aguardando validação
          </h2>
          {pendingRedemptions.map((r) => (
            <Card key={r.id} className="border-amber-200 bg-amber-50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span className="font-medium">{r.rewardTitle}</span>
                </div>
                <Badge variant="warning">Pendente</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lista de recompensas */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-muted-foreground">
          Recompensas disponíveis
        </h2>
        {rewards.map((reward) => {
          const hasEnoughXp = userXp >= reward.costXp;
          const isCurrentPending = pendingRewardId === reward.id;

          return (
            <Card
              key={reward.id}
              className={cn(
                "transition-all",
                reward.alreadyRedeemedToday && "opacity-60",
              )}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{reward.title}</h3>
                    {reward.description && (
                      <p className="text-sm text-muted-foreground">
                        {reward.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 shrink-0">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-bold text-primary">
                      {reward.costXp}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  {reward.alreadyRedeemedToday ? (
                    <Button variant="secondary" disabled className="w-full">
                      <Check className="mr-2 h-4 w-4" />
                      Já resgatado hoje
                    </Button>
                  ) : !hasEnoughXp ? (
                    <Button variant="outline" disabled className="w-full">
                      Faltam {reward.costXp - userXp} XP
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
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

      {/* Histórico de resgates */}
      {redemptions.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Últimos resgates
          </h2>
          {redemptions.slice(0, 5).map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{r.rewardTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <Badge
                  variant={
                    r.status === "VALIDATED"
                      ? "success"
                      : r.status === "PENDING"
                        ? "warning"
                        : "destructive"
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
      )}
    </div>
  );
}
