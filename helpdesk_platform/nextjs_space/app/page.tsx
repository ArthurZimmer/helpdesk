import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    const role = (session.user as any)?.role;
    if (role === "AGENTE") {
      redirect("/agente");
    } else {
      redirect("/cliente");
    }
  }

  redirect("/login");
}
