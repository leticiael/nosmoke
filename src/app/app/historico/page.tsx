"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserHistory } from "@/actions/history";
import { formatCouponCode } from "@/lib/coupon";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
        <Clock className="h-3 w-3 mr-1" />
        Pendente
      </Badge>
    );
  }
  if (status === "APPROVED" || status === "VALIDATED") {
    return (
      <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Aprovado
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
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
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center gap-3">
        <Image
          src="/images/soldadodfoof.png"
          alt="Histórico"
          width={40}
          height={40}
          className="[image-rendering:pixelated]"
        />
        <div>
          <h1 className="text-xl font-bold text-white">Histórico</h1>
          <p className="text-sm text-zinc-500">Seus pedidos e resgates</p>
        </div>
      </div>

      <Tabs defaultValue="cigarettes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-zinc-900 p-1">
          <TabsTrigger
            value="cigarettes"
            className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            <Image
              src="/images/cigarroapagado,.png"
              alt="Cigarros"
              width={16}
              height={16}
              className="[image-rendering:pixelated]"
            />
            Cigarros
          </TabsTrigger>
          <TabsTrigger
            value="rewards"
            className="gap-2 data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
          >
            <Image
              src="/images/pocaomarrom1.png"
              alt="Resgates"
              width={16}
              height={16}
              className="[image-rendering:pixelated]"
            />
            Resgates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cigarettes" className="mt-4 space-y-3">
          {cigarettes.length === 0 ? (
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="py-12 text-center">
                <Image
                  src="/images/cigarroapagado,.png"
                  alt="Nenhum pedido"
                  width={48}
                  height={48}
                  className="[image-rendering:pixelated] mx-auto mb-4 opacity-50"
                />
                <p className="text-zinc-500">Nenhum pedido ainda</p>
              </CardContent>
            </Card>
          ) : (
            cigarettes.map((cig) => (
              <Card key={cig.id} className="border-0 bg-zinc-900/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                        <Image
                          src="/images/cigarroaceso.png"
                          alt="Cigarro"
                          width={24}
                          height={24}
                          className="[image-rendering:pixelated]"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {cig.amount === 0.5 ? "½ cigarro" : "1 cigarro"}
                        </p>
                        <p className="text-sm text-zinc-500">{cig.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={cig.status} />
                      <p className="text-xs text-zinc-600 mt-1">
                        {formatDate(cig.createdAt)}
                      </p>
                    </div>
                  </div>
                  {cig.couponCode && cig.status === "PENDING" && (
                    <Link
                      href={`/app/cupom/${cig.couponCode}`}
                      className="block mt-3 text-center text-sm text-violet-400 hover:text-violet-300"
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
            <Card className="border-0 bg-zinc-900/80">
              <CardContent className="py-12 text-center">
                <Image
                  src="/images/pocaomarrom1.png"
                  alt="Nenhum resgate"
                  width={48}
                  height={48}
                  className="[image-rendering:pixelated] mx-auto mb-4 opacity-50"
                />
                <p className="text-zinc-500">Nenhum resgate ainda</p>
              </CardContent>
            </Card>
          ) : (
            rewards.map((reward) => (
              <Card key={reward.id} className="border-0 bg-zinc-900/80">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                        <Image
                          src="/images/pocaomarrom1.png"
                          alt="Recompensa"
                          width={24}
                          height={24}
                          className="[image-rendering:pixelated]"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {reward.rewardTitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={reward.status} />
                      <p className="text-xs text-zinc-600 mt-1">
                        {formatDate(reward.createdAt)}
                      </p>
                    </div>
                  </div>
                  {reward.couponCode && reward.status === "PENDING" && (
                    <Link
                      href={`/app/cupom/${reward.couponCode}`}
                      className="block mt-3 text-center text-sm text-violet-400 hover:text-violet-300"
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
