"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  createCigRequest,
  getReasons,
  getExtraPreview,
} from "@/actions/cig-request";
import { getUserDashboard } from "@/actions/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Check, AlertTriangle, Flame } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Reason = { id: string; text: string };

export default function PedirPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState("");
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [extraInfo, setExtraInfo] = useState<{
    isExtra: boolean;
    xpCost: number;
    userXp: number;
    canAfford: boolean;
  } | null>(null);
  const [dashboardData, setDashboardData] = useState<{
    todayTotal: number;
    todayLimit: number;
    todayRemaining: number;
  } | null>(null);

  useEffect(() => {
    getReasons().then(setReasons);
    getUserDashboard().then((data) => {
      if (data) {
        setDashboardData({
          todayTotal: data.todayTotal,
          todayLimit: data.dailyLimit,
          todayRemaining: data.remaining,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (amount) {
      getExtraPreview(amount).then((info) => setExtraInfo(info));
    } else {
      setExtraInfo(null);
    }
  }, [amount]);

  const handleSelectAmount = (value: string) => {
    setAmount(value);
    setStep(2);
  };

  const handleSelectReason = (reasonText: string) => {
    setReason(reasonText);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setAmount("");
    } else if (step === 3) {
      setStep(2);
      setReason("");
    }
  };

  const handleSubmit = async () => {
    if (!amount || !reason) return;

    const formData = new FormData();
    formData.set("amount", amount);
    formData.set("reason1", reason);
    formData.set("reason2", reason);

    startTransition(async () => {
      const result = await createCigRequest(formData);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      if (result.couponCode) {
        router.push(`/app/cupom/${result.couponCode}`);
      } else {
        toast({
          title: "Pedido enviado!",
          description: "Aguarde a aprovação",
        });
        router.push("/app");
      }
    });
  };

  const amountLabel = amount === "0.5" ? "½ cigarro" : "1 cigarro";
  const xpCost = extraInfo?.xpCost ?? (amount === "0.5" ? 15 : 30);

  if (isPending) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <Image
            src="/images/guerreiro1.png"
            alt="Enviando"
            width={100}
            height={100}
            className="pixel-art pixel-glow animate-float"
          />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">Enviando pedido...</p>
          <p className="text-sm text-muted-foreground mt-1">
            A Letícia vai receber 💜
          </p>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex flex-col pb-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {step > 1 ? (
          <Button variant="ghost" size="icon" onClick={handleBack} className="rpg-border rounded-xl h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Link href="/app">
            <Button variant="ghost" size="icon" className="rpg-border rounded-xl h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <div className="flex items-center gap-3">
          <Image
            src="/images/guerreiro1.png"
            alt="Pedir"
            width={44}
            height={44}
            className="pixel-art pixel-glow"
          />
          <div>
            <h1 className="text-xl rpg-title">Solicitar</h1>
            <p className="text-xs text-muted-foreground">
              {step === 1 && "Escolha a quantidade"}
              {step === 2 && "Qual o motivo?"}
              {step === 3 && "Confirme seu pedido"}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              s <= step ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Amount */}
      {step === 1 && (
        <div className="flex-1 flex flex-col gap-6">
          {dashboardData && (
            <div className="rpg-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-amber-400" />
                <span className="text-sm text-muted-foreground">Consumo de hoje</span>
              </div>
              <span className="stat-value text-white">
                {dashboardData.todayTotal} / {dashboardData.todayLimit}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 flex-1">
            <button
              onClick={() => handleSelectAmount("0.5")}
              className="rpg-card p-6 flex flex-col items-center justify-center hover:rpg-card-glow transition-all active:scale-[0.98] group"
            >
              <Image
                src="/images/cigarroapagado.png"
                alt="Meio cigarro"
                width={64}
                height={64}
                className="pixel-art mb-4 opacity-70 group-hover:opacity-100 transition-opacity"
              />
              <span className="text-5xl font-bold text-white mb-1">½</span>
              <span className="text-sm text-muted-foreground">meio cigarro</span>
              <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
                <Image src="/images/hearth.png" alt="XP" width={14} height={14} className="pixel-art" />
                <span className="stat-value text-sm text-primary">-15</span>
              </div>
            </button>

            <button
              onClick={() => handleSelectAmount("1.0")}
              className="rpg-card p-6 flex flex-col items-center justify-center hover:rpg-card-glow transition-all active:scale-[0.98] group"
            >
              <Image
                src="/images/cigarroaceso.png"
                alt="Um cigarro"
                width={64}
                height={64}
                className="pixel-art mb-4 pixel-glow group-hover:animate-float"
              />
              <span className="text-5xl font-bold text-white mb-1">1</span>
              <span className="text-sm text-muted-foreground">cigarro inteiro</span>
              <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30">
                <Image src="/images/hearth.png" alt="XP" width={14} height={14} className="pixel-art" />
                <span className="stat-value text-sm text-primary">-30</span>
              </div>
            </button>
          </div>

          <div className="rpg-card p-4 text-center space-y-1">
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-400 font-medium">Dentro da meta:</span> 30 XP/cigarro
            </p>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-400 font-medium">Fora da meta:</span> 50 XP/cigarro
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Reason */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-4">
          {extraInfo?.isExtra && (
            <div className="rpg-card p-4 flex items-center gap-3 border-l-4 border-l-amber-500">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
              <div className="flex-1">
                <span className="text-sm text-amber-200">
                  Pedido extra: <strong className="stat-value">−{extraInfo.xpCost} XP</strong>
                </span>
              </div>
              {!extraInfo.canAfford && (
                <span className="rpg-badge-danger text-xs">XP insuficiente</span>
              )}
            </div>
          )}

          <div className="space-y-3">
            {reasons.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectReason(r.text)}
                disabled={extraInfo?.isExtra && !extraInfo.canAfford}
                className="w-full text-left p-5 rpg-card transition-all hover:rpg-card-glow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-white font-medium">{r.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="flex-1 flex flex-col">
          <div className="rpg-card rpg-card-glow p-6 mb-6">
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/images/cigarroaceso.png"
                alt="Cigarro"
                width={80}
                height={80}
                className="pixel-art pixel-glow animate-float"
              />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quantidade</span>
                <span className="font-semibold text-lg text-white">{amountLabel}</span>
              </div>
              <div className="rpg-divider" />
              <div>
                <span className="text-muted-foreground text-sm">Motivo</span>
                <p className="font-medium text-white mt-1">{reason}</p>
              </div>
              <div className="rpg-divider" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src="/images/hearth.png" alt="XP" width={20} height={20} className="pixel-art" />
                  <span className="text-muted-foreground">Custo</span>
                </div>
                <span className="stat-value text-xl text-primary">−{xpCost} XP</span>
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <Button
              size="lg"
              className="w-full h-14 text-lg rounded-xl rpg-button"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Confirmar Pedido
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              A Letícia vai receber uma notificação 💜
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
