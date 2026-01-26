import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/bottom-nav";
import { UserHeader } from "@/components/user-header";
import { getUserXp } from "@/lib/calculations";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const xp = await getUserXp(session.user.id);

  return (
    <div className="min-h-screen bg-zinc-950">
      <UserHeader userName={session.user.name} xp={xp} />
      <main className="mx-auto max-w-lg md:max-w-4xl lg:max-w-6xl px-4 md:px-8 pb-24 md:pb-8 pt-6 md:pt-10">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
