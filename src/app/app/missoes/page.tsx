"use client";

import { useState, useEffect } from "react";
import { getUserMissions } from "@/actions/dashboard";
import { Check, Lock, Sparkles, Swords, Crown, Star } from "lucide-react";
import Image from "next/image";

type Mission = {
  id: string;
  missionId: string;
  title: string;
  description: string | null;
  xpReward: number;
  type: string;
  progress: number;
  target: number;
  status: string;
};

export default function MissoesPage() {
  const [daily, setDaily] = useState<Mission[]>([]);
  const [weekly, setWeekly] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  useEffect(() => {
    getUserMissions().then((data) => {
      setDaily(data.daily);
      setWeekly(data.weekly);
      setLoading(false);
    });
  }, []);

  const totalXpAvailable = [...daily, ...weekly]
    .filter(m => m.status !== "COMPLETED")
    .reduce((sum, m) => sum + m.xpReward, 0);

  const completedCount = [...daily, ...weekly].filter(m => m.status === "COMPLETED").length;
  const totalCount = daily.length + weekly.length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <Image
          src="/images/soldadodfoof.png"
          alt="Carregando"
          width={80}
          height={80}
          className="pixel-art pixel-glow animate-float"
        />
        <p className="rpg-subtitle">Carregando missões...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header épico */}
      <div className="rpg-card rpg-card-glow p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/20 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded-tr-full" />
        
        <div className="flex items-center gap-5 relative">
          <div className="relative">
            <Image
              src="/images/soldadodfoof.png"
              alt="Missões"
              width={80}
              height={80}
              className="pixel-art pixel-glow animate-float"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Swords className="w-4 h-4 text-primary" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl rpg-title mb-1">Missões</h1>
            <p className="text-sm text-muted-foreground mb-3">
              Complete desafios e ganhe recompensas
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="stat-value text-lg text-white">{completedCount}/{totalCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Completas</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <Image src="/images/hearth.png" alt="" width={16} height={16} className="pixel-art" />
                </div>
                <div>
                  <p className="stat-value text-lg text-primary">+{totalXpAvailable}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">XP Disponível</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missões Diárias */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Image src="/images/goldenbar.png" alt="" width={24} height={24} className="pixel-art" />
          </div>
          <div>
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Diárias</h2>
            <p className="text-xs text-muted-foreground">Resetam à meia-noite</p>
          </div>
        </div>

        <div className="space-y-3">
          {daily.length === 0 ? (
            <div className="rpg-card p-8 text-center">
              <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground text-sm">Nenhuma missão diária disponível</p>
            </div>
          ) : (
            daily.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClick={() => setSelectedMission(mission)}
                isSelected={selectedMission?.id === mission.id}
              />
            ))
          )}
        </div>
      </section>

      {/* Missões Semanais */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Image src="/images/bau.png" alt="" width={24} height={24} className="pixel-art" />
          </div>
          <div>
            <h2 className="font-bold text-white uppercase tracking-wider text-sm">Semanais</h2>
            <p className="text-xs text-muted-foreground">Resetam na segunda-feira</p>
          </div>
        </div>

        <div className="space-y-3">
          {weekly.length === 0 ? (
            <div className="rpg-card p-8 text-center">
              <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
              <p className="text-muted-foreground text-sm">Nenhuma missão semanal disponível</p>
            </div>
          ) : (
            weekly.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClick={() => setSelectedMission(mission)}
                isSelected={selectedMission?.id === mission.id}
              />
            ))
          )}
        </div>
      </section>

      {/* Dica motivacional */}
      <div className="rpg-card p-5 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Image src="/images/trophy.png" alt="" width={28} height={28} className="pixel-art pixel-glow-gold" />
          <span className="font-semibold text-white">Dica do Dia</span>
          <Image src="/images/trophy.png" alt="" width={28} height={28} className="pixel-art pixel-glow-gold" />
        </div>
        <p className="text-sm text-muted-foreground">
          Complete todas as missões diárias para ganhar um <span className="text-primary font-semibold">bônus extra</span> de XP!
        </p>
      </div>
    </div>
  );
}

function MissionCard({ 
  mission, 
  onClick, 
  isSelected 
}: { 
  mission: Mission; 
  onClick: () => void;
  isSelected: boolean;
}) {
  const isCompleted = mission.status === "COMPLETED";
  const progressPercent = Math.min((mission.progress / mission.target) * 100, 100);

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rpg-card p-4 transition-all duration-300
        ${isCompleted ? "border-emerald-500/40" : ""}
        ${isSelected ? "rpg-card-glow scale-[1.02]" : "hover:scale-[1.01]"}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Icon/Status */}
        <div className={`
          w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all
          ${isCompleted 
            ? "bg-gradient-to-br from-emerald-500/30 to-emerald-600/10 border border-emerald-500/40" 
            : "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
          }
        `}>
          {isCompleted ? (
            <div className="relative">
              <Check className="w-7 h-7 text-emerald-400" />
              <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          ) : mission.type === "DAILY" ? (
            <Image src="/images/goldenbar.png" alt="" width={32} height={32} className="pixel-art" />
          ) : (
            <Image src="/images/bau.png" alt="" width={32} height={32} className="pixel-art" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h3 className={`font-semibold ${isCompleted ? "text-emerald-400" : "text-white"}`}>
                {mission.title.replace(/^[^\w\s]+\s*/, "")}
              </h3>
              {mission.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {mission.description}
                </p>
              )}
            </div>
            
            {/* Reward */}
            <div className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0
              ${isCompleted 
                ? "bg-emerald-500/20 border border-emerald-500/30" 
                : "bg-amber-500/20 border border-amber-500/30"
              }
            `}>
              <Image src="/images/hearth.png" alt="" width={14} height={14} className="pixel-art" />
              <span className={`stat-value text-sm ${isCompleted ? "text-emerald-400" : "text-amber-400"}`}>
                +{mission.xpReward}
              </span>
            </div>
          </div>

          {/* Progress */}
          {!isCompleted && mission.target > 1 && (
            <div className="mt-3">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-muted-foreground">Progresso</span>
                <span className="stat-value text-white">{mission.progress} / {mission.target}</span>
              </div>
              <div className="rpg-progress h-2">
                <div 
                  className="rpg-progress-fill" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Completed indicator */}
          {isCompleted && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gradient-to-r from-emerald-500/50 via-emerald-400/30 to-transparent rounded-full" />
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
                Completa
              </span>
              <div className="flex-1 h-1 bg-gradient-to-l from-emerald-500/50 via-emerald-400/30 to-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isSelected && !isCompleted && (
        <div className="mt-4 pt-4 border-t border-primary/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="rpg-badge">Em Progresso</span>
          </div>
          {mission.description && (
            <p className="mt-3 text-sm text-muted-foreground">
              {mission.description}
            </p>
          )}
        </div>
      )}
    </button>
  );
}
