"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ClipboardCheck,
  Gift,
  Settings,
  LogOut,
  Menu,
  X,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/validar", label: "Validar", icon: QrCode },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardCheck },
  { href: "/admin/recompensas", label: "Recompensas", icon: Gift },
  { href: "/admin/config", label: "Config", icon: Settings },
];

export function AdminNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Header fixo no mobile */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/images/letfeliz.png"
              alt="Admin"
              width={28}
              height={28}
              className="[image-rendering:pixelated]"
            />
            <span className="font-bold text-lg text-violet-400">Admin</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Menu dropdown mobile */}
        {mobileMenuOpen && (
          <nav className="border-t border-zinc-800 bg-zinc-950 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-violet-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-zinc-400 hover:text-white hover:bg-zinc-800"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </nav>
        )}
      </header>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/80 md:hidden">
        <div className="flex justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors",
                  isActive ? "text-violet-400" : "text-zinc-500",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sidebar desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-zinc-800 bg-zinc-900">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-zinc-800 px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/images/letfeliz.png"
                alt="Admin"
                width={32}
                height={32}
                className="[image-rendering:pixelated]"
              />
              <span className="text-xl font-bold text-white">NoSmoke</span>
              <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded">
                Admin
              </span>
            </Link>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                    isActive
                      ? "bg-violet-600 text-white"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="border-t border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-violet-500/20 flex items-center justify-center">
                <span className="text-sm font-medium text-violet-400">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-zinc-500">Admin</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-white hover:bg-zinc-800"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop sidebar */}
      <div className="hidden md:block md:w-64" />
    </>
  );
}
