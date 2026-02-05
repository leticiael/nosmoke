"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getPendingCoupons,
  searchCoupon,
  validateCoupon,
} from "@/actions/coupon";
import { formatCouponCode } from "@/lib/coupon";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, CheckCircle2, XCircle, Clock } from "lucide-react";
import Image from "next/image";

type PendingCoupon = {
  id: string;
  couponCode: string;
  userName: string;
  amount?: number;
  reason?: string;
  rewardTitle?: string;
  createdAt: string;
};

type SearchResult = {
  id: string;
  type: "cigarette" | "reward";
  status: string;
  couponCode: string;
  userName: string;
  amount?: number;
  reason?: string;
  rewardTitle?: string;
  createdAt: string;
};

export default function ValidarPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchCode, setSearchCode] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [pendingCigs, setPendingCigs] = useState<PendingCoupon[]>([]);
  const [pendingRewards, setPendingRewards] = useState<PendingCoupon[]>([]);
  const [validatingId, setValidatingId] = useState<string | null>(null);

  const loadPending = async () => {
    const data = await getPendingCoupons();
    setPendingCigs(data.cigarettes);
    setPendingRewards(data.rewards);
  };

  useEffect(() => {
    loadPending();
    const interval = setInterval(loadPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (!searchCode.trim()) return;

    setSearchError(null);
    setSearchResult(null);

    startTransition(async () => {
      const result = await searchCoupon(searchCode.trim());
      if (result.error || !result.found) {
        setSearchError(result.error || "Cupom não encontrado");
      } else {
        setSearchResult(result.coupon as SearchResult);
      }
    });
  };

  const handleValidate = async (code: string, action: "approve" | "reject") => {
    setValidatingId(code);

    startTransition(async () => {
      const result = await validateCoupon(code, action);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: action === "approve" ? "Aprovado! ✓" : "Rejeitado",
          description:
            action === "approve"
              ? "O usuário foi notificado"
              : "Cupom rejeitado",
          variant: action === "approve" ? "success" : "default",
        });
        setSearchResult(null);
        setSearchCode("");
        await loadPending();
      }

      setValidatingId(null);
    });
  };

  const totalPending = pendingCigs.length + pendingRewards.length;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/guerreiro1.png"
          alt="Validar"
          width={56}
          height={56}
          className="pixel-art glow-teal"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">Validar Cupons</h1>
          <p className="text-sm text-muted-foreground">
            {totalPending > 0
              ? `${totalPending} cupom(s) pendente(s)`
              : "Nenhum cupom pendente"}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex gap-3">
          <Input
            placeholder="Digite o código (ex: ABC-123)"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="font-mono text-lg tracking-wider bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleSearch}
            disabled={isPending}
            className="gradient-primary hover:opacity-90 px-6"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search Error */}
        {searchError && (
          <p className="text-red-400 text-sm mt-3">{searchError}</p>
        )}

        {/* Search Result */}
        {searchResult && (
          <div className="mt-4 glass rounded-xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <Image
                src={searchResult.type === "cigarette" ? "/images/cigarroaceso.png" : "/images/pocaomarrom1.png"}
                alt={searchResult.type}
                width={40}
                height={40}
                className="pixel-art"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white">
                  {searchResult.userName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchResult.type === "cigarette"
                    ? `${searchResult.amount === 0.5 ? "½" : "1"} cigarro - ${searchResult.reason}`
                    : searchResult.rewardTitle}
                </p>
              </div>
              <Badge
                className={
                  searchResult.status === "PENDING"
                    ? "bg-amber-500/20 text-amber-400 border-0"
                    : searchResult.status === "APPROVED" ||
                        searchResult.status === "VALIDATED"
                      ? "bg-emerald-500/20 text-emerald-400 border-0"
                      : "bg-red-500/20 text-red-400 border-0"
                }
              >
                {searchResult.status === "PENDING"
                  ? "Pendente"
                  : searchResult.status === "APPROVED" ||
                      searchResult.status === "VALIDATED"
                    ? "Aprovado"
                    : "Rejeitado"}
              </Badge>
            </div>

            {searchResult.status === "PENDING" && (
              <div className="flex gap-3">
                <Button
                  className="flex-1 gradient-success hover:opacity-90"
                  onClick={() =>
                    handleValidate(searchResult.couponCode, "approve")
                  }
                  disabled={validatingId === searchResult.couponCode}
                >
                  {validatingId === searchResult.couponCode ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                  onClick={() =>
                    handleValidate(searchResult.couponCode, "reject")
                  }
                  disabled={validatingId === searchResult.couponCode}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pending Queue */}
      {totalPending > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-muted-foreground uppercase tracking-wider">
              Fila de espera
            </span>
          </div>

          {/* Pending Cigarettes */}
          {pendingCigs.map((coupon) => (
            <div
              key={coupon.id}
              className="glass-card rounded-2xl p-4 border-l-4 border-l-amber-500"
            >
              <div className="flex items-center gap-4">
                <Image
                  src="/images/cigarroaceso.png"
                  alt="Cigarro"
                  width={40}
                  height={40}
                  className="pixel-art"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {coupon.userName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {coupon.amount === 0.5 ? "½" : "1"} cigarro • {coupon.reason}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {formatCouponCode(coupon.couponCode)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="gradient-success hover:opacity-90"
                    onClick={() =>
                      handleValidate(coupon.couponCode, "approve")
                    }
                    disabled={validatingId === coupon.couponCode}
                  >
                    {validatingId === coupon.couponCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() =>
                      handleValidate(coupon.couponCode, "reject")
                    }
                    disabled={validatingId === coupon.couponCode}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Pending Rewards */}
          {pendingRewards.map((coupon) => (
            <div
              key={coupon.id}
              className="glass-card rounded-2xl p-4 border-l-4 border-l-primary"
            >
              <div className="flex items-center gap-4">
                <Image
                  src="/images/pocaomarrom1.png"
                  alt="Recompensa"
                  width={40}
                  height={40}
                  className="pixel-art"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {coupon.userName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {coupon.rewardTitle}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground mt-1">
                    {formatCouponCode(coupon.couponCode)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="gradient-success hover:opacity-90"
                    onClick={() =>
                      handleValidate(coupon.couponCode, "approve")
                    }
                    disabled={validatingId === coupon.couponCode}
                  >
                    {validatingId === coupon.couponCode ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    onClick={() =>
                      handleValidate(coupon.couponCode, "reject")
                    }
                    disabled={validatingId === coupon.couponCode}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {totalPending === 0 && !searchResult && (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Image
            src="/images/soldadodfoof.png"
            alt="Vazio"
            width={64}
            height={64}
            className="pixel-art mx-auto mb-4 opacity-50"
          />
          <p className="text-muted-foreground">Nenhum cupom pendente no momento</p>
          <p className="text-sm text-muted-foreground mt-1">
            Novos cupons aparecerão aqui automaticamente
          </p>
        </div>
      )}
    </div>
  );
}
