"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  getPendingRequestsAdmin,
  getPendingRedemptionsAdmin,
  approveOrRejectRequest,
  validateOrRejectRedemption,
  getAdminDashboardStats,
} from "@/actions/admin";
import { useToast } from "@/components/ui/use-toast";
import {
  Cigarette,
  Gift,
  Check,
  X,
  Loader2,
  ClipboardList,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

type PendingRequest = {
  id: string;
  userName: string;
  amount: number;
  reason1: string;
  reason2: string;
  createdAt: string;
  dateBr: string;
};

type PendingRedemption = {
  id: string;
  userName: string;
  rewardTitle: string;
  costXp: number;
  createdAt: string;
  dateBr: string;
};

type Stats = {
  pendingRequests: number;
  pendingRedemptions: number;
  todayTotal: number;
  todayLimit: number;
  todayApproved: number;
  todayRejected: number;
};

export default function AdminPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [redemptions, setRedemptions] = useState<PendingRedemption[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const loadData = async () => {
    const [reqData, redemData, statsData] = await Promise.all([
      getPendingRequestsAdmin(),
      getPendingRedemptionsAdmin(),
      getAdminDashboardStats(),
    ]);
    setRequests(reqData);
    setRedemptions(redemData);
    setStats(statsData);
  };

  useEffect(() => {
    loadData();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestAction = async (
    requestId: string,
    action: "approve" | "reject",
  ) => {
    setPendingId(requestId);

    const formData = new FormData();
    formData.set("requestId", requestId);
    formData.set("action", action);

    startTransition(async () => {
      const result = await approveOrRejectRequest(formData);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: action === "approve" ? "Entregue! ✓" : "Recusado",
          description:
            action === "approve"
              ? "Pedido aprovado e entregue"
              : "Pedido recusado",
          variant: action === "approve" ? "success" : "default",
        });
        await loadData();
      }

      setPendingId(null);
    });
  };

  const handleRedemptionAction = async (
    redemptionId: string,
    action: "validate" | "reject",
  ) => {
    setPendingId(redemptionId);

    const formData = new FormData();
    formData.set("redemptionId", redemptionId);
    formData.set("action", action);

    startTransition(async () => {
      const result = await validateOrRejectRedemption(formData);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: action === "validate" ? "Validado! ✓" : "Recusado",
          description:
            action === "validate"
              ? "Recompensa validada"
              : "Resgate recusado, XP devolvido",
          variant: action === "validate" ? "success" : "default",
        });
        await loadData();
      }

      setPendingId(null);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
        <p className="text-zinc-500">Gerencie pedidos e recompensas</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 bg-zinc-900/80">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Pendentes
              </p>
              <p className="text-2xl font-bold text-white">
                {stats.pendingRequests}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-zinc-900/80">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Hoje
              </p>
              <p className="text-2xl font-bold text-white">
                {formatNumber(stats.todayTotal)}/
                {formatNumber(stats.todayLimit)}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-zinc-900/80">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Aprovados
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {stats.todayApproved}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 bg-zinc-900/80">
            <CardContent className="p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Resgates
              </p>
              <p className="text-2xl font-bold text-violet-400">
                {stats.pendingRedemptions}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="requests">
        <TabsList className="bg-zinc-900 p-1">
          <TabsTrigger
            value="requests"
            className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            <Cigarette className="h-4 w-4" />
            Pedidos ({requests.length})
          </TabsTrigger>
          <TabsTrigger
            value="redemptions"
            className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            <Gift className="h-4 w-4" />
            Resgates ({redemptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-3 mt-4">
          {requests.length === 0 ? (
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 mb-4 text-zinc-700" />
                <p className="text-zinc-500">Nenhum pedido pendente</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className="border-0 bg-zinc-900/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={
                            request.amount === 1
                              ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }
                        >
                          {request.amount === 1 ? "1" : "½"}
                        </Badge>
                        <div className="min-w-0">
                          <p className="font-medium text-white truncate">
                            {request.userName}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {request.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
                          {request.reason1}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-zinc-700 hover:bg-red-950 hover:text-red-400 hover:border-red-500/30"
                        onClick={() =>
                          handleRequestAction(request.id, "reject")
                        }
                        disabled={isPending && pendingId === request.id}
                      >
                        {isPending && pendingId === request.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() =>
                          handleRequestAction(request.id, "approve")
                        }
                        disabled={isPending && pendingId === request.id}
                      >
                        {isPending && pendingId === request.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Entregar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-3 mt-4">
          {redemptions.length === 0 ? (
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Gift className="h-12 w-12 mb-4 text-zinc-700" />
                <p className="text-zinc-500">Nenhum resgate pendente</p>
              </CardContent>
            </Card>
          ) : (
            redemptions.map((redemption) => (
              <Card key={redemption.id} className="border-0 bg-zinc-900/80">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-medium text-white truncate">
                        {redemption.rewardTitle}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {redemption.userName} • {redemption.createdAt}
                      </p>
                      <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                        {redemption.costXp} XP
                      </Badge>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-zinc-700 hover:bg-red-950 hover:text-red-400 hover:border-red-500/30"
                        onClick={() =>
                          handleRedemptionAction(redemption.id, "reject")
                        }
                        disabled={isPending && pendingId === redemption.id}
                      >
                        {isPending && pendingId === redemption.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() =>
                          handleRedemptionAction(redemption.id, "validate")
                        }
                        disabled={isPending && pendingId === redemption.id}
                      >
                        {isPending && pendingId === redemption.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="mr-2 h-4 w-4" />
                        )}
                        Validar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
