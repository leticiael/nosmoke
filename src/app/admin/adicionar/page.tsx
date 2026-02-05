"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  getAllUsersAdmin,
  getUserXpAdmin,
  addManualCigRecord,
} from "@/actions/admin";
import { ArrowLeft, Loader2, Flame, Calendar, User, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type UserOption = {
  id: string;
  name: string;
  email: string;
};

export default function AdicionarCigarroPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userXp, setUserXp] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [amount, setAmount] = useState<"0.5" | "1">("1");
  const [xpCost, setXpCost] = useState("30");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsersAdmin().then((data) => {
      setUsers(data);
      setLoading(false);
    });

    // Define data padrão como hoje
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      getUserXpAdmin(selectedUserId).then((xp) => {
        setUserXp(typeof xp === "number" ? xp : Number(xp));
      });
    } else {
      setUserXp(null);
    }
  }, [selectedUserId]);

  // Atualiza XP sugerido baseado na quantidade
  useEffect(() => {
    setXpCost(amount === "0.5" ? "15" : "30");
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId || !date || !amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.set("userId", selectedUserId);
    formData.set("date", date);
    formData.set("amount", amount);
    formData.set("xpCost", xpCost);
    formData.set("note", note);

    startTransition(async () => {
      const result = await addManualCigRecord(formData);

      if (result.error) {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso! 🎉",
          description: "Cigarro registrado com sucesso",
        });
        // Limpa o formulário
        setNote("");
        // Atualiza XP do usuário
        if (selectedUserId) {
          getUserXpAdmin(selectedUserId).then((xp) => {
            setUserXp(typeof xp === "number" ? xp : Number(xp));
          });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Image
          src="/images/girl.png"
          alt="Carregando"
          width={80}
          height={80}
          className="pixel-art pixel-glow animate-float"
        />
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-xl border border-border/50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Image
            src="/images/cigarroaceso.png"
            alt="Adicionar"
            width={40}
            height={40}
            className="pixel-art pixel-glow"
          />
          <div>
            <h1 className="text-xl font-bold text-white">Adicionar Cigarro</h1>
            <p className="text-xs text-muted-foreground">Registro manual</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Usuário */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              Usuário
            </span>
          </div>

          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="glass-input">
              <SelectValue placeholder="Selecione o usuário" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedUser && userXp !== null && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
              <span className="text-sm text-muted-foreground">XP atual</span>
              <div className="flex items-center gap-2">
                <Image src="/images/hearth.png" alt="XP" width={18} height={18} className="pixel-art" />
                <span className="font-bold text-primary text-lg">{userXp}</span>
              </div>
            </div>
          )}
        </div>

        {/* Data e Quantidade */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              Detalhes
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="glass-input"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Quantidade</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAmount("0.5")}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  amount === "0.5"
                    ? "bg-primary/20 border-primary"
                    : "bg-muted/30 border-border/50 hover:border-border"
                }`}
              >
                <Image
                  src="/images/cigarroapagado.png"
                  alt=""
                  width={32}
                  height={32}
                  className="pixel-art"
                />
                <span className={`text-2xl font-bold ${amount === "0.5" ? "text-primary" : "text-white"}`}>
                  ½
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAmount("1")}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  amount === "1"
                    ? "bg-primary/20 border-primary"
                    : "bg-muted/30 border-border/50 hover:border-border"
                }`}
              >
                <Image
                  src="/images/cigarroaceso.png"
                  alt=""
                  width={32}
                  height={32}
                  className="pixel-art"
                />
                <span className={`text-2xl font-bold ${amount === "1" ? "text-primary" : "text-white"}`}>
                  1
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* XP e Nota */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              XP & Observação
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">XP a descontar</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={xpCost}
                onChange={(e) => setXpCost(e.target.value)}
                min="0"
                className="glass-input"
              />
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-500/20 border border-rose-500/30">
                <Image src="/images/hearth.png" alt="" width={16} height={16} className="pixel-art" />
                <span className="text-rose-400 font-semibold">-{xpCost}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Sugestão: 15 XP para ½, 30 XP para 1 inteiro
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Observação (opcional)</Label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Fumou no almoço"
              className="glass-input"
            />
          </div>
        </div>

        {/* Resumo e Submit */}
        {selectedUser && (
          <div className="glass-card glass-card-glow p-5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white uppercase tracking-wider">
                Resumo
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Usuário</span>
                <span className="text-white font-medium">{selectedUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data</span>
                <span className="text-white font-medium">
                  {date.split("-").reverse().join("/")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantidade</span>
                <span className="text-white font-medium">
                  {amount === "0.5" ? "½ cigarro" : "1 cigarro"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desconto XP</span>
                <span className="text-rose-400 font-bold">-{xpCost} XP</span>
              </div>
              {userXp !== null && (
                <div className="flex justify-between pt-2 border-t border-border/30">
                  <span className="text-muted-foreground">XP após</span>
                  <span className="text-primary font-bold">
                    {Math.max(0, userXp - parseInt(xpCost || "0", 10))} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full h-14 text-lg rounded-xl rpg-button"
          disabled={isPending || !selectedUserId || !date}
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Registrando...
            </>
          ) : (
            <>
              <Flame className="w-5 h-5 mr-2" />
              Registrar Cigarro
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
