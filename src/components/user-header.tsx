"use client";

import Image from "next/image";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface UserHeaderProps {
  userName: string;
  xp: number;
}

export function UserHeader({ userName, xp }: UserHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            src="/images/guerreiro1.png"
            alt="Avatar"
            width={36}
            height={36}
            className="[image-rendering:pixelated]"
          />
          <div>
            <p className="text-xs text-zinc-500">Olá,</p>
            <p className="font-semibold text-white text-sm">{userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1.5">
            <Image
              src="/images/pocaomarrom1.png"
              alt="XP"
              width={18}
              height={18}
              className="[image-rendering:pixelated]"
            />
            <span className="font-bold text-violet-400 text-sm">{xp}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
