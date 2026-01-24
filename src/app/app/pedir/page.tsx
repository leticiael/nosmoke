"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  createCigRequest,
  getReasons,
  getExtraPreview,
} from "@/actions/cig-request";
import { getUserDashboard } from "@/actions/dashboard";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  AlertTriangle,
  Sparkles,
  Cigarette,
  ArrowLeft,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Reason = { id: string; text: string };

export default function PedirPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Etapa do funil: 1 = quantidade, 2 = motivo, 3 = confirmar
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

  // Carrega motivos e dados
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

  // Verifica se é extra quando muda a quantidade
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

      // Redireciona para a página do cupom
      if (result.couponCode) {
        router.push(`/app/cupom/${result.couponCode}`);
      } else {
        toast({
          title: "Pedido enviado! ✓",
          description: result.isExtra
            ? `Pedido extra. ${result.xpCost} XP descontados.`
            : "Aguarde a Letícia aprovar 💜",
        });
        router.push("/app");
      }
    });
  };

  const amountLabel = amount === "0.5" ? "½ cigarro" : "1 cigarro";

  return (
    <div className="min-h-[70vh] flex flex-col">
      {/* Header com voltar */}
      <div className="flex items-center gap-3 mb-6">
        {step > 1 ? (
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        ) : (
          <Link href="/app">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold">Pedir cigarro</h1>
          <p className="text-sm text-muted-foreground">
            {step === 1 && "Quanto você quer?"}
            {step === 2 && "Por que você quer?"}
            {step === 3 && "Confirma o pedido?"}
          </p>
        </div>
      </div>

      {/* Indicador de progresso */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              s <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      {/* Etapa 1: Quantidade */}
      {step === 1 && (
        <div className="flex-1 flex flex-col gap-4">
          {/* Info do dia */}
          {dashboardData && (
            <Card className="bg-muted/50 border-0">
              <CardContent className="p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Hoje</span>
                  <span className="font-medium">
                    {dashboardData.todayTotal} / {dashboardData.todayLimit}{" "}
                    cigarros
                  </span>
                </div>
                {dashboardData.todayRemaining > 0 ? (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Ainda pode pedir {dashboardData.todayRemaining} dentro da
                    meta
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠ Meta atingida - pedidos extras custam XP
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Opções de quantidade */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            <button
              onClick={() => handleSelectAmount("0.5")}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-muted bg-card p-8 hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
            >
              <Cigarette className="h-8 w-8 text-muted-foreground mb-3 rotate-45" />
              <span className="text-4xl font-bold">½</span>
              <span className="text-sm text-muted-foreground mt-1">
                meio cigarro
              </span>
            </button>

            <button
              onClick={() => handleSelectAmount("1.0")}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-muted bg-card p-8 hover:border-primary hover:bg-primary/5 transition-all active:scale-95"
            >
              <Cigarette className="h-8 w-8 text-muted-foreground mb-3" />
              <span className="text-4xl font-bold">1</span>
              <span className="text-sm text-muted-foreground mt-1">
                cigarro inteiro
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Etapa 2: Motivo */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-3">
          {/* Aviso de extra */}
          {extraInfo?.isExtra && (
            <Card className="border-amber-200 bg-amber-50 mb-2">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-800">
                    Pedido extra: <strong>−{extraInfo.xpCost} XP</strong>
                  </span>
                  {!extraInfo.canAfford && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      XP insuficiente
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de motivos */}
          <div className="space-y-2">
            {reasons.map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelectReason(r.text)}
                disabled={extraInfo?.isExtra && !extraInfo.canAfford}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 border-muted bg-card transition-all",
                  "hover:border-primary hover:bg-primary/5 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <span className="text-base">{r.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Etapa 3: Confirmação */}
      {step === 3 && (
        <div className="flex-1 flex flex-col">
          {/* Resumo */}
          <Card className="mb-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Quantidade</span>
                <span className="font-semibold text-lg">{amountLabel}</span>
              </div>
              <div className="border-t pt-4">
                <span className="text-muted-foreground text-sm">Motivo</span>
                <p className="font-medium mt-1">{reason}</p>
              </div>

              {extraInfo?.isExtra && (
                <div className="border-t pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm">Custo extra</span>
                  </div>
                  <span className="font-bold text-amber-600">
                    −{extraInfo.xpCost} XP
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botão de confirmar */}
          <div className="mt-auto space-y-3">
            <Button
              size="lg"
              className="w-full h-14 text-lg"
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
                  Confirmar pedido
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              A Letícia vai receber uma notificação 💜
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
