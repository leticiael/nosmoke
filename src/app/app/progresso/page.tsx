"use client";

import { useState, useEffect } from "react";
import {
  getProgressData,
  getWeekHistory,
  getUserMissions,
} from "@/actions/dashboard";
import { Flame, Target, TrendingDown, Calendar, Zap, Trophy, Check, X } from "lucide-react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Tooltip,
} from "recharts";

type ProgressData = {
  daysUnderLimit: number;
  streakDays: number;
  weeklyTotal: number;
  weeklyLimit: number;
  currentLimit: number;
  totalXp: number;
  weeklyXp: number;
  weekStart: string;
  weekEnd: string;
};

type WeekHistoryItem = {
  dateBr: string;
  dayName: string;
  total: number;
  limit: number;
  underLimit: boolean;
};

export default function ProgressoPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [weekHistory, setWeekHistory] = useState<WeekHistoryItem[]>([]);
  const [missionStats, setMissionStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getProgressData(),
      getWeekHistory(),
      getUserMissions(),
    ]).then(([progressData, history, missions]) => {
      setProgress(progressData);
      setWeekHistory(history);
      const allMissions = [...missions.daily, ...missions.weekly];
      const completed = allMissions.filter((m) => m.status === "COMPLETED").length;
      setMissionStats({ completed, total: allMissions.length });
      setLoading(false);
    });
  }, []);

  if (loading || !progress) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <Image
          src="/images/trophy.png"
          alt="Carregando"
          width={80}
          height={80}
          className="pixel-art pixel-glow-gold animate-float"
        />
        <p className="rpg-subtitle">Carregando status...</p>
      </div>
    );
  }

  const chartData = weekHistory.map((day) => ({
    name: day.dayName.slice(0, 3),
    total: day.total,
    limit: day.limit,
    underLimit: day.underLimit,
  }));

  const avgPerDay =
    weekHistory.length > 0
      ? (weekHistory.reduce((sum, d) => sum + d.total, 0) / weekHistory.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="rpg-card rpg-card-glow p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
        
        <div className="flex items-center gap-5 relative">
          <div className="relative">
            <Image
              src="/images/trophy.png"
              alt="Status"
              width={80}
              height={80}
              className="pixel-art pixel-glow-gold animate-float"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl rpg-title mb-1">Status</h1>
            <p className="text-sm text-muted-foreground mb-3">
              Acompanhe sua jornada
            </p>
            
            <div className="rpg-border rounded-lg px-4 py-2 inline-flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-white">
                {progress.weekStart} — {progress.weekEnd}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rpg-card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Zap className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="stat-value text-3xl text-emerald-400">{progress.streakDays}</p>
          <p className="rpg-subtitle mt-1">Sequência</p>
        </div>

        <div className="rpg-card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Image src="/images/hearth.png" alt="" width={24} height={24} className="pixel-art" />
          </div>
          <p className="stat-value text-3xl text-primary">{progress.totalXp}</p>
          <p className="rpg-subtitle mt-1">XP Total</p>
        </div>

        <div className="rpg-card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6 text-amber-400" />
          </div>
          <p className="stat-value text-3xl text-white">{progress.weeklyTotal}</p>
          <p className="rpg-subtitle mt-1">Fumados</p>
        </div>

        <div className="rpg-card p-5 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <Target className="w-6 h-6 text-cyan-400" />
          </div>
          <p className="stat-value text-3xl text-white">{avgPerDay}</p>
          <p className="rpg-subtitle mt-1">Média/Dia</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="rpg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Image src="/images/bau.png" alt="" width={28} height={28} className="pixel-art" />
          <span className="font-bold text-white uppercase tracking-wider text-sm">Consumo Semanal</span>
        </div>

        {chartData.length > 0 ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#8b8ba0", fontSize: 11 }}
                />
                <YAxis hide domain={[0, "dataMax + 1"]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(240 10% 7%)",
                    border: "1px solid hsl(270 91% 65% / 0.3)",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "total" ? "Cigarros" : "Limite",
                  ]}
                />
                <ReferenceLine
                  y={progress.currentLimit}
                  stroke="hsl(45 93% 47% / 0.5)"
                  strokeDasharray="4 4"
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.underLimit ? "hsl(160 84% 39%)" : "hsl(0 84% 60%)"}
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-muted-foreground">
            Sem dados ainda
          </div>
        )}

        <div className="flex justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-muted-foreground">Na meta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-muted-foreground">Acima</span>
          </div>
        </div>
      </div>

      {/* Mission Progress */}
      <div className="rpg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Image src="/images/soldadodfoof.png" alt="" width={28} height={28} className="pixel-art" />
          <span className="font-bold text-white uppercase tracking-wider text-sm">Missões</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="stat-value text-3xl text-white">
              {missionStats.completed}/{missionStats.total}
            </p>
            <p className="rpg-subtitle mt-1">Completas</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 border border-primary/30">
            <Zap className="w-5 h-5 text-primary" />
            <span className="stat-value text-xl text-primary">
              +{progress.weeklyXp}
            </span>
          </div>
        </div>
      </div>

      {/* Weekly Detail */}
      <div className="rpg-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <TrendingDown className="w-6 h-6 text-emerald-400" />
          <span className="font-bold text-white uppercase tracking-wider text-sm">Resumo</span>
        </div>

        <div className="space-y-2">
          {weekHistory.map((day) => (
            <div
              key={day.dateBr}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                day.underLimit 
                  ? "bg-emerald-500/10 border border-emerald-500/20" 
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  day.underLimit ? "bg-emerald-500/20" : "bg-red-500/20"
                }`}>
                  {day.underLimit ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white text-sm capitalize">{day.dayName}</p>
                  <p className="text-xs text-muted-foreground">{day.dateBr}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`stat-value text-lg ${day.underLimit ? "text-emerald-400" : "text-red-400"}`}>
                  {day.total}
                </span>
                <span className="text-muted-foreground text-sm">/ {day.limit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
