"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  getSystemConfigAdmin,
  getDayLimitsAdmin,
  setDayLimit,
  updateSystemConfig,
} from "@/actions/admin";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save, Plus } from "lucide-react";
import { todayBrasilia } from "@/lib/date-utils";

type SystemConfig = {
  weeklyReductionPct: number;
  defaultDailyLimit: number;
  extraCost05: number;
  extraCost10: number;
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Ajuste as regras do sistema</p>
      </div>

      {/* Configurações gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Meta diária padrão</Label>
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
                />
                <p className="text-sm text-muted-foreground">
                  Limite de cigarros por dia quando não há meta específica
                </p>
              </div>
              <div className="space-y-2">
                <Label>Redução semanal (%)</Label>
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
                />
                <p className="text-sm text-muted-foreground">
                  % de redução da meta a cada semana
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Custo XP para 0.5 extra</Label>
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
                />
              </div>
              <div className="space-y-2">
                <Label>Custo XP para 1.0 extra</Label>
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
                />
              </div>
            </div>

            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar configurações
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Metas diárias */}
      <Card>
        <CardHeader>
          <CardTitle>Metas diárias específicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAddDayLimit} className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={newLimitDate}
                onChange={(e) => setNewLimitDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Meta (cigarros)</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={newLimitValue}
                onChange={(e) => setNewLimitValue(e.target.value)}
                className="w-28"
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Adicionar
            </Button>
          </form>

          {dayLimits.length > 0 && (
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Data
                    </th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                      Meta
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dayLimits.map((dl) => (
                    <tr key={dl.date} className="border-b last:border-0">
                      <td className="p-3">{dl.date}</td>
                      <td className="p-3 font-medium">
                        {dl.limit.toFixed(1).replace(".", ",")} cigarros
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
