"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { ChevronUp } from "lucide-react";

const mainNavItems = [
  { href: "/app", label: "Início", image: "/images/hearth.png" },
  { href: "/app/missoes", label: "Missões", image: "/images/soldadodfoof.png" },
  { href: "/app/pedir", label: "Pedir", image: "/images/cigarroaceso.png", isMain: true },
  { href: "/app/loja", label: "Loja", image: "/images/pocaomarrom1.png" },
];

const moreItems = [
  { href: "/app/historico", label: "Histórico", image: "/images/bau.png" },
  { href: "/app/progresso", label: "Status", image: "/images/trophy.png" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [showMore, setShowMore] = useState(false);

  const isMoreActive = moreItems.some((item) => pathname === item.href);

  return (
    <>
      {/* Submenu */}
      {showMore && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setShowMore(false)}
          />
          <div className="fixed bottom-20 right-4 z-50 md:hidden">
            <div className="glass-card overflow-hidden">
              {moreItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex items-center gap-3 px-5 py-4 transition-colors border-b border-white/5 last:border-0",
                      isActive 
                        ? "bg-white/5 text-emerald-400" 
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <Image
                      src={item.image}
                      alt={item.label}
                      width={24}
                      height={24}
                      className={cn("pixel-art", isActive && "glow-green")}
                    />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass-dark border-t border-white/5">
          <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
            {mainNavItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.isMain) {
                return (
                  <Link key={item.href} href={item.href} className="relative -mt-5">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                      "bg-gradient-to-b from-[#0a5a5a] to-[#044040]",
                      "border-2 border-[#0a7a7a]/50",
                      "shadow-lg shadow-[#044040]/40",
                      isActive && "scale-110 shadow-[#044040]/60"
                    )}>
                      <Image
                        src={item.image}
                        alt={item.label}
                        width={26}
                        height={26}
                        className="pixel-art"
                      />
                    </div>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all",
                    isActive ? "text-emerald-400" : "text-white/30"
                  )}
                >
                  <Image
                    src={item.image}
                    alt={item.label}
                    width={22}
                    height={22}
                    className={cn(
                      "pixel-art transition-all",
                      isActive ? "glow-green opacity-100" : "opacity-40"
                    )}
                  />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}

            <button
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all",
                showMore || isMoreActive ? "text-emerald-400" : "text-white/30"
              )}
            >
              <div className={cn(
                "w-6 h-6 flex items-center justify-center transition-transform",
                showMore && "rotate-180"
              )}>
                <ChevronUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">Mais</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Desktop Nav */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
        <div className="mx-auto max-w-4xl flex h-14 items-center justify-between px-6">
          <Link href="/app" className="flex items-center gap-3">
            <Image
              src="/images/guerreiro1.png"
              alt="NoSmoke"
              width={32}
              height={32}
              className="pixel-art glow-green"
            />
            <span className="text-base font-bold text-white">NoSmoke</span>
          </Link>

          <div className="flex items-center gap-1">
            {[...mainNavItems, ...moreItems].map((item) => {
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-white/5 text-emerald-400"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={18}
                    height={18}
                    className={cn("pixel-art", isActive && "glow-green")}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
