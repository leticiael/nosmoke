"use client";

import Image from "next/image";
import { LogOut, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface UserHeaderProps {
  userName: string;
  xp: number;
}

export function UserHeader({ userName, xp }: UserHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80">
      <div className="mx-auto flex h-16 md:h-20 max-w-lg md:max-w-4xl lg:max-w-6xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Image
            src="/images/guerreiro1.png"
            alt="Avatar"
            width={56}
            height={56}
            className="[image-rendering:pixelated]"
          />
          <div>
            <p className="text-sm text-zinc-500">Olá,</p>
            <p className="font-bold text-white text-xl">{userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-teal-500/20 px-4 py-2">
            <Image
              src="/images/hearth.png"
              alt="XP"
              width={24}
              height={24}
              className="[image-rendering:pixelated]"
            />
            <span className="font-bold text-teal-400 text-base">{xp}</span>
          </div>
          <Link href="/app/como-funciona">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-zinc-800"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </Link>
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
