import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav userName={session.user.name} />
      <main className="p-4 pb-24 md:ml-64 md:p-8 md:pb-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
