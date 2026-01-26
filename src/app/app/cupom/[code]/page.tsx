"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCouponDetails } from "@/actions/coupon";
import { formatCouponCode } from "@/lib/coupon";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Image
            src="/images/girl.png"
            alt="Carregando"
            width={80}
            height={80}
            className="[image-rendering:pixelated] animate-bounce"
          />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-white">
            Buscando seu cupom...
          </p>
          <p className="text-sm text-zinc-500 mt-1">Um momento</p>
        </div>
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-teal-300 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
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
            {coupon.type === "cigarette" ? "Vale Cigarro" : "Vale Resgate"}
          </h1>
          <p className="text-sm text-zinc-500">
            {isPending && "Aguardando validação"}
            {isApproved && "Validado com sucesso!"}
            {isRejected && "Não aprovado"}
          </p>
        </div>
      </div>

      {/* Cupom Minimalista */}
      <div className="relative mb-6">
        {/* Main Card */}
        <Card className="border-0 bg-zinc-900/80 overflow-hidden">
          {/* Top accent - sutil */}
          <div
            className={`h-1 ${
              isPending
                ? "bg-teal-500"
                : isApproved
                  ? "bg-emerald-500"
                  : "bg-red-500"
            }`}
          />

          <CardContent className="p-0">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <Image
                      src={
                        coupon.type === "cigarette"
                          ? "/images/cigarroaceso.png"
                          : "/images/voucher.png"
                      }
                      alt={coupon.type === "cigarette" ? "Cigarro" : "Presente"}
                      width={24}
                      height={24}
                      className="[image-rendering:pixelated]"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                      NoSmoke
                    </p>
                    <p className="text-white font-semibold">
                      {coupon.type === "cigarette"
                        ? "Vale Cigarro"
                        : "Vale Resgate"}
                    </p>
                  </div>
                </div>

                <Badge
                  className={`text-xs ${
                    isPending
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      : isApproved
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  {isPending && <Clock className="w-3 h-3 mr-1" />}
                  {isApproved && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {isRejected && <XCircle className="w-3 h-3 mr-1" />}
                  {isPending
                    ? "Pendente"
                    : isApproved
                      ? "Aprovado"
                      : "Rejeitado"}
                </Badge>
              </div>
            </div>

            {/* Perfuração */}
            <div className="relative h-6 flex items-center">
              <div className="absolute left-0 w-3 h-6 bg-zinc-950 rounded-r-full -translate-x-1/2" />
              <div className="absolute right-0 w-3 h-6 bg-zinc-950 rounded-l-full translate-x-1/2" />
              <div className="flex-1 mx-4 border-t border-dashed border-zinc-700" />
            </div>

            {/* Código */}
            <div className="px-5 pb-6">
              <p className="text-center text-[10px] text-zinc-500 uppercase tracking-widest mb-3">
                Código
              </p>
              <div className="bg-zinc-800/50 rounded-xl p-4">
                <p
                  className={`text-center text-3xl md:text-4xl font-mono font-bold tracking-[0.2em] ${
                    isPending
                      ? "text-white"
                      : isApproved
                        ? "text-emerald-400"
                        : "text-red-400"
                  }`}
                >
                  {formatCouponCode(coupon.couponCode)}
                </p>
              </div>

              {/* Data */}
              <p className="text-center text-xs text-zinc-600 mt-3">
                {new Date(coupon.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes do pedido */}
      <Card className="border-0 bg-zinc-900/80 ring-1 ring-zinc-800">
        <CardContent className="p-5 space-y-4">
          {coupon.type === "cigarette" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Quantidade</span>
                <span className="font-medium text-zinc-200 flex items-center gap-2">
                  <Image
                    src="/images/cigarroaceso.png"
                    alt="Cigarro"
                    width={18}
                    height={18}
                    className="[image-rendering:pixelated]"
                  />
                  {coupon.amount === 0.5 ? "Meio cigarro" : "Um cigarro"}
                </span>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Motivo</span>
                <span className="font-medium text-zinc-200 text-right max-w-[60%]">
                  {coupon.reason}
                </span>
              </div>
            </>
          )}
          {coupon.type === "reward" && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Recompensa</span>
                <span className="font-medium text-zinc-200">
                  {coupon.rewardTitle}
                </span>
              </div>
              {coupon.rewardDescription && (
                <>
                  <div className="h-px bg-zinc-800" />
                  <p className="text-sm text-zinc-500">
                    {coupon.rewardDescription}
                  </p>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Ação/Status final */}
      {isPending && (
        <div className="mt-4 p-5 rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-teal-500/30 rounded-full blur-lg animate-pulse" />
              <Image
                src="/images/girl.png"
                alt="Letícia"
                width={64}
                height={64}
                className="[image-rendering:pixelated] relative"
              />
            </div>
            <div className="flex-1">
              <p className="text-base text-white font-semibold">
                Aguardando <span className="text-teal-400">Letícia</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                Atualizando em tempo real
              </p>
            </div>
            <Clock className="h-6 w-6 text-teal-500" />
          </div>
        </div>
      )}

      {isApproved && (
        <div className="mt-4 p-5 rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Image
                src="/images/girl.png"
                alt="Letícia"
                width={64}
                height={64}
                className="[image-rendering:pixelated]"
              />
            </div>
            <div className="flex-1">
              <p className="text-base text-white font-semibold flex items-center gap-2">
                Aprovado por <span className="text-emerald-400">Letícia</span>
                <span>🎉</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Seu cupom foi validado com sucesso
              </p>
            </div>
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </div>
        </div>
      )}

      {isRejected && (
        <div className="mt-4 p-5 rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Image
                src="/images/girl.png"
                alt="Letícia"
                width={64}
                height={64}
                className="[image-rendering:pixelated] opacity-60"
              />
            </div>
            <div className="flex-1">
              <p className="text-base text-white font-semibold">
                Rejeitado por <span className="text-red-400">Letícia</span>
              </p>
              <p className="text-sm text-zinc-500 mt-1">
                Este cupom não foi aprovado
              </p>
            </div>
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
        </div>
      )}
    </div>
  );
}
