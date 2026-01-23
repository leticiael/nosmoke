"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertBanner } from "@/components/alert-banner";
import { Badge } from "@/components/ui/badge";
import {
  createCigRequest,
  getReasons,
  getExtraPreview,
} from "@/actions/cig-request";
import { getUserDashboard } from "@/actions/dashboard";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, Sparkles } from "lucide-react";

type Reason = { id: string; text: string };

export default function PedirPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [amount, setAmount] = useState<string>("");
  const [reason1, setReason1] = useState("");
  const [reason2, setReason2] = useState("");
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [extraInfo, setExtraInfo] = useState<{
    isExtra: boolean;
    xpCost: number;
    userXp: number;
    canAfford: boolean;
  } | null>(null);
  const [alerts, setAlerts] = useState<{
    overLimit: boolean;
    over30Percent: boolean;
    todayTotal: number;
    average7Days: number;
  } | null>(null);

  // Carrega motivos
  useEffect(() => {
    getReasons().then(setReasons);
    getUserDashboard().then((data) => {
      if (data) {
        setAlerts(data.alerts);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !reason1 || !reason2) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (reason1 === reason2) {
      toast({
        title: "Motivos diferentes",
        description: "Escolha dois motivos diferentes",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.set("amount", amount);
    formData.set("reason1", reason1);
    formData.set("reason2", reason2);

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

      toast({
        title: "Pedido enviado! ✓",
        description: result.isExtra
          ? `Pedido extra. ${result.xpCost} XP descontados.`
          : "Aguarde a aprovação",
        variant: "success",
      });

      router.push("/app");
    });
  };

  const availableReasons2 = reasons.filter((r) => r.text !== reason1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pedir cigarro</h1>

      {/* Alertas */}
      {alerts?.overLimit && <AlertBanner type="over-limit" />}
      {alerts?.over30Percent && !alerts.overLimit && (
        <AlertBanner
          type="over-30-percent"
          value={alerts.todayTotal}
          average={alerts.average7Days}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quantidade */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quanto?</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={amount}
              onValueChange={setAmount}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="0.5"
                  id="half"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="half"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <span className="text-3xl font-bold">½</span>
                  <span className="text-sm text-muted-foreground">cigarro</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="1.0"
                  id="full"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="full"
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                >
                  <span className="text-3xl font-bold">1</span>
                  <span className="text-sm text-muted-foreground">cigarro</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Aviso de extra */}
        {extraInfo?.isExtra && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-amber-800">
                    Este pedido é extra
                  </p>
                  <p className="text-sm text-amber-700">
                    Você já atingiu a meta de hoje. Este pedido custa{" "}
                    <span className="font-bold">{extraInfo.xpCost} XP</span>.
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-700">
                      Seu XP:{" "}
                      <span className="font-bold">{extraInfo.userXp}</span>
                    </span>
                    {!extraInfo.canAfford && (
                      <Badge variant="destructive" className="ml-2">
                        XP insuficiente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Motivos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Por quê?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Escolha 2 motivos diferentes
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo 1</Label>
              <Select value={reason1} onValueChange={setReason1}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((r) => (
                    <SelectItem key={r.id} value={r.text}>
                      {r.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Motivo 2</Label>
              <Select value={reason2} onValueChange={setReason2}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {availableReasons2.map((r) => (
                    <SelectItem key={r.id} value={r.text}>
                      {r.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={
            isPending ||
            !amount ||
            !reason1 ||
            !reason2 ||
            (extraInfo?.isExtra && !extraInfo.canAfford)
          }
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : extraInfo?.isExtra ? (
            `Pedir (−${extraInfo.xpCost} XP)`
          ) : (
            "Pedir"
          )}
        </Button>
      </form>
    </div>
  );
}
