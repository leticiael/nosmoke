import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MissionCardProps {
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  status: "IN_PROGRESS" | "COMPLETED" | "FAILED";
  type: "DAILY" | "WEEKLY";
}

export function MissionCard({
  title,
  description,
  xpReward,
  progress,
  target,
  status,
  type,
}: MissionCardProps) {
  const progressPercent =
    target > 0 ? Math.min((progress / target) * 100, 100) : 0;
  const isCompleted = status === "COMPLETED";
  const isFailed = status === "FAILED";

  return (
    <Card
      className={cn(
        "transition-all border-0",
        isCompleted && "bg-emerald-950/30",
        isFailed && "bg-red-950/30",
        !isCompleted && !isFailed && "bg-zinc-900/80",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "rounded-xl p-2",
                isCompleted
                  ? "bg-emerald-500/20"
                  : isFailed
                    ? "bg-red-500/20"
                    : "bg-teal-500/20",
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <Image
                  src="/images/hearth.png"
                  alt="Missão"
                  width={20}
                  height={20}
                  className="[image-rendering:pixelated]"
                />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium text-white">{title}</h3>
                <Badge
                  className={cn(
                    "text-xs",
                    type === "DAILY"
                      ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                      : "bg-teal-500/20 text-teal-400 border-teal-500/30",
                  )}
                >
                  {type === "DAILY" ? "Diária" : "Semanal"}
                </Badge>
              </div>
              <p className="text-sm text-zinc-500">{description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-teal-400">+{xpReward} XP</span>
          </div>
        </div>

        {!isCompleted && !isFailed && target > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Progresso</span>
              <span className="font-medium text-white">
                {progress.toFixed(1).replace(".", ",")} / {target}
              </span>
            </div>
            <Progress
              value={progressPercent}
              className="h-2 bg-zinc-800"
              indicatorClassName="bg-teal-500"
            />
          </div>
        )}

        {isCompleted && (
          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Missão concluída!</span>
          </div>
        )}

        {isFailed && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400">
            <Clock className="h-4 w-4" />
            <span>Missão não cumprida</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
