import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Desktop: add top padding for fixed nav */}
      <main className="mx-auto max-w-lg md:max-w-2xl lg:max-w-3xl px-4 md:px-6 pb-28 md:pb-8 pt-4 md:pt-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
