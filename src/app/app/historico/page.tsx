"use client";

import { useState, useEffect } from "react";
import { getCigRequestHistory, getCigRequestStats } from "@/actions/cig-request";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronDown, 
  Check, 
  Clock, 
  X, 
  Loader2
} from "lucide-react";
import Image from "next/image";

type HistoryItem = {
  id: string;
  amount: string;
  reason: string | null;
  status: string;
  createdAt: string;
  dateBr: string;
};

type Stats = {
  today: number;
  week: number;
  month: number;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  PENDING: { 
    label: "Pendente", 
    color: "text-amber-400", 
    bgColor: "bg-amber-500/10",
    icon: <Clock className="w-3.5 h-3.5" /> 
  },
  APPROVED: { 
    label: "Aprovado", 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/10",
    icon: <Check className="w-3.5 h-3.5" /> 
  },
  VALIDATED: { 
    label: "Validado", 
    color: "text-emerald-400", 
    bgColor: "bg-emerald-500/10",
    icon: <Check className="w-3.5 h-3.5" /> 
  },
  REJECTED: { 
    label: "Rejeitado", 
    color: "text-red-400", 
    bgColor: "bg-red-500/10",
    icon: <X className="w-3.5 h-3.5" /> 
  },
};

export default function HistoricoPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadData = async (pageNum: number, append = false) => {
    const [historyData, statsData] = await Promise.all([
      getCigRequestHistory(pageNum),
      pageNum === 1 ? getCigRequestStats() : null,
    ]);

    if (append) {
      setItems((prev) => [...prev, ...historyData.items]);
    } else {
      setItems(historyData.items);
    }
    setHasMore(historyData.hasMore);
    if (statsData) setStats(statsData);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    loadData(1);
  }, []);

  const handleLoadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    loadData(nextPage, true);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#1a1a24] flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
        </div>
        <p className="text-white/50 text-sm">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Histórico</h1>
          <p className="text-xs text-white/50 mt-0.5">Seus pedidos de cigarro</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#1a1a24] border border-white/5 flex items-center justify-center">
          <Image src="/images/bau.png" alt="" width={24} height={24} className="pixel-art" />
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#12121a] rounded-xl p-4 border border-white/5 text-center">
            <p className="text-2xl font-bold text-white">{stats.today}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Hoje</p>
          </div>
          <div className="bg-[#12121a] rounded-xl p-4 border border-white/5 text-center">
            <p className="text-2xl font-bold text-white">{stats.week}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Semana</p>
          </div>
          <div className="bg-[#12121a] rounded-xl p-4 border border-white/5 text-center">
            <p className="text-2xl font-bold text-white">{stats.month}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Mês</p>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="bg-[#12121a] rounded-2xl p-12 border border-white/5 text-center">
          <Image
            src="/images/cigarroapagado.png"
            alt=""
            width={40}
            height={40}
            className="pixel-art opacity-30 mx-auto mb-4"
          />
          <p className="text-white/40 text-sm">Nenhum pedido ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
            const isHalf = parseFloat(item.amount) === 0.5;

            return (
              <div
                key={item.id}
                className="bg-[#12121a] rounded-xl p-4 border border-white/5"
              >
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    statusConfig.bgColor
                  )}>
                    <Image
                      src={isHalf ? "/images/cigarroapagado.png" : "/images/cigarroaceso.png"}
                      alt=""
                      width={22}
                      height={22}
                      className="pixel-art"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-white text-sm">
                        {isHalf ? "½ cigarro" : "1 cigarro"}
                      </span>
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                        statusConfig.bgColor,
                        statusConfig.color
                      )}>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-white/40">{item.dateBr}</span>
                      {item.reason && (
                        <>
                          <span className="text-white/20">•</span>
                          <span className="text-[11px] text-white/40 truncate">{item.reason}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-[#12121a] border-white/10 text-white/60 hover:bg-[#1a1a24] hover:text-white rounded-xl"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Carregando...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Carregar mais
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
