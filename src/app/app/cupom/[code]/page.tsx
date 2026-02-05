"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCouponDetails } from "@/actions/coupon";
import { formatCouponCode } from "@/lib/coupon";
import { CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
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

    // Progressive polling
    let pollCount = 0;
    const getInterval = () => Math.min(5000 + pollCount * 5000, 30000);
    
    let timeoutId: NodeJS.Timeout;
    const poll = () => {
      timeoutId = setTimeout(async () => {
        await loadCoupon();
        pollCount++;
        if (!error) {
          poll();
        }
      }, getInterval());
    };
    poll();
    
    return () => clearTimeout(timeoutId);
  }, [code, error]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Image
            src="/images/soldadodfoof.png"
            alt="Carregando"
            width={80}
            height={80}
            className="pixel-art animate-float"
          />
          <div className="absolute inset-0 blur-2xl bg-primary/30 -z-10" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">Carregando cupom...</p>
          <p className="text-sm text-muted-foreground mt-1">Aguarde um momento</p>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="glass-card rounded-full p-6">
          <XCircle className="h-12 w-12 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">
            {error || "Cupom não encontrado"}
          </p>
        </div>
        <Link href="/app">
          <Button variant="outline" className="glass border-0 rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>
    );
  }

  const isPending = coupon.status === "PENDING";
  const isApproved = coupon.status === "APPROVED" || coupon.status === "VALIDATED";
  const isRejected = coupon.status === "REJECTED";

  return (
    <div className="min-h-[70vh] flex flex-col pb-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/app">
          <Button variant="ghost" size="icon" className="glass rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Image
            src={coupon.type === "cigarette" ? "/images/cigarroaceso.png" : "/images/pocaomarrom1.png"}
            alt={coupon.type}
            width={40}
            height={40}
            className="pixel-art"
          />
          <div>
            <h1 className="text-xl font-bold text-white">
              {coupon.type === "cigarette" ? "Vale Cigarro" : "Vale Resgate"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isPending && "Aguardando validação"}
              {isApproved && "Validado com sucesso!"}
              {isRejected && "Não aprovado"}
            </p>
          </div>
        </div>
      </div>

      {/* Coupon Card */}
      <div className={`glass-card rounded-3xl overflow-hidden mb-6 ${
        isApproved ? "glass-success" : ""
      }`}>
        <div className={`h-2 ${
          isPending ? "gradient-primary" : isApproved ? "gradient-success" : "bg-red-500"
        }`} />
        
        <div className="p-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Image
                src={coupon.type === "cigarette" ? "/images/cigarroaceso.png" : "/images/pocaomarrom1.png"}
                alt={coupon.type}
                width={48}
                height={48}
                className="pixel-art glow-teal"
              />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">NoSmoke</p>
                <p className="font-semibold text-white">
                  {coupon.type === "cigarette" ? "Vale Cigarro" : "Vale Resgate"}
                </p>
              </div>
            </div>
            
            <Badge className={`border-0 ${
              isPending 
                ? "bg-amber-500/20 text-amber-400"
                : isApproved
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
            }`}>
              {isPending && <Clock className="w-3 h-3 mr-1" />}
              {isApproved && <CheckCircle2 className="w-3 h-3 mr-1" />}
              {isRejected && <XCircle className="w-3 h-3 mr-1" />}
              {isPending ? "Pendente" : isApproved ? "Aprovado" : "Rejeitado"}
            </Badge>
          </div>

          {/* Coupon Code */}
          <div className="glass rounded-2xl p-8 text-center mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Código</p>
            <p className={`text-4xl md:text-5xl font-mono font-bold tracking-[0.15em] ${
              isPending ? "text-white" : isApproved ? "text-primary glow-teal" : "text-red-400"
            }`}>
              {formatCouponCode(coupon.couponCode)}
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {new Date(coupon.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="glass-card rounded-2xl p-5 mb-6 space-y-4">
        {coupon.type === "cigarette" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Quantidade</span>
              <span className="font-semibold text-white">
                {coupon.amount === 0.5 ? "Meio cigarro" : "Um cigarro"}
              </span>
            </div>
            <div className="h-px bg-white/10" />
            <div>
              <span className="text-sm text-muted-foreground">Motivo</span>
              <p className="font-medium text-white mt-1">{coupon.reason}</p>
            </div>
          </>
        )}
        {coupon.type === "reward" && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Recompensa</span>
              <span className="font-semibold text-white">{coupon.rewardTitle}</span>
            </div>
            {coupon.rewardDescription && (
              <>
                <div className="h-px bg-white/10" />
                <p className="text-sm text-muted-foreground">{coupon.rewardDescription}</p>
              </>
            )}
          </>
        )}
      </div>

      {/* Status Message */}
      {isPending && (
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl gradient-primary animate-pulse">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Aguardando aprovação</p>
            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Atualizando em tempo real
            </p>
          </div>
        </div>
      )}

      {isApproved && (
        <div className="glass-success rounded-2xl p-5 flex items-center gap-4">
          <div className="p-3 rounded-2xl gradient-success">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Cupom aprovado!</p>
            <p className="text-sm text-muted-foreground">
              Seu cupom foi validado com sucesso 🎉
            </p>
          </div>
          <Image
            src="/images/trophy.png"
            alt="Sucesso"
            width={48}
            height={48}
            className="pixel-art ml-auto glow-gold"
          />
        </div>
      )}

      {isRejected && (
        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-red-500 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-red-500">
            <XCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-white">Cupom rejeitado</p>
            <p className="text-sm text-muted-foreground">
              Este cupom não foi aprovado
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
