"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSystemConfigAdmin,
  getDayLimitsAdmin,
  setDayLimit,
  updateSystemConfig,
} from "@/actions/admin";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Plus, Settings, Calendar, Zap } from "lucide-react";
import { todayBrasilia } from "@/lib/date-utils";
import Image from "next/image";

type SystemConfig = {
  weeklyReductionPct: number;
  defaultDailyLimit: number;
  extraCost05: number;
  extraCost10: number;
  dailyXpEnabled: boolean;
  xpPerCig: number;
};

type DayLimit = {
  date: string;
  limit: number;
};

export default function ConfigPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [dayLimits, setDayLimits] = useState<DayLimit[]>([]);
  const [newLimitDate, setNewLimitDate] = useState(todayBrasilia());
  const [newLimitValue, setNewLimitValue] = useState("3.5");

  const loadData = async () => {
    const [configData, limitsData] = await Promise.all([
      getSystemConfigAdmin(),
      getDayLimitsAdmin(),
    ]);
    if (configData) setConfig(configData);
    setDayLimits(limitsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

    const formData = new FormData();
    formData.set("weeklyReductionPct", config.weeklyReductionPct.toString());
    formData.set("defaultDailyLimit", config.defaultDailyLimit.toString());
    formData.set("extraCost05", config.extraCost05.toString());
    formData.set("extraCost10", config.extraCost10.toString());
    formData.set("dailyXpEnabled", config.dailyXpEnabled.toString());
    formData.set("xpPerCig", config.xpPerCig.toString());

    startTransition(async () => {
      const result = await updateSystemConfig(formData);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Salvo! ✓",
          description: "Configurações atualizadas",
          variant: "success",
        });
      }
    });
  };

  const handleAddDayLimit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set("date", newLimitDate);
    formData.set("limit", newLimitValue);

    startTransition(async () => {
      const result = await setDayLimit(formData);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Meta definida! ✓",
          description: `Meta de ${newLimitDate} atualizada`,
          variant: "success",
        });
        await loadData();
      }
    });
  };

  if (!config) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Image
          src="/images/healer.png"
          alt="Carregando"
          width={64}
          height={64}
          className="pixel-art animate-float"
        />
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/bau.png"
          alt="Configurações"
          width={56}
          height={56}
          className="pixel-art glow-gold"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações</h1>
          <p className="text-sm text-muted-foreground">
            Ajuste as regras do sistema
          </p>
        </div>
      </div>

      {/* General Settings */}
      <form onSubmit={handleSaveConfig} className="space-y-6">
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-white">Configurações gerais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Meta diária padrão</Label>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                max="20"
                value={config.defaultDailyLimit}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    defaultDailyLimit: parseFloat(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                Limite de cigarros por dia quando não há meta específica
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Redução semanal (%)</Label>
              <Input
                type="number"
                step="1"
                min="0"
                max="50"
                value={config.weeklyReductionPct}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    weeklyReductionPct: parseFloat(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                % de redução da meta a cada semana
              </p>
            </div>
          </div>

          <div className="h-px bg-white/10" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Custo XP para 0.5 extra (legado)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={config.extraCost05}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    extraCost05: parseInt(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Custo XP para 1.0 extra (legado)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={config.extraCost10}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    extraCost10: parseInt(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Daily XP System */}
        <div className="glass-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/images/hearth.png"
              alt="XP"
              width={20}
              height={20}
              className="pixel-art"
            />
            <h2 className="text-lg font-semibold text-white">Sistema de Mesada Diária</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dailyXpEnabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      dailyXpEnabled: e.target.checked,
                    })
                  }
                  className="h-5 w-5 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                />
                <span className="text-white font-medium">Ativar sistema de mesada</span>
              </label>
              <p className="text-xs text-muted-foreground pl-8">
                Quando ativo, o usuário recebe XP diário baseado na meta
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">XP por cigarro</Label>
              <Input
                type="number"
                min="1"
                max="200"
                value={config.xpPerCig}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    xpPerCig: parseInt(e.target.value),
                  })
                }
                disabled={!config.dailyXpEnabled}
                className="bg-white/5 border-white/10 disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">
                XP cobrado por cigarro dentro da meta
              </p>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-12 gradient-primary hover:opacity-90"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar configurações
        </Button>
      </form>

      {/* Daily Limits */}
      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-white">Metas diárias específicas</h2>
        </div>

        <form onSubmit={handleAddDayLimit} className="flex flex-wrap items-end gap-4">
          <div className="space-y-2 flex-1 min-w-[150px]">
            <Label className="text-muted-foreground">Data</Label>
            <Input
              type="date"
              value={newLimitDate}
              onChange={(e) => setNewLimitDate(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-2 w-32">
            <Label className="text-muted-foreground">Meta (cigarros)</Label>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="20"
              value={newLimitValue}
              onChange={(e) => setNewLimitValue(e.target.value)}
              className="bg-white/5 border-white/10"
            />
          </div>
          <Button
            type="submit"
            disabled={isPending}
            className="gradient-primary hover:opacity-90"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Adicionar
          </Button>
        </form>

        {dayLimits.length > 0 && (
          <div className="space-y-2">
            {dayLimits.map((dl) => (
              <div
                key={dl.date}
                className="flex items-center justify-between p-4 glass rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/cigarroaceso.png"
                    alt="Meta"
                    width={24}
                    height={24}
                    className="pixel-art"
                  />
                  <span className="font-medium text-white">{dl.date}</span>
                </div>
                <span className="text-primary font-bold">
                  {dl.limit.toFixed(1).replace(".", ",")} cigarros
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
