"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCouponDetails } from "@/actions/coupon";
import { formatCouponCode } from "@/lib/coupon";
import { Loader2, CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-zinc-800 border-t-violet-500 animate-spin" />
          <Image
            src="/images/cigarroaceso.png"
            alt="Carregando"
            width={32}
            height={32}
            className="[image-rendering:pixelated] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <p className="text-sm text-zinc-500 mt-4">Carregando cupom...</p>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <XCircle className="h-16 w-16 text-red-500" />
        <p className="text-lg text-zinc-400">
          {error || "Cupom não encontrado"}
        </p>
        <Link href="/app">
          <Button
            variant="outline"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = coupon.status === "PENDING";
  const isApproved =
    coupon.status === "APPROVED" || coupon.status === "VALIDATED";
  const isRejected = coupon.status === "REJECTED";

  return (
    <div className="min-h-[70vh] flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app">
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">
            {coupon.type === "cigarette"
              ? "Cupom de Cigarro"
              : "Cupom de Resgate"}
          </h1>
          <p className="text-sm text-zinc-500">
            {isPending && "Aguardando aprovação"}
            {isApproved && "Aprovado!"}
            {isRejected && "Rejeitado"}
          </p>
        </div>
      </div>

      {/* Cupom */}
      <Card
        className={`border-0 ${isPending ? "bg-amber-950/30" : isApproved ? "bg-emerald-950/30" : "bg-red-950/30"}`}
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
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  Aguardando
                </Badge>
              </div>
            )}
            {isApproved && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  Aprovado!
                </Badge>
              </div>
            )}
            {isRejected && (
              <div className="flex flex-col items-center gap-2">
                <XCircle className="h-16 w-16 text-red-500" />
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Rejeitado
                </Badge>
              </div>
            )}
          </div>

          {/* Código do cupom */}
          <div className="text-center mb-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
              Código do cupom
            </p>
            <p className="text-4xl font-mono font-bold tracking-widest text-white">
              {formatCouponCode(coupon.couponCode)}
            </p>
          </div>

          {/* Detalhes */}
          <div className="border-t border-zinc-800 pt-4 space-y-3">
            {coupon.type === "cigarette" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Quantidade</span>
                  <span className="font-medium text-white flex items-center gap-2">
                    <Image
                      src="/images/cigarroaceso.png"
                      alt="Cigarro"
                      width={20}
                      height={20}
                      className="[image-rendering:pixelated]"
                    />
                    {coupon.amount === 0.5 ? "½ cigarro" : "1 cigarro"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Motivo</span>
                  <span className="font-medium text-white">
                    {coupon.reason}
                  </span>
                </div>
              </>
            )}
            {coupon.type === "reward" && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500">Recompensa</span>
                  <span className="font-medium text-white">
                    {coupon.rewardTitle}
                  </span>
                </div>
                {coupon.rewardDescription && (
                  <p className="text-sm text-zinc-500">
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
        <div className="mt-6">
          <Card className="border-0 bg-zinc-900/80">
            <CardContent className="p-4 flex items-center gap-4">
              <Image
                src="/images/girl.png"
                alt="Letícia"
                width={56}
                height={56}
                className="[image-rendering:pixelated] shrink-0"
              />
              <div>
                <p className="text-sm text-zinc-300">
                  Mostre este cupom para a{" "}
                  <strong className="text-violet-400">Letícia</strong> validar
                  💜
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  A página atualiza automaticamente quando aprovado
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isApproved && (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-emerald-400">🎉 Aproveite!</p>
        </div>
      )}
    </div>
  );
}
