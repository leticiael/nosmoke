"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCouponDetails } from "@/actions/coupon";
import { formatCouponCode } from "@/lib/coupon";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Cigarette,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type CouponData = {
  id: string;
  type: "cigarette" | "reward";
  status: "PENDING" | "APPROVED" | "VALIDATED" | "REJECTED";
  couponCode: string;
  createdAt: string;
  amount?: number;
  reason?: string;
  rewardTitle?: string;
  rewardDescription?: string;
};

export default function CupomPage() {
  const params = useParams();
  const router = useRouter();
  const [coupon, setCoupon] = useState<CouponData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const code = params.code as string;

  useEffect(() => {
    async function loadCoupon() {
      try {
        const data = await getCouponDetails(code);
        if (data.error) {
          setError(data.error);
        } else {
          setCoupon(data.coupon as CouponData);
        }
      } catch {
        setError("Erro ao carregar cupom");
      } finally {
        setLoading(false);
      }
    }

    loadCoupon();

    // Poll para atualização em tempo real
    const interval = setInterval(loadCoupon, 3000);
    return () => clearInterval(interval);
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <XCircle className="h-16 w-16 text-destructive" />
        <p className="text-lg text-muted-foreground">
          {error || "Cupom não encontrado"}
        </p>
        <Link href="/app">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    );
  }

  const isPending = coupon.status === "PENDING";
  const isApproved =
    coupon.status === "APPROVED" || coupon.status === "VALIDATED";
  const isRejected = coupon.status === "REJECTED";

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">
            {coupon.type === "cigarette"
              ? "Cupom de Cigarro"
              : "Cupom de Resgate"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPending && "Aguardando aprovação"}
            {isApproved && "Aprovado!"}
            {isRejected && "Rejeitado"}
          </p>
        </div>
      </div>

      {/* Cupom */}
      <Card
        className={`border-2 ${isPending ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20" : isApproved ? "border-green-300 bg-green-50 dark:bg-green-950/20" : "border-red-300 bg-red-50 dark:bg-red-950/20"}`}
      >
        <CardContent className="p-6">
          {/* Status */}
          <div className="flex justify-center mb-6">
            {isPending && (
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <Clock className="h-16 w-16 text-amber-500" />
                  <div className="absolute inset-0 animate-ping">
                    <Clock className="h-16 w-16 text-amber-500 opacity-30" />
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-amber-100 text-amber-800 border-amber-300"
                >
                  Aguardando
                </Badge>
              </div>
            )}
            {isApproved && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-300"
                >
                  Aprovado!
                </Badge>
              </div>
            )}
            {isRejected && (
              <div className="flex flex-col items-center gap-2">
                <XCircle className="h-16 w-16 text-red-500" />
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 border-red-300"
                >
                  Rejeitado
                </Badge>
              </div>
            )}
          </div>

          {/* Código do cupom */}
          <div className="text-center mb-6">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Código do cupom
            </p>
            <p className="text-4xl font-mono font-bold tracking-widest">
              {formatCouponCode(coupon.couponCode)}
            </p>
          </div>

          {/* Detalhes */}
          <div className="border-t pt-4 space-y-3">
            {coupon.type === "cigarette" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Quantidade</span>
                  <span className="font-medium flex items-center gap-2">
                    <Cigarette className="h-4 w-4" />
                    {coupon.amount === 0.5 ? "½ cigarro" : "1 cigarro"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Motivo</span>
                  <span className="font-medium">{coupon.reason}</span>
                </div>
              </>
            )}
            {coupon.type === "reward" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Recompensa</span>
                  <span className="font-medium">{coupon.rewardTitle}</span>
                </div>
                {coupon.rewardDescription && (
                  <p className="text-sm text-muted-foreground">
                    {coupon.rewardDescription}
                  </p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instrução */}
      {isPending && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Mostre este cupom para a <strong>Letícia</strong> validar 💜
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            A página atualiza automaticamente quando aprovado
          </p>
        </div>
      )}

      {isApproved && (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-green-600 dark:text-green-400">
            🎉 Aproveite!
          </p>
        </div>
      )}
    </div>
  );
}
