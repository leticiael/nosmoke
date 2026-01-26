"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Loader2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
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
    // Poll a cada 5 segundos
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Validar Cupons</h1>
        <p className="text-zinc-500">
          {totalPending > 0
            ? `${totalPending} cupom(s) pendente(s)`
            : "Nenhum cupom pendente"}
        </p>
      </div>

      {/* Busca por código */}
      <Card className="border-0 bg-zinc-900/80">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite o código (ex: ABC-123)"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="font-mono text-lg tracking-wider bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <Button 
              onClick={handleSearch} 
              disabled={isPending}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Resultado da busca */}
          {searchError && (
            <p className="text-red-400 text-sm mt-3">{searchError}</p>
          )}

          {searchResult && (
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {searchResult.type === "cigarette" ? (
                  <Image
                    src="/images/cigarroaceso.png"
                    alt="Cigarro"
                    width={24}
                    height={24}
                    className="[image-rendering:pixelated]"
                  />
                ) : (
                  <Image
                    src="/images/pocaomarrom1.png"
                    alt="Recompensa"
                    width={24}
                    height={24}
                    className="[image-rendering:pixelated]"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white">{searchResult.userName}</p>
                  <p className="text-sm text-zinc-400">
                    {searchResult.type === "cigarette"
                      ? `${searchResult.amount === 0.5 ? "½" : "1"} cigarro - ${searchResult.reason}`
                      : searchResult.rewardTitle}
                  </p>
                </div>
                <Badge
                  className={
                    searchResult.status === "PENDING"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      : searchResult.status === "APPROVED" ||
                          searchResult.status === "VALIDATED"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border-red-500/30"
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
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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
                    className="flex-1 border-zinc-700 hover:bg-red-950 hover:text-red-400 hover:border-red-500/30"
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
        </CardContent>
      </Card>

      {/* Lista de pendentes */}
      {totalPending > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Fila de espera</h2>

          {/* Cigarros */}
          {pendingCigs.map((coupon) => (
            <Card key={coupon.id} className="border-0 bg-zinc-900/80 border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/cigarroaceso.png"
                    alt="Cigarro"
                    width={24}
                    height={24}
                    className="[image-rendering:pixelated]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{coupon.userName}</p>
                    <p className="text-sm text-zinc-500">
                      {coupon.amount === 0.5 ? "½" : "1"} cigarro •{" "}
                      {coupon.reason}
                    </p>
                    <p className="text-xs font-mono text-zinc-600 mt-1">
                      {formatCouponCode(coupon.couponCode)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
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
                      className="border-zinc-700 hover:bg-red-950 hover:text-red-400"
                      onClick={() =>
                        handleValidate(coupon.couponCode, "reject")
                      }
                      disabled={validatingId === coupon.couponCode}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Resgates */}
          {pendingRewards.map((coupon) => (
            <Card key={coupon.id} className="border-0 bg-zinc-900/80 border-l-4 border-l-violet-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/pocaomarrom1.png"
                    alt="Recompensa"
                    width={24}
                    height={24}
                    className="[image-rendering:pixelated]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{coupon.userName}</p>
                    <p className="text-sm text-zinc-500">
                      {coupon.rewardTitle}
                    </p>
                    <p className="text-xs font-mono text-zinc-600 mt-1">
                      {formatCouponCode(coupon.couponCode)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
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
                      className="border-zinc-700 hover:bg-red-950 hover:text-red-400"
                      onClick={() =>
                        handleValidate(coupon.couponCode, "reject")
                      }
                      disabled={validatingId === coupon.couponCode}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPending === 0 && !searchResult && (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">
            Nenhum cupom pendente no momento
          </p>
        </div>
      )}
    </div>
  );
}
