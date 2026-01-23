import { getUserMissions } from "@/actions/dashboard";
import { MissionCard } from "@/components/mission-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MissoesPage() {
  const { daily, weekly } = await getUserMissions();

  const activeDailyMissions = daily.filter((m) => m.status === "IN_PROGRESS");
  const completedDailyMissions = daily.filter((m) => m.status === "COMPLETED");
  const activeWeeklyMissions = weekly.filter((m) => m.status === "IN_PROGRESS");
  const completedWeeklyMissions = weekly.filter(
    (m) => m.status === "COMPLETED",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Missões</h1>
        <p className="text-muted-foreground">Complete para ganhar XP</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary">Como funciona</p>
            <p className="text-muted-foreground">
              Missões diárias resetam à meia-noite (Brasília). Semanais resetam
              no domingo.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">
            Diárias ({activeDailyMissions.length})
          </TabsTrigger>
          <TabsTrigger value="weekly">
            Semanais ({activeWeeklyMissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          {activeDailyMissions.length === 0 &&
          completedDailyMissions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma missão diária disponível
              </CardContent>
            </Card>
          ) : (
            <>
              {activeDailyMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  title={mission.title}
                  description={mission.description}
                  xpReward={mission.xpReward}
                  progress={mission.progress}
                  target={mission.target}
                  status={mission.status}
                  type={mission.type}
                />
              ))}
              {completedDailyMissions.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Concluídas hoje
                  </h3>
                  {completedDailyMissions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      title={mission.title}
                      description={mission.description}
                      xpReward={mission.xpReward}
                      progress={mission.progress}
                      target={mission.target}
                      status={mission.status}
                      type={mission.type}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          {activeWeeklyMissions.length === 0 &&
          completedWeeklyMissions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Nenhuma missão semanal disponível
              </CardContent>
            </Card>
          ) : (
            <>
              {activeWeeklyMissions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  title={mission.title}
                  description={mission.description}
                  xpReward={mission.xpReward}
                  progress={mission.progress}
                  target={mission.target}
                  status={mission.status}
                  type={mission.type}
                />
              ))}
              {completedWeeklyMissions.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Concluídas esta semana
                  </h3>
                  {completedWeeklyMissions.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      title={mission.title}
                      description={mission.description}
                      xpReward={mission.xpReward}
                      progress={mission.progress}
                      target={mission.target}
                      status={mission.status}
                      type={mission.type}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
