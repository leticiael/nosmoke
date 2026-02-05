"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHistoryAdmin } from "@/actions/admin";
import { cn, getStatusColor, translateStatus } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Image from "next/image";

type HistoryRequest = {
  id: string;
  userName: string;
  amount: number;
  reason1: string;
  reason2: string;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  dateBr: string;
};

export default function HistoricoPage() {
  const [requests, setRequests] = useState<HistoryRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await getHistoryAdmin(page, 15);
    setRequests(data.requests);
    setTotalPages(data.pages);
    setTotal(data.total);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "VALIDATED":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-0">
            Aprovado
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-0">
            Pendente
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-0">
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-white/10 text-muted-foreground border-0">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/images/historico.png"
            alt="Histórico"
            width={56}
            height={56}
            className="pixel-art glow-gold"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Histórico</h1>
            <p className="text-sm text-muted-foreground">{total} pedidos no total</p>
          </div>
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 glass border-white/10">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent className="glass-dark border-white/10">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="APPROVED">Aprovados</SelectItem>
            <SelectItem value="REJECTED">Recusados</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Image
            src="/images/girl.png"
            alt="Carregando"
            width={48}
            height={48}
            className="pixel-art mx-auto animate-float mb-4"
          />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Image
            src="/images/cigarroapagado.png"
            alt="Vazio"
            width={48}
            height={48}
            className="pixel-art mx-auto mb-4 opacity-50"
          />
          <p className="text-muted-foreground">Nenhum registro encontrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={cn(
                "glass-card rounded-2xl p-4 transition-all",
                request.status === "APPROVED" && "glass-success",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center shrink-0">
                  <Image
                    src={
                      request.status === "APPROVED" || request.status === "VALIDATED"
                        ? "/images/cigarroaceso.png"
                        : "/images/cigarroapagado.png"
                    }
                    alt={request.status}
                    width={28}
                    height={28}
                    className="pixel-art"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="font-semibold text-white">{request.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.amount === 0.5 ? "½" : request.amount} cigarro
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs border-white/10">
                      {request.reason1}
                    </Badge>
                    {request.reason2 !== request.reason1 && (
                      <Badge variant="outline" className="text-xs border-white/10">
                        {request.reason2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                    <span>{request.dateBr}</span>
                    {request.approvedAt && (
                      <span>Entregue: {request.approvedAt}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="glass border-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="glass border-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
