import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { AgenteTicketView } from "./_components/agente-ticket-view";

export default async function AgenteTicketPage({
  params
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    notFound();
  }

  const user = session.user as any;
  if (user.role !== "AGENTE") {
    notFound();
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true, tipoCliente: true, planoCliente: true } },
      agente: { select: { id: true, nome: true, email: true } },
      messages: {
        include: {
          cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true } },
          agente: { select: { id: true, nome: true, email: true } }
        },
        orderBy: { createdAt: "asc" }
      },
      attachment: true
    }
  });

  if (!ticket) {
    notFound();
  }

  return <AgenteTicketView ticket={ticket as any} currentUser={user} />;
}
