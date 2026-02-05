import Link from "next/link";
import { getUserDashboard } from "@/actions/dashboard";
import { LogOut, ChevronRight, Flame, Target, Zap, Trophy } from "lucide-react";
import Image from "next/image";
import { signOut } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function handleLogout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function AppPage() {
  const data = await getUserDashboard();

  if (!data) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Image
          src="/images/guerreiro1.png"
          alt="Carregando"
          width={100}
          height={100}
          className="pixel-art animate-pulse-glow animate-float"
        />
        <p className="text-white/40 text-sm animate-pulse">Carregando...</p>
      </div>
    );
  }

  const progressPercent = Math.min((data.todayTotal / data.dailyLimit) * 100, 100);
  const isUnderLimit = data.remaining >= 0;
  const userName = data.userName || data.name || "Guerreiro";

  return (
    <div className="space-y-5 pb-24">
      {/* Header com Guerreiro Grande */}
      <div className="glass-card p-6 relative overflow-hidden animate-fade-in">
        {/* Background glow animado */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#044040]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative flex items-center gap-5">
          {/* Guerreiro Grande Flutuando com Glow Pulsante */}
          <div className="relative group">
            <Image
              src="/images/guerreiro1.png"
              alt="Avatar"
              width={100}
              height={100}
              className="pixel-art animate-float animate-pulse-glow hover-glow cursor-pointer"
            />
            {/* Círculo de luz atrás */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-full blur-xl scale-150 animate-pulse" />
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <p className="text-xs text-white/40 mb-0.5">Bem-vindo</p>
            <h1 className="text-xl font-bold text-white mb-3">{userName}</h1>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass hover-scale cursor-default">
                <Image src="/images/hearth.png" alt="XP" width={14} height={14} className="pixel-art animate-bounce-soft" />
                <span className="text-sm font-bold text-emerald-400">{data.xp}</span>
              </div>
              <form action={handleLogout}>
                <button type="submit" className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all hover-scale">
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Consumo Diário */}
      <div className="glass-card p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Consumo Diário</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold text-white">{data.todayTotal}</span>
              <span className="text-lg text-white/30">/ {data.dailyLimit}</span>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            isUnderLimit 
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 animate-pulse" 
              : "bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse"
          }`}>
            {isUnderLimit ? "Na Meta" : "Excedido"}
          </span>
        </div>

        {/* Progress com animação */}
        <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
              isUnderLimit 
                ? "bg-gradient-to-r from-[#044040] to-emerald-500" 
                : "bg-gradient-to-r from-red-800 to-red-500"
            }`}
            style={{ width: `${progressPercent}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>

        {/* Action Button */}
        <Link href="/app/pedir" className="block">
          <button className="w-full py-3.5 rounded-xl glass-accent flex items-center justify-center gap-3 text-white font-medium hover:bg-[#044040]/50 transition-all hover-lift group animate-glow-pulse">
            <Image 
              src="/images/cigarroaceso.png" 
              alt="" 
              width={22} 
              height={22} 
              className="pixel-art group-hover:animate-bounce-soft" 
            />
            Solicitar Cigarro
            <ChevronRight className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center interactive-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="text-2xl font-bold text-emerald-400">{data.remaining}</p>
          <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Restantes</p>
        </div>
        <div className="glass-card p-4 text-center interactive-card animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <p className="text-2xl font-bold text-white">{data.streakDays}</p>
          <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Sequência</p>
        </div>
        <div className="glass-card p-4 text-center interactive-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-2xl font-bold text-white">{data.weeklyTotal}</p>
          <p className="text-[9px] text-white/40 uppercase tracking-wider mt-1">Semanal</p>
        </div>
      </div>

      {/* Status Semanal - COMPACTO */}
      <div className="glass-card p-4 interactive-card animate-fade-in" style={{ animationDelay: "0.35s" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400 animate-bounce-soft" />
            <span className="text-xs font-medium text-white/70">Semana</span>
          </div>
          <Link href="/app/progresso" className="text-[10px] text-emerald-400 hover:underline hover:text-emerald-300 transition-colors">
            Detalhes
          </Link>
        </div>
        <div className="flex items-center justify-between mt-3 gap-4">
          <div className="flex items-center gap-2 hover-scale cursor-default">
            <Flame className="w-4 h-4 text-white/30" />
            <span className="text-sm text-white">{data.weeklyTotal}<span className="text-white/30">/{data.weeklyLimit}</span></span>
          </div>
          <div className="flex items-center gap-2 hover-scale cursor-default">
            <Zap className="w-4 h-4 text-white/30" />
            <span className="text-sm text-white">{data.streakDays} dias</span>
          </div>
          <div className="flex items-center gap-2 hover-scale cursor-default">
            <Image src="/images/hearth.png" alt="" width={14} height={14} className="pixel-art opacity-60 animate-pulse" />
            <span className="text-sm text-emerald-400 font-medium">+{data.weeklyXp}</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link 
          href="/app/missoes" 
          className="glass-card p-4 flex items-center gap-3 interactive-card group animate-fade-in" 
          style={{ animationDelay: "0.4s" }}
        >
          <Image 
            src="/images/soldadodfoof.png" 
            alt="" 
            width={40} 
            height={40} 
            className="pixel-art group-hover:animate-float transition-all group-hover:scale-110" 
          />
          <div>
            <p className="font-medium text-white text-sm">Missões</p>
            <p className="text-[10px] text-white/40">Ganhe XP</p>
          </div>
        </Link>

        <Link 
          href="/app/loja" 
          className="glass-card p-4 flex items-center gap-3 interactive-card group animate-fade-in" 
          style={{ animationDelay: "0.45s" }}
        >
          <Image 
            src="/images/pocaomarrom1.png" 
            alt="" 
            width={40} 
            height={40} 
            className="pixel-art group-hover:animate-bounce-soft transition-all group-hover:scale-110" 
          />
          <div>
            <p className="font-medium text-white text-sm">Loja</p>
            <p className="text-[10px] text-white/40">Recompensas</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
