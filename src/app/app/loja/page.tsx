"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Clock, ShoppingBag, Sparkles } from "lucide-react";
import {
  getRewardsWithStatus,
  redeemReward,
  getUserRedemptions,
} from "@/actions/rewards";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

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
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [rewardsData, redemptionsData] = await Promise.all([
      getRewardsWithStatus(),
      getUserRedemptions(),
    ]);
    setRewards(rewardsData.rewards);
    setUserXp(rewardsData.userXp);
    setRedemptions(redemptionsData);
    setLoading(false);
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
        router.push(`/app/cupom/${result.couponCode}`);
      } else {
        toast({
          title: "Resgate enviado! 🎉",
          description: `${result.rewardTitle} - aguarde validação`,
        });
        await loadData();
        setPendingRewardId(null);
      }
    });
  };

  const pendingRedemptions = redemptions.filter((r) => r.status === "PENDING");

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <Image
          src="/images/healer.png"
          alt="Carregando"
          width={80}
          height={80}
          className="pixel-art pixel-glow animate-float"
        />
        <p className="rpg-subtitle">Carregando loja...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header com XP */}
      <div className="rpg-card rpg-card-glow p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-rose-500/10 to-transparent rounded-bl-full" />
        
        <div className="flex items-center gap-5 relative">
          <div className="relative">
            <Image
              src="/images/healer.png"
              alt="Loja"
              width={80}
              height={80}
              className="pixel-art pixel-glow animate-float"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-rose-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl rpg-title mb-1">Loja</h1>
            <p className="text-sm text-muted-foreground mb-3">
              Troque seu XP por recompensas
            </p>
            
            <div className="rpg-border rounded-xl p-3 inline-flex items-center gap-3">
              <Image src="/images/hearth.png" alt="XP" width={28} height={28} className="pixel-art pixel-glow" />
              <div>
                <p className="stat-value text-2xl text-primary">{userXp}</p>
                <p className="text-[10px] text-muted-foreground uppercase">XP Disponível</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resgates Pendentes */}
      {pendingRedemptions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="rpg-subtitle">Aguardando Validação</span>
          </div>
          <div className="space-y-2">
            {pendingRedemptions.map((r) => (
              <div key={r.id} className="rpg-card p-4 flex items-center gap-4 border-l-4 border-l-amber-500">
                <Image src="/images/pocaomarrom1.png" alt="" width={32} height={32} className="pixel-art" />
                <div className="flex-1">
                  <p className="font-semibold text-white">{r.rewardTitle}</p>
                  <p className="text-xs text-muted-foreground">{r.dateBr}</p>
                </div>
                <span className="rpg-badge">Pendente</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recompensas */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="rpg-subtitle">Recompensas Disponíveis</span>
        </div>

        {rewards.length === 0 ? (
          <div className="rpg-card p-8 text-center">
            <Image src="/images/pocaomarrom1.png" alt="" width={48} height={48} className="pixel-art mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">Nenhuma recompensa disponível</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rewards.map((reward) => {
              const hasEnoughXp = userXp >= reward.costXp;
              const isCurrentPending = pendingRewardId === reward.id;
              const canBuy = hasEnoughXp && !reward.alreadyRedeemedToday;

              return (
                <div
                  key={reward.id}
                  className={`rpg-card p-5 transition-all ${
                    reward.alreadyRedeemedToday ? "opacity-60" : canBuy ? "hover:rpg-card-glow" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Imagem */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shrink-0">
                      {reward.imageUrl ? (
                        <Image src={reward.imageUrl} alt="" width={48} height={48} className="pixel-art" />
                      ) : (
                        <Image src="/images/pocaomarrom1.png" alt="" width={48} height={48} className="pixel-art" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-semibold text-white">{reward.title}</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 shrink-0">
                          <Image src="/images/hearth.png" alt="" width={14} height={14} className="pixel-art" />
                          <span className="stat-value text-sm text-primary">{reward.costXp}</span>
                        </div>
                      </div>

                      {reward.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {reward.description}
                        </p>
                      )}

                      {/* Botão de ação */}
                      {reward.alreadyRedeemedToday ? (
                        <button className="w-full py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm flex items-center justify-center gap-2" disabled>
                          <Check className="w-4 h-4" />
                          Resgatado Hoje
                        </button>
                      ) : !hasEnoughXp ? (
                        <button className="w-full py-2.5 rounded-lg bg-muted/50 border border-border text-muted-foreground font-semibold text-sm" disabled>
                          Faltam {reward.costXp - userXp} XP
                        </button>
                      ) : (
                        <button
                          className="w-full rpg-button py-2.5 rounded-lg flex items-center justify-center gap-2"
                          onClick={() => handleRedeem(reward.id)}
                          disabled={isPending}
                        >
                          {isCurrentPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Resgatando...
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-4 h-4" />
                              Resgatar
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
