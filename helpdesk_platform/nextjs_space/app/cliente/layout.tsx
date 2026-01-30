import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { ClienteHeader } from "./_components/cliente-header";

export default async function ClienteLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as any;
  if (user.role === "AGENTE") {
    redirect("/agente");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClienteHeader user={user} />
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
