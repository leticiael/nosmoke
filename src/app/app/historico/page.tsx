"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserHistory } from "@/actions/history";
import { formatCouponCode } from "@/lib/coupon";
import {
  Cigarette,
  Gift,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type CigHistory = {
  id: string;
  amount: number;
  reason: string;
  status: string;
  couponCode: string | null;
  createdAt: string;
  dateBr: string;
};

type RewardHistory = {
  id: string;
  rewardTitle: string;
  status: string;
  couponCode: string | null;
  createdAt: string;
  dateBr: string;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "PENDING") {
    return (
      <Badge
        variant="outline"
        className="bg-amber-500/10 text-amber-500 border-amber-500/30"
      >
        <Clock className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
    );
  }
  if (status === "APPROVED" || status === "VALIDATED") {
    return (
      <Badge
        variant="outline"
        className="bg-green-500/10 text-green-500 border-green-500/30"
      >
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Aprovado
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="bg-red-500/10 text-red-500 border-red-500/30"
    >
      <XCircle className="h-3 w-3 mr-1" />
      Rejeitado
    </Badge>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoricoPage() {
  const [loading, setLoading] = useState(true);
  const [cigarettes, setCigarettes] = useState<CigHistory[]>([]);
  const [rewards, setRewards] = useState<RewardHistory[]>([]);

  useEffect(() => {
    getUserHistory().then((data) => {
      setCigarettes(data.cigarettes);
      setRewards(data.rewards);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Histórico</h1>
        <p className="text-muted-foreground">Seus pedidos e resgates</p>
      </div>

      <Tabs defaultValue="cigarettes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cigarettes" className="gap-2">
            <Cigarette className="h-4 w-4" />
            Cigarros
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Gift className="h-4 w-4" />
            Resgates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cigarettes" className="mt-4 space-y-3">
          {cigarettes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Cigarette className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum pedido ainda</p>
            </div>
          ) : (
            cigarettes.map((cig) => (
              <Card key={cig.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <Cigarette className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {cig.amount === 0.5 ? "½ cigarro" : "1 cigarro"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {cig.reason}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={cig.status} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(cig.createdAt)}
                      </p>
                    </div>
                  </div>
                  {cig.couponCode && cig.status === "PENDING" && (
                    <Link
                      href={`/app/cupom/${cig.couponCode}`}
                      className="block mt-3 text-center text-sm text-primary hover:underline"
                    >
                      Ver cupom: {formatCouponCode(cig.couponCode)}
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="rewards" className="mt-4 space-y-3">
          {rewards.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum resgate ainda</p>
            </div>
          ) : (
            rewards.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{reward.rewardTitle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={reward.status} />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(reward.createdAt)}
                      </p>
                    </div>
                  </div>
                  {reward.couponCode && reward.status === "PENDING" && (
                    <Link
                      href={`/app/cupom/${reward.couponCode}`}
                      className="block mt-3 text-center text-sm text-primary hover:underline"
                    >
                      Ver cupom: {formatCouponCode(reward.couponCode)}
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
