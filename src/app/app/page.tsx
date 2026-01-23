import { getUserDashboard, checkAndAwardMissions } from "@/actions/dashboard";
import { StatCard } from "@/components/stat-card";
import { AlertBanner } from "@/components/alert-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cigarette, Gift, Clock } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Verifica e premia missões pendentes
  await checkAndAwardMissions();

  const data = await getUserDashboard();

  if (!data) {
    return <div>Erro ao carregar dados</div>;
  }

  const {
    todayTotal,
    dailyLimit,
    remaining,
    weekTotal,
    average7Days,
    xp,
    alerts,
    nextReward,
    pendingRequests,
  } = data;

  const progressPercent = Math.min((todayTotal / dailyLimit) * 100, 100);
  const isOverLimit = todayTotal > dailyLimit;

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {alerts.overLimit && <AlertBanner type="over-limit" />}
      {alerts.over30Percent && !alerts.overLimit && (
        <AlertBanner
          type="over-30-percent"
          value={alerts.todayTotal}
          average={alerts.average7Days}
        />
      )}

      {/* Card principal - Hoje */}
      <Card className={isOverLimit ? "border-red-200" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Hoje</CardTitle>
            {pendingRequests > 0 && (
              <Badge variant="pending" className="gap-1">
                <Clock className="h-3 w-3" />
                {pendingRequests} pendente{pendingRequests > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-bold">
                {formatNumber(todayTotal)}
                <span className="text-lg text-muted-foreground font-normal">
                  {" "}
                  / {formatNumber(dailyLimit)}
                </span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {remaining > 0
                  ? `Restam ${formatNumber(remaining)} na meta`
                  : "Meta atingida!"}
              </p>
            </div>
            <Link href="/app/pedir">
              <Button size="lg" className="gap-2">
                <Cigarette className="h-5 w-5" />
                Pedir
              </Button>
            </Link>
          </div>
          <Progress
            value={progressPercent}
            className="h-3"
            indicatorClassName={isOverLimit ? "bg-red-500" : ""}
          />
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="XP atual"
          value={xp}
          icon="xp"
          subtitle={nextReward ? `Próximo: ${nextReward.costXp} XP` : undefined}
        />
        <StatCard
          title="Esta semana"
          value={formatNumber(weekTotal)}
          subtitle={`Média: ${formatNumber(average7Days)}/dia`}
          icon="target"
        />
      </div>

      {/* Próxima recompensa */}
      {nextReward && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Próxima recompensa
                  </p>
                  <p className="font-medium">{nextReward.title}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {xp} / {nextReward.costXp} XP
                </p>
                <Progress
                  value={(xp / nextReward.costXp) * 100}
                  className="mt-1 h-2 w-24"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/app/missoes">
          <Card className="cursor-pointer transition-colors hover:border-primary">
            <CardContent className="p-4 text-center">
              <p className="font-medium">🎯 Ver missões</p>
              <p className="text-sm text-muted-foreground">Ganhe mais XP</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/loja">
          <Card className="cursor-pointer transition-colors hover:border-primary">
            <CardContent className="p-4 text-center">
              <p className="font-medium">🎁 Loja</p>
              <p className="text-sm text-muted-foreground">Troque seu XP</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
