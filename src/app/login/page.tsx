"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou senha incorretos");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        window.location.href = "/";
        return;
      }

      setError("Erro ao fazer login");
      setIsLoading(false);
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <Image
              src="/images/guerreiro1.png"
              alt="NoSmoke"
              width={120}
              height={120}
              className="pixel-art pixel-glow animate-float"
            />
          </div>
          <h1 className="text-4xl rpg-title mb-2">NoSmoke</h1>
          <p className="rpg-subtitle">Sistema de Controle</p>
        </div>

        {/* Login Card */}
        <div className="rpg-card rpg-card-glow p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="rpg-subtitle">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 rounded-lg bg-secondary/50 border-primary/20 text-white placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="rpg-subtitle">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-12 rounded-lg bg-secondary/50 border-primary/20 text-white placeholder:text-muted-foreground focus:border-primary"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg rpg-badge-danger text-center text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rpg-button rounded-lg text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "ENTRAR"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-3 opacity-40">
            <Image src="/images/soldadodfoof.png" alt="" width={28} height={28} className="pixel-art" />
            <Image src="/images/healer.png" alt="" width={28} height={28} className="pixel-art" />
            <Image src="/images/guerreiro1.png" alt="" width={28} height={28} className="pixel-art" />
          </div>
        </div>
      </div>
    </div>
  );
}
