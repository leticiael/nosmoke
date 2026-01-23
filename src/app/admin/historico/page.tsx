"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getHistoryAdmin } from "@/actions/admin";
import { cn, getStatusColor, translateStatus, formatNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  const loadData = async () => {
    const data = await getHistoryAdmin(page, 15);
    setRequests(data.requests);
    setTotalPages(data.pages);
    setTotal(data.total);
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico</h1>
          <p className="text-muted-foreground">{total} pedidos no total</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="APPROVED">Aprovados</SelectItem>
            <SelectItem value="REJECTED">Recusados</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Data/Hora
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Usuário
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Qtd
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Motivos
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-muted-foreground">
                    Entregue em
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b last:border-0">
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{request.dateBr}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.createdAt}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{request.userName}</td>
                    <td className="p-4">
                      <Badge
                        variant={request.amount === 1 ? "default" : "secondary"}
                      >
                        {request.amount === 1 ? "1" : "½"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {request.reason1}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {request.reason2}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(request.status)}>
                        {translateStatus(request.status)}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {request.approvedAt || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
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
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
