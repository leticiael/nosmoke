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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Painel Admin</h1>
        <p className="text-muted-foreground">Gerencie pedidos e recompensas</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold">{stats.pendingRequests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Hoje</p>
              <p className="text-2xl font-bold">
                {formatNumber(stats.todayTotal)}/
                {formatNumber(stats.todayLimit)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Aprovados hoje</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.todayApproved}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Resgates</p>
              <p className="text-2xl font-bold">{stats.pendingRedemptions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests" className="gap-2">
            <Cigarette className="h-4 w-4" />
            Pedidos ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="redemptions" className="gap-2">
            <Gift className="h-4 w-4" />
            Resgates ({redemptions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4 mt-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum pedido pendente</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            request.amount === 1 ? "default" : "secondary"
                          }
                          className="text-lg px-3 py-1"
                        >
                          {request.amount === 1 ? "1" : "½"}
                        </Badge>
                        <div>
                          <p className="font-medium">{request.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.createdAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{request.reason1}</Badge>
                        <Badge variant="outline">{request.reason2}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
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
                        variant="success"
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

        <TabsContent value="redemptions" className="space-y-4 mt-6">
          {redemptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Gift className="h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum resgate pendente</p>
              </CardContent>
            </Card>
          ) : (
            redemptions.map((redemption) => (
              <Card key={redemption.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{redemption.rewardTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {redemption.userName} • {redemption.createdAt}
                      </p>
                      <Badge variant="secondary">{redemption.costXp} XP</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
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
                        variant="success"
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
