import { getProgressData } from "@/actions/dashboard";
import { ProgressChart } from "@/components/progress-chart";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProgressoPage() {
  const { chartData, weekSummary } = await getProgressData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progresso</h1>
        <p className="text-muted-foreground">Seu histórico de consumo</p>
      </div>

      {/* Gráfico */}
      <ProgressChart data={chartData} />

      {/* Resumo da semana */}
      {weekSummary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Esta semana</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">
                  {formatNumber(weekSummary.totalWeek)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Média/dia</p>
                <p className="text-2xl font-bold">
                  {formatNumber(weekSummary.averagePerDay)}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dias dentro da meta</p>
                  <p className="text-sm text-muted-foreground">
                    Continue assim!
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">
                    {weekSummary.daysUnderLimit}
                    <span className="text-lg text-muted-foreground">
                      /{weekSummary.totalDays}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dicas */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <h3 className="font-medium text-primary mb-2">💡 Dica</h3>
          <p className="text-sm text-muted-foreground">
            Cada dia que você fica dentro da meta, você ganha XP no dia
            seguinte. Complete missões para acelerar suas recompensas!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
