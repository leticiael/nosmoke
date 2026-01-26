import { getUserMissions } from "@/actions/dashboard";
import { MissionCard } from "@/components/mission-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Info, Calendar, CalendarDays } from "lucide-react";
import Image from "next/image";

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
    <div className="space-y-4 pb-4">
      {/* Header com ícone pixel art */}
      <div className="flex items-center gap-3">
        <Image
          src="/images/hearth.png"
          alt="Missões"
          width={40}
          height={40}
          className="[image-rendering:pixelated]"
        />
        <div>
          <h1 className="text-xl font-bold text-white">Missões</h1>
          <p className="text-sm text-zinc-500">Complete para ganhar XP</p>
        </div>
      </div>

      {/* Info card */}
      <Card className="border-0 bg-violet-950/30">
        <CardContent className="flex items-start gap-3 p-4">
          <Info className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-violet-400">Como funciona</p>
            <p className="text-zinc-400">
              Diárias resetam à meia-noite. Semanais resetam no domingo.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900 p-1">
          <TabsTrigger
            value="daily"
            className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            <Calendar className="h-4 w-4" />
            Diárias ({activeDailyMissions.length})
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            <CalendarDays className="h-4 w-4" />
            Semanais ({activeWeeklyMissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-4 space-y-3">
          {activeDailyMissions.length === 0 &&
          completedDailyMissions.length === 0 ? (
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="p-8 text-center">
                <Image
                  src="/images/hearth.png"
                  alt="Missões"
                  width={48}
                  height={48}
                  className="[image-rendering:pixelated] mx-auto mb-3 opacity-50"
                />
                <p className="text-zinc-500">
                  Nenhuma missão diária disponível
                </p>
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
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
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

        <TabsContent value="weekly" className="mt-4 space-y-3">
          {activeWeeklyMissions.length === 0 &&
          completedWeeklyMissions.length === 0 ? (
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="p-8 text-center">
                <Image
                  src="/images/hearth.png"
                  alt="Missões"
                  width={48}
                  height={48}
                  className="[image-rendering:pixelated] mx-auto mb-3 opacity-50"
                />
                <p className="text-zinc-500">
                  Nenhuma missão semanal disponível
                </p>
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
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
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
