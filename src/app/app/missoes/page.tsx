import { getUserMissions } from "@/actions/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function MissoesPage() {
  const { daily, weekly } = await getUserMissions();

  return (
    <div className="space-y-8 pb-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/trophy.png"
          alt="Missões"
          width={56}
          height={56}
          className="[image-rendering:pixelated]"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">Missões</h1>
          <p className="text-sm text-zinc-400">
            Complete missões e ganhe XP bônus
          </p>
        </div>
      </div>

      {/* Missões Diárias */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Diárias</h2>
          <p className="text-sm text-zinc-500">Resetam todo dia à meia-noite</p>
        </div>

        <div className="space-y-3">
          {daily.map((m) => (
            <Card
              key={m.id}
              className={`border-0 ${m.status === "COMPLETED" ? "bg-emerald-950/40" : "bg-zinc-900"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${m.status === "COMPLETED" ? "bg-emerald-500" : "bg-zinc-800"}`}
                  >
                    {m.status === "COMPLETED" ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Image
                        src="/images/goldenbar.png"
                        alt=""
                        width={28}
                        height={28}
                        className="[image-rendering:pixelated]"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-base ${m.status === "COMPLETED" ? "text-emerald-400" : "text-white"}`}
                    >
                      {m.title.replace(/^[^\w\s]+\s*/, "")}
                    </p>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {m.description}
                    </p>
                  </div>

                  <div
                    className={`text-lg font-bold shrink-0 ${m.status === "COMPLETED" ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    +{m.xpReward} XP
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Missões Semanais */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">Semanais</h2>
          <p className="text-sm text-zinc-500">Resetam toda segunda-feira</p>
        </div>

        <div className="space-y-3">
          {weekly.map((m) => (
            <Card
              key={m.id}
              className={`border-0 ${m.status === "COMPLETED" ? "bg-emerald-950/40" : "bg-zinc-900"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${m.status === "COMPLETED" ? "bg-emerald-500" : "bg-zinc-800"}`}
                  >
                    {m.status === "COMPLETED" ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Image
                        src="/images/bau.png"
                        alt=""
                        width={28}
                        height={28}
                        className="[image-rendering:pixelated]"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-base ${m.status === "COMPLETED" ? "text-emerald-400" : "text-white"}`}
                    >
                      {m.title.replace(/^[^\w\s]+\s*/, "")}
                    </p>
                    <p className="text-sm text-zinc-400 mt-0.5">
                      {m.description}
                    </p>
                    {m.status !== "COMPLETED" && m.target && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Progresso: {m.progress} de {m.target} dias
                      </p>
                    )}
                  </div>

                  <div
                    className={`text-lg font-bold shrink-0 ${m.status === "COMPLETED" ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    +{m.xpReward} XP
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
