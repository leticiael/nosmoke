import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

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
        "transition-all",
        isCompleted && "border-green-200 bg-green-50",
        isFailed && "border-red-200 bg-red-50",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "rounded-full p-2",
                isCompleted
                  ? "bg-green-100 text-green-600"
                  : isFailed
                    ? "bg-red-100 text-red-600"
                    : "bg-primary/10 text-primary",
              )}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Target className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{title}</h3>
                <Badge
                  variant={type === "DAILY" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {type === "DAILY" ? "Diária" : "Semanal"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-primary">+{xpReward} XP</span>
          </div>
        </div>

        {!isCompleted && !isFailed && target > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {progress.toFixed(1).replace(".", ",")} / {target}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        {isCompleted && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Missão concluída!</span>
          </div>
        )}

        {isFailed && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <Clock className="h-4 w-4" />
            <span>Missão não cumprida</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
