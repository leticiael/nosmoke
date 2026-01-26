import { getUserDashboard, checkAndAwardMissions } from "@/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Cigarette, Gift, Clock, Target, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await checkAndAwardMissions();
  const data = await getUserDashboard();

  if (!data) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Erro ao carregar dados
      </div>
    );
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
    <div className="space-y-4 pb-4">
      {/* Layout responsivo: 2 colunas no desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card principal - Hoje */}
        <Card
          className={`border-0 bg-gradient-to-br ${isOverLimit ? "from-red-950/50 to-red-900/30" : "from-violet-950/50 to-purple-900/30"} lg:row-span-2`}
        >
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Hoje
              </h2>
              {pendingRequests > 0 && (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
                  <Clock className="h-3 w-3" />
                  {pendingRequests} pendente{pendingRequests > 1 ? "s" : ""}
                </Badge>
              )}
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl md:text-5xl font-bold text-white">
                  {formatNumber(todayTotal)}
                  <span className="text-xl md:text-2xl text-white/60 font-normal">
                    {" "}
                    / {formatNumber(dailyLimit)}
                  </span>
                </p>
                <p className="text-sm md:text-base text-white/60 mt-1">
                  {remaining > 0
                    ? `Restam ${formatNumber(remaining)} na meta`
                    : isOverLimit
                      ? "Limite ultrapassado!"
                      : "Meta atingida! 🎉"}
                </p>
              </div>
              <Link href="/app/pedir">
                <Button
                  size="lg"
                  className="gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border-0"
                >
                  <Cigarette className="h-5 w-5" />
                  Pedir
                </Button>
              </Link>
            </div>

            <Progress
              value={progressPercent}
              className="h-2 md:h-3 bg-white/10"
              indicatorClassName={isOverLimit ? "bg-red-500" : "bg-violet-400"}
            />
          </CardContent>
        </Card>

        {/* Stats no lado direito no desktop */}
        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      XP atual
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">{xp}</p>
                    {nextReward && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Próximo: {nextReward.costXp} XP
                      </p>
                    )}
                  </div>
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Sparkles className="h-5 w-5 text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Esta semana
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {formatNumber(weekTotal)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Média: {formatNumber(average7Days)}/dia
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Target className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Próxima recompensa */}
          {nextReward && (
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-amber-500/20">
                    <Gift className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      Próxima recompensa
                    </p>
                    <p className="font-semibold text-white">
                      {nextReward.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">
                      {xp} / {nextReward.costXp} XP
                    </p>
                    <Progress
                      value={(xp / nextReward.costXp) * 100}
                      className="mt-1 h-1.5 w-20 bg-zinc-800"
                      indicatorClassName="bg-amber-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/app/missoes">
          <Card className="border-0 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Image
                src="/images/hearth.png"
                alt="Missões"
                width={40}
                height={40}
                className="[image-rendering:pixelated] mb-2"
              />
              <p className="font-medium text-white text-sm">Ver missões</p>
              <p className="text-xs text-zinc-500">Ganhe mais XP</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/loja">
          <Card className="border-0 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Image
                src="/images/pocaomarrom1.png"
                alt="Loja"
                width={40}
                height={40}
                className="[image-rendering:pixelated] mb-2"
              />
              <p className="font-medium text-white text-sm">Loja</p>
              <p className="text-xs text-zinc-500">Troque seu XP</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/historico" className="hidden md:block">
          <Card className="border-0 bg-zinc-900/80 hover:bg-zinc-800/80 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Image
                src="/images/guerreiro1.png"
                alt="Histórico"
                width={40}
                height={40}
                className="[image-rendering:pixelated] mb-2"
              />
              <p className="font-medium text-white text-sm">Histórico</p>
              <p className="text-xs text-zinc-500">Seus pedidos</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/pedir" className="hidden md:block">
          <Card className="border-0 bg-violet-950/50 hover:bg-violet-900/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <Image
                src="/images/cigarroaceso.png"
                alt="Pedir"
                width={40}
                height={40}
                className="[image-rendering:pixelated] mb-2"
              />
              <p className="font-medium text-white text-sm">Pedir cigarro</p>
              <p className="text-xs text-zinc-400">Faça um pedido</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Alertas */}
      {(alerts.overLimit || alerts.over30Percent) && (
        <Card
          className={`border-0 ${alerts.overLimit ? "bg-red-950/50" : "bg-amber-950/50"}`}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${alerts.overLimit ? "bg-red-500/20" : "bg-amber-500/20"}`}
            >
              <Image
                src="/images/cigarroaceso.png"
                alt="Alerta"
                width={24}
                height={24}
                className="[image-rendering:pixelated]"
              />
            </div>
            <div>
              <p
                className={`font-medium ${alerts.overLimit ? "text-red-400" : "text-amber-400"}`}
              >
                {alerts.overLimit ? "Limite ultrapassado!" : "Atenção"}
              </p>
              <p className="text-sm text-zinc-400">
                {alerts.overLimit
                  ? "Você passou do limite diário hoje."
                  : `Você está 30% acima da sua média (${formatNumber(alerts.todayTotal)} vs ${formatNumber(alerts.average7Days)})`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
