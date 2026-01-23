"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardCardProps {
  id: string;
  title: string;
  description?: string;
  costXp: number;
  userXp: number;
  canRedeem: boolean;
  alreadyRedeemedToday: boolean;
  onRedeem: (rewardId: string) => void;
  isPending?: boolean;
}

export function RewardCard({
  id,
  title,
  description,
  costXp,
  userXp,
  canRedeem,
  alreadyRedeemedToday,
  onRedeem,
  isPending,
}: RewardCardProps) {
  const hasEnoughXp = userXp >= costXp;
  const isLocked = !hasEnoughXp || alreadyRedeemedToday;

  return (
    <Card
      className={cn(
        "transition-all",
        !isLocked && "hover:border-primary hover:shadow-md",
        alreadyRedeemedToday && "opacity-60",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-bold text-primary">{costXp}</span>
          </div>
        </div>

        <div className="mt-4">
          {alreadyRedeemedToday ? (
            <Badge variant="secondary" className="w-full justify-center py-2">
              Já resgatado hoje
            </Badge>
          ) : !hasEnoughXp ? (
            <div className="space-y-2">
              <Button disabled variant="outline" className="w-full">
                <Lock className="mr-2 h-4 w-4" />
                Faltam {costXp - userXp} XP
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => onRedeem(id)}
              disabled={isPending || !canRedeem}
            >
              {isPending ? "Resgatando..." : "Resgatar"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
