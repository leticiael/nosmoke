import { getPendingRequestsAdmin, getPendingRedemptionsAdmin } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AlertCircle, Clock, Check, Plus, Settings, History } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [pendingRequests, pendingRedemptions] = await Promise.all([
    getPendingRequestsAdmin(),
    getPendingRedemptionsAdmin(),
  ]);

  const totalPending = pendingRequests.length + pendingRedemptions.length;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Image
          src="/images/healer.png"
          alt="Admin"
          width={56}
          height={56}
          className="pixel-art glow-purple"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie solicitações e recompensas
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="glass-card glass-glow rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Pendentes</p>
            <p className="text-4xl font-bold text-white stat-number">{totalPending}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <Image
                src="/images/cigarroaceso.png"
                alt="Cigarros"
                width={32}
                height={32}
                className="pixel-art mx-auto mb-1"
              />
              <span className="text-lg font-bold text-white">{pendingRequests.length}</span>
              <p className="text-xs text-muted-foreground">Cigarros</p>
            </div>
            <div className="text-center">
              <Image
                src="/images/pocaomarrom1.png"
                alt="Resgates"
                width={32}
                height={32}
                className="pixel-art mx-auto mb-1"
              />
              <span className="text-lg font-bold text-white">{pendingRedemptions.length}</span>
              <p className="text-xs text-muted-foreground">Resgates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Validar */}
        <Link href="/admin/validar" className="block">
          <div className={`glass-card rounded-2xl p-4 hover:glass-glow transition-all ${totalPending > 0 ? "border-amber-500/30" : ""}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${totalPending > 0 ? "bg-amber-500/20" : "bg-muted/30"}`}>
                <AlertCircle className={`w-5 h-5 ${totalPending > 0 ? "text-amber-400" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Validar</p>
                <p className="text-xs text-muted-foreground">
                  {totalPending > 0 ? `${totalPending} pendentes` : "Nada pendente"}
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* Adicionar Cigarro */}
        <Link href="/admin/adicionar" className="block">
          <div className="glass-card rounded-2xl p-4 hover:glass-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Adicionar</p>
                <p className="text-xs text-muted-foreground">Cigarro manual</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Histórico */}
        <Link href="/admin/historico" className="block">
          <div className="glass-card rounded-2xl p-4 hover:glass-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <History className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Histórico</p>
                <p className="text-xs text-muted-foreground">Ver todos</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Configurações */}
        <Link href="/admin/config" className="block">
          <div className="glass-card rounded-2xl p-4 hover:glass-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Config</p>
                <p className="text-xs text-muted-foreground">Sistema</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Image
            src="/images/cigarroaceso.png"
            alt="Cigarros"
            width={24}
            height={24}
            className="pixel-art"
          />
          <h2 className="text-lg font-bold text-white">Pedidos de Cigarro</h2>
          {pendingRequests.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-0">
              {pendingRequests.length}
            </Badge>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Check className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
            <p className="text-muted-foreground">Nenhum pedido pendente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                    <Image
                      src="/images/cigarroaceso.png"
                      alt="Cigarro"
                      width={28}
                      height={28}
                      className="pixel-art"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{req.userName}</p>
                      <Badge className="bg-amber-500/20 text-amber-400 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {req.amount === 0.5 ? "½ cigarro" : `${req.amount} cigarro`} • {req.reason1}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {req.dateBr}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {pendingRequests.length > 5 && (
              <Link href="/admin/validar">
                <div className="glass-card rounded-2xl p-4 text-center hover:glass-glow transition-all">
                  <p className="text-primary font-medium">
                    Ver todos ({pendingRequests.length})
                  </p>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Pending Redemptions */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Image
            src="/images/pocaomarrom1.png"
            alt="Resgates"
            width={24}
            height={24}
            className="pixel-art"
          />
          <h2 className="text-lg font-bold text-white">Resgates de Recompensa</h2>
          {pendingRedemptions.length > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-0">
              {pendingRedemptions.length}
            </Badge>
          )}
        </div>

        {pendingRedemptions.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Check className="w-12 h-12 mx-auto mb-3 text-emerald-400" />
            <p className="text-muted-foreground">Nenhum resgate pendente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRedemptions.slice(0, 5).map((red) => (
              <div key={red.id} className="glass-card rounded-2xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 glass rounded-xl flex items-center justify-center">
                    <Image
                      src="/images/pocaomarrom1.png"
                      alt="Recompensa"
                      width={28}
                      height={28}
                      className="pixel-art"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-white">{red.userName}</p>
                      <Badge className="bg-amber-500/20 text-amber-400 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Pendente
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {red.rewardTitle}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {red.dateBr}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {pendingRedemptions.length > 5 && (
              <Link href="/admin/validar">
                <div className="glass-card rounded-2xl p-4 text-center hover:glass-glow transition-all">
                  <p className="text-primary font-medium">
                    Ver todos ({pendingRedemptions.length})
                  </p>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 space-y-2">
        <Image
          src="/images/girl.png"
          alt="NoSmoke"
          width={48}
          height={48}
          className="pixel-art mx-auto animate-float"
        />
        <p className="text-sm text-muted-foreground">
          Ajudando na jornada da Letícia 💜
        </p>
      </div>
    </div>
  );
}
