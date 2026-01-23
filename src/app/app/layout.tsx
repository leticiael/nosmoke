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
    <div className="min-h-screen bg-background">
      <UserHeader userName={session.user.name} xp={xp} />
      <main className="mx-auto max-w-lg px-4 pb-24 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
