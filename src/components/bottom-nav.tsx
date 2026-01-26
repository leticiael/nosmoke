"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

const navItems = [
  { href: "/app", label: "Início", image: "/images/hearth.png" },
  { href: "/app/pedir", label: "Pedir", image: "/images/cigarroaceso.png" },
  { href: "/app/missoes", label: "Missões", image: "/images/soldadodfoof.png" },
  { href: "/app/loja", label: "Loja", image: "/images/pocaomarrom1.png" },
  {
    href: "/app/historico",
    label: "Histórico",
    image: "/images/historico.png",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 md:hidden">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 text-xs transition-all",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-colors",
                  isActive && "bg-teal-500/20",
                )}
              >
                <Image
                  src={item.image}
                  alt={item.label}
                  width={24}
                  height={24}
                  className={cn(
                    "[image-rendering:pixelated] transition-opacity",
                    !isActive && "opacity-50",
                  )}
                />
              </div>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
